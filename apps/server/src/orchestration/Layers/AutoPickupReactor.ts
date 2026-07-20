import { CommandId, MessageId } from "@t3tools/contracts";
import * as Clock from "effect/Clock";
import * as Crypto from "effect/Crypto";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import * as Schedule from "effect/Schedule";

import * as AccountRateLimitsStore from "../../provider/AccountRateLimitsStore.ts";
import {
  ProjectionThreadRepository,
  type ProjectionThread,
} from "../../persistence/Services/ProjectionThreads.ts";
import { OrchestrationEngineService } from "../Services/OrchestrationEngine.ts";
import { ServerSettingsService } from "../../serverSettings.ts";
import { AutoPickupReactor, type AutoPickupReactorShape } from "../Services/AutoPickupReactor.ts";

const FIVE_HOUR_MS = 5 * 60 * 60 * 1000;
const DEFAULT_USAGE_THRESHOLD_PERCENT = 50;
const DEFAULT_INTERVAL_MINUTES = 10;

const makeAutoPickupReactor = Effect.gen(function* () {
  const accountRateLimitsStore = yield* AccountRateLimitsStore.AccountRateLimitsStore;
  const projectionThreadRepository = yield* ProjectionThreadRepository;
  const orchestrationEngine = yield* OrchestrationEngineService;
  const serverSettings = yield* ServerSettingsService;
  const crypto = yield* Crypto.Crypto;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const settings = yield* serverSettings.getSettings.pipe(
    Effect.catch((error) =>
      Effect.logWarning("orchestration.auto-pickup.settings-read-failed", {
        operation: error.operation,
        cause: error.cause,
      }).pipe(Effect.as(undefined)),
    ),
  );

  const usageThresholdPercent =
    settings?.autoPickup.usageThresholdPercent ?? DEFAULT_USAGE_THRESHOLD_PERCENT;
  const intervalMs = Math.max(
    1,
    Math.round((settings?.autoPickup.intervalMinutes ?? DEFAULT_INTERVAL_MINUTES) * 60_000),
  );

  const isAllowed = (
    snapshot: Option.Option<AccountRateLimitsStore.AccountRateLimitSnapshot>,
    nowMs: number,
  ): boolean => {
    if (Option.isNone(snapshot)) {
      return true;
    }
    const latest = snapshot.value;
    const observedMs = Date.parse(latest.observedAt);
    if (Number.isNaN(observedMs) || nowMs - observedMs >= FIVE_HOUR_MS) {
      return true;
    }
    if (latest.utilization === null) {
      return true;
    }
    return latest.utilization < usageThresholdPercent;
  };

  const nextId = <A>(make: (value: string) => A) =>
    crypto.randomUUIDv4.pipe(Effect.orDie, Effect.map(make));

  const pickup = (thread: ProjectionThread) =>
    Effect.gen(function* () {
      const createdAt = DateTime.formatIso(yield* DateTime.now);

      yield* orchestrationEngine.dispatch({
        type: "thread.auto-pickup.set",
        commandId: yield* nextId(CommandId.make),
        threadId: thread.threadId,
        autoPickupState: "picked",
        createdAt,
      });

      yield* orchestrationEngine.dispatch({
        type: "thread.turn.start",
        commandId: yield* nextId(CommandId.make),
        threadId: thread.threadId,
        message: {
          messageId: yield* nextId(MessageId.make),
          role: "user",
          text: `Read specs/${thread.threadId}.md in this worktree and implement it.`,
          attachments: [],
        },
        modelSelection: thread.modelSelection,
        runtimeMode: thread.runtimeMode,
        interactionMode: thread.interactionMode,
        createdAt,
      });

      yield* Effect.logInfo("orchestration.auto-pickup.picked", {
        threadId: thread.threadId,
      });
    });

  const tick = Effect.gen(function* () {
    const snapshot = yield* accountRateLimitsStore.getLatest({
      provider: "claudeAgent",
      rateLimitType: "five_hour",
    });
    const nowMs = yield* Clock.currentTimeMillis;

    if (!isAllowed(snapshot, nowMs)) {
      yield* Effect.logDebug("orchestration.auto-pickup.blocked", {
        utilization: Option.match(snapshot, {
          onNone: () => null,
          onSome: (latest) => latest.utilization,
        }),
        usageThresholdPercent,
      });
      return;
    }

    const queued = yield* projectionThreadRepository.listQueuedForAutoPickup();

    for (const thread of queued) {
      if (thread.worktreePath === null) {
        yield* Effect.logInfo("orchestration.auto-pickup.skipped-null-worktree", {
          threadId: thread.threadId,
        });
        continue;
      }

      const specPath = path.join(thread.worktreePath, "specs", `${thread.threadId}.md`);
      const specExists = yield* fs.exists(specPath).pipe(Effect.orElseSucceed(() => false));
      if (!specExists) {
        yield* Effect.logWarning("orchestration.auto-pickup.skipped-missing-spec", {
          threadId: thread.threadId,
          specPath,
        });
        continue;
      }

      yield* pickup(thread);
      return;
    }
  });

  const start: AutoPickupReactorShape["start"] = () =>
    Effect.gen(function* () {
      yield* Effect.forkScoped(
        tick.pipe(
          Effect.catch((error: unknown) =>
            Effect.logWarning("orchestration.auto-pickup.tick-failed", {
              error,
            }),
          ),
          Effect.catchDefect((defect: unknown) =>
            Effect.logWarning("orchestration.auto-pickup.tick-defect", {
              defect,
            }),
          ),
          Effect.repeat(Schedule.spaced(Duration.millis(intervalMs))),
        ),
      );

      yield* Effect.logInfo("orchestration.auto-pickup.started", {
        usageThresholdPercent,
        intervalMs,
      });
    });

  return {
    start,
  } satisfies AutoPickupReactorShape;
});

export const AutoPickupReactorBaseLive = Layer.effect(AutoPickupReactor, makeAutoPickupReactor);

export const AutoPickupReactorLive = AutoPickupReactorBaseLive.pipe(
  Layer.provide(AccountRateLimitsStore.layer),
);
