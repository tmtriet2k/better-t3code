import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import {
  ProjectId,
  ProviderInstanceId,
  ThreadId,
  type OrchestrationCommand,
} from "@t3tools/contracts";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";

import * as AccountRateLimitsStore from "../../provider/AccountRateLimitsStore.ts";
import {
  ProjectionThreadRepository,
  type ProjectionThread,
} from "../../persistence/Services/ProjectionThreads.ts";
import * as ServerSettings from "../../serverSettings.ts";
import { OrchestrationEngineService } from "../Services/OrchestrationEngine.ts";
import { AutoPickupReactor } from "../Services/AutoPickupReactor.ts";
import { AutoPickupReactorBaseLive } from "./AutoPickupReactor.ts";

const modelSelection = {
  instanceId: ProviderInstanceId.make("claudeAgent"),
  model: "claude-sonnet",
} as const;

const NOW = "2026-01-01T00:00:00.000Z";
const FIVE_HOUR_MS = 5 * 60 * 60 * 1000;

function makeThread(id: string, overrides: Partial<ProjectionThread> = {}): ProjectionThread {
  return {
    threadId: ThreadId.make(id),
    projectId: ProjectId.make("project-auto-pickup"),
    title: `Thread ${id}`,
    modelSelection,
    runtimeMode: "full-access",
    autoPickupState: "queued",
    autoPickedUpAt: null,
    interactionMode: "default",
    branch: null,
    worktreePath: "/tmp/auto-pickup/worktree",
    latestTurnId: null,
    createdAt: NOW,
    updatedAt: NOW,
    archivedAt: null,
    latestUserMessageAt: null,
    pendingApprovalCount: 0,
    pendingUserInputCount: 0,
    hasActionableProposedPlan: 0,
    deletedAt: null,
    ...overrides,
  };
}

function makeSnapshot(
  overrides: Partial<AccountRateLimitsStore.AccountRateLimitSnapshot> = {},
): AccountRateLimitsStore.AccountRateLimitSnapshot {
  return {
    provider: "claudeAgent",
    rateLimitType: "five_hour",
    utilization: 10,
    resetsAt: null,
    status: "active",
    observedAt: NOW,
    ...overrides,
  };
}

function makeHarness(input: {
  readonly snapshot: Option.Option<AccountRateLimitsStore.AccountRateLimitSnapshot>;
  readonly threads: ReadonlyArray<ProjectionThread>;
  readonly usageThresholdPercent?: number;
  readonly specExists?: (specPath: string) => boolean;
}) {
  const commands: OrchestrationCommand[] = [];

  const accountRateLimitsStoreLayer = Layer.succeed(AccountRateLimitsStore.AccountRateLimitsStore, {
    getLatest: () => Effect.succeed(input.snapshot),
    set: () => Effect.void,
    getAllForProvider: () => Effect.succeed([]),
  });

  const projectionThreadRepositoryLayer = Layer.succeed(ProjectionThreadRepository, {
    upsert: () => Effect.die("unused"),
    getById: () => Effect.die("unused"),
    listByProjectId: () => Effect.die("unused"),
    listQueuedForAutoPickup: () => Effect.succeed(input.threads),
    deleteById: () => Effect.die("unused"),
  });

  const orchestrationEngineLayer = Layer.succeed(OrchestrationEngineService, {
    dispatch: (command) =>
      Effect.sync(() => {
        commands.push(command);
        return { sequence: commands.length };
      }),
    readEvents: () => Stream.empty,
    streamDomainEvents: Stream.empty,
  });

  const serverSettingsLayer = ServerSettings.layerTest({
    autoPickup: {
      usageThresholdPercent: input.usageThresholdPercent ?? 50,
      intervalMinutes: 1_000,
    },
  });

  const specExists = input.specExists ?? (() => true);
  const fileSystemLayer = FileSystem.layerNoop({
    exists: (path) => Effect.succeed(specExists(path)),
  });

  const layer = AutoPickupReactorBaseLive.pipe(
    Layer.provideMerge(accountRateLimitsStoreLayer),
    Layer.provideMerge(projectionThreadRepositoryLayer),
    Layer.provideMerge(orchestrationEngineLayer),
    Layer.provideMerge(serverSettingsLayer),
    // Merge the FileSystem mock before NodeServices so it takes precedence
    // over the real FileSystem (provideMerge keeps the left/self side's
    // services on conflicts), while Path/Crypto/etc still come from Node.
    Layer.provideMerge(fileSystemLayer),
    Layer.provideMerge(NodeServices.layer),
  );

  return { layer, commands };
}

const runReactorTick = (commands: OrchestrationCommand[], expected: number) =>
  Effect.gen(function* () {
    const reactor = yield* AutoPickupReactor;
    yield* reactor.start();

    for (let iteration = 0; iteration < 500; iteration += 1) {
      if (commands.length >= expected) {
        break;
      }
      yield* Effect.yieldNow;
    }
  });

const runReactorAndSettle = () =>
  Effect.gen(function* () {
    const reactor = yield* AutoPickupReactor;
    yield* reactor.start();
    yield* Effect.forEach(Array.from({ length: 50 }), () => Effect.yieldNow, { discard: true });
  });

describe("AutoPickupReactor", () => {
  it.effect("picks up when no snapshot has been observed", () => {
    const { layer, commands } = makeHarness({
      snapshot: Option.none(),
      threads: [makeThread("thread-auto-pickup-missing")],
    });
    return runReactorTick(commands, 2).pipe(
      Effect.provide(layer),
      Effect.tap(() =>
        Effect.sync(() =>
          assert.deepStrictEqual(
            commands.map((command) => command.type),
            ["thread.auto-pickup.set", "thread.turn.start"],
          ),
        ),
      ),
    );
  });

  it.effect("does not pick up when a fresh snapshot is over the usage threshold", () =>
    Effect.gen(function* () {
      const observedAt = new Date(yield* Clock.currentTimeMillis).toISOString();
      const { layer, commands } = makeHarness({
        snapshot: Option.some(makeSnapshot({ utilization: 80, observedAt })),
        threads: [makeThread("thread-auto-pickup-blocked")],
      });
      yield* runReactorAndSettle().pipe(Effect.provide(layer));
      assert.strictEqual(commands.length, 0);
    }),
  );

  it.effect("picks up when the snapshot is older than the five hour window", () =>
    Effect.gen(function* () {
      const observedAt = new Date(
        (yield* Clock.currentTimeMillis) - (FIVE_HOUR_MS + 60_000),
      ).toISOString();
      const { layer, commands } = makeHarness({
        snapshot: Option.some(makeSnapshot({ utilization: 95, observedAt })),
        threads: [makeThread("thread-auto-pickup-stale")],
      });
      yield* runReactorTick(commands, 2).pipe(Effect.provide(layer));
      assert.deepStrictEqual(
        commands.map((command) => command.type),
        ["thread.auto-pickup.set", "thread.turn.start"],
      );
    }),
  );

  it.effect("dispatches the auto-pickup mark then the turn start for the chosen thread", () => {
    const threadId = ThreadId.make("thread-auto-pickup-order");
    const { layer, commands } = makeHarness({
      snapshot: Option.none(),
      threads: [makeThread(threadId)],
    });
    return runReactorTick(commands, 2).pipe(
      Effect.provide(layer),
      Effect.tap(() =>
        Effect.sync(() => {
          const [setCommand, turnCommand] = commands;
          assert.deepStrictEqual(setCommand?.type, "thread.auto-pickup.set");
          assert.deepInclude(setCommand, { threadId, autoPickupState: "picked" });
          assert.deepStrictEqual(turnCommand?.type, "thread.turn.start");
          assert.deepInclude(turnCommand, {
            threadId,
            modelSelection,
            runtimeMode: "full-access",
            interactionMode: "default",
          });
          assert.deepInclude(turnCommand?.type === "thread.turn.start" ? turnCommand.message : {}, {
            role: "user",
            text: `Read specs/${threadId}.md in this worktree and implement it.`,
          });
        }),
      ),
    );
  });

  it.effect("skips threads with a null worktree path", () => {
    const { layer, commands } = makeHarness({
      snapshot: Option.none(),
      threads: [makeThread("thread-auto-pickup-null-worktree", { worktreePath: null })],
    });
    return runReactorAndSettle().pipe(
      Effect.provide(layer),
      Effect.tap(() => Effect.sync(() => assert.strictEqual(commands.length, 0))),
    );
  });

  it.effect("picks up at most one thread per tick", () => {
    const firstThreadId = ThreadId.make("thread-auto-pickup-first");
    const { layer, commands } = makeHarness({
      snapshot: Option.none(),
      threads: [makeThread(firstThreadId), makeThread("thread-auto-pickup-second")],
    });
    return Effect.gen(function* () {
      yield* runReactorTick(commands, 2);
      yield* Effect.forEach(Array.from({ length: 50 }), () => Effect.yieldNow, { discard: true });
      assert.strictEqual(commands.length, 2);
      assert.isTrue(
        commands.every((command) => "threadId" in command && command.threadId === firstThreadId),
      );
    }).pipe(Effect.provide(layer));
  });

  it.effect("skips threads whose spec file does not exist, leaving them queued", () => {
    const { layer, commands } = makeHarness({
      snapshot: Option.none(),
      threads: [makeThread("thread-auto-pickup-missing-spec")],
      specExists: () => false,
    });
    return runReactorAndSettle().pipe(
      Effect.provide(layer),
      Effect.tap(() => Effect.sync(() => assert.strictEqual(commands.length, 0))),
    );
  });

  it.effect("continues to the next queued thread when an earlier thread has no spec file", () => {
    const firstThreadId = ThreadId.make("thread-auto-pickup-no-spec");
    const secondThreadId = ThreadId.make("thread-auto-pickup-with-spec");
    const { layer, commands } = makeHarness({
      snapshot: Option.none(),
      threads: [makeThread(firstThreadId), makeThread(secondThreadId)],
      specExists: (specPath) => specPath.includes(secondThreadId),
    });
    return runReactorTick(commands, 2).pipe(
      Effect.provide(layer),
      Effect.tap(() =>
        Effect.sync(() => {
          assert.deepStrictEqual(
            commands.map((command) => command.type),
            ["thread.auto-pickup.set", "thread.turn.start"],
          );
          assert.isTrue(
            commands.every(
              (command) => "threadId" in command && command.threadId === secondThreadId,
            ),
          );
        }),
      ),
    );
  });

  it.effect("picks up when the snapshot timestamp is malformed", () =>
    Effect.gen(function* () {
      const { layer, commands } = makeHarness({
        snapshot: Option.some(
          makeSnapshot({ utilization: 95, observedAt: "not-a-valid-timestamp" }),
        ),
        threads: [makeThread("thread-auto-pickup-malformed-timestamp")],
      });
      yield* runReactorTick(commands, 2).pipe(Effect.provide(layer));
      assert.deepStrictEqual(
        commands.map((command) => command.type),
        ["thread.auto-pickup.set", "thread.turn.start"],
      );
    }),
  );
});
