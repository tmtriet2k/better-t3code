/**
 * AccountRateLimitsStore - Latest known provider account rate-limit snapshot
 * per provider and rate-limit window.
 *
 * Holds the latest snapshot per `(provider, rateLimitType)` pair in memory
 * and mirrors it to a JSON file under the caches dir so it survives
 * restarts. A future auto-pickup cron reactor reads this to decide whether
 * a Claude `five_hour` window has enough headroom to resume queued work.
 *
 * Reads are best-effort: a missing or corrupt cache file is treated as
 * empty state rather than failing startup.
 *
 * @module AccountRateLimitsStore
 */
import { causeErrorTag } from "@t3tools/shared/observability";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import * as Ref from "effect/Ref";
import * as Schema from "effect/Schema";

import { writeFileStringAtomically } from "../atomicWrite.ts";
import * as ServerConfig from "../config.ts";

export const AccountRateLimitSnapshot = Schema.Struct({
  provider: Schema.String,
  rateLimitType: Schema.NullOr(Schema.String),
  utilization: Schema.NullOr(Schema.Number),
  resetsAt: Schema.NullOr(Schema.Number),
  status: Schema.String,
  observedAt: Schema.String,
});
export type AccountRateLimitSnapshot = typeof AccountRateLimitSnapshot.Type;

const AccountRateLimitsCacheFile = Schema.Record(
  Schema.String,
  Schema.Record(Schema.String, AccountRateLimitSnapshot),
);
type AccountRateLimitsCacheFile = typeof AccountRateLimitsCacheFile.Type;

const decodeAccountRateLimitsCacheFile = Schema.decodeUnknownEffect(
  Schema.fromJsonString(AccountRateLimitsCacheFile),
);

const RATE_LIMIT_TYPE_FALLBACK_KEY = "unknown";

const rateLimitTypeKey = (rateLimitType: string | null): string =>
  rateLimitType ?? RATE_LIMIT_TYPE_FALLBACK_KEY;

export const resolveAccountRateLimitsCachePath = (cacheDir: string, path: Path.Path): string =>
  path.join(cacheDir, "account-rate-limits.json");

const readAccountRateLimitsCache = Effect.fn("AccountRateLimitsStore.readCache")(function* (
  filePath: string,
) {
  const fs = yield* FileSystem.FileSystem;
  const exists = yield* fs.exists(filePath).pipe(Effect.orElseSucceed(() => false));
  if (!exists) {
    return {} as AccountRateLimitsCacheFile;
  }

  const raw = yield* fs.readFileString(filePath).pipe(Effect.orElseSucceed(() => ""));
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return {} as AccountRateLimitsCacheFile;
  }

  return yield* decodeAccountRateLimitsCacheFile(trimmed).pipe(
    Effect.matchCauseEffect({
      onFailure: (cause) =>
        Effect.logWarning("failed to parse account rate limits cache, ignoring", {
          path: filePath,
          errorTag: causeErrorTag(cause),
        }).pipe(Effect.as({} as AccountRateLimitsCacheFile)),
      onSuccess: Effect.succeed,
    }),
  );
});

const persistAccountRateLimitsCache = (filePath: string, cache: AccountRateLimitsCacheFile) =>
  writeFileStringAtomically({
    filePath,
    contents: `${JSON.stringify(cache, null, 2)}\n`,
  }).pipe(
    Effect.catchCause((cause) =>
      Effect.logWarning("failed to persist account rate limits cache", {
        path: filePath,
        errorTag: causeErrorTag(cause),
      }),
    ),
  );

export class AccountRateLimitsStore extends Context.Service<
  AccountRateLimitsStore,
  {
    /** Record the latest snapshot for `snapshot.provider` + `snapshot.rateLimitType`. */
    readonly set: (snapshot: AccountRateLimitSnapshot) => Effect.Effect<void>;
    /** Latest snapshot for a specific provider + rate-limit window, if any has been observed. */
    readonly getLatest: (input: {
      readonly provider: string;
      readonly rateLimitType: string;
    }) => Effect.Effect<Option.Option<AccountRateLimitSnapshot>>;
    /** All known windows currently tracked for a provider (e.g. `five_hour`, `seven_day`). */
    readonly getAllForProvider: (
      provider: string,
    ) => Effect.Effect<ReadonlyArray<AccountRateLimitSnapshot>>;
  }
>()("t3/provider/AccountRateLimitsStore") {}

export const make = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const serverConfig = yield* ServerConfig.ServerConfig;
  const cachePath = resolveAccountRateLimitsCachePath(serverConfig.providerStatusCacheDir, path);

  const hydrated = yield* readAccountRateLimitsCache(cachePath);
  const state = yield* Ref.make<AccountRateLimitsCacheFile>(hydrated);

  const set: AccountRateLimitsStore["Service"]["set"] = (snapshot) =>
    Ref.updateAndGet(state, (current) => ({
      ...current,
      [snapshot.provider]: {
        ...current[snapshot.provider],
        [rateLimitTypeKey(snapshot.rateLimitType)]: snapshot,
      },
    })).pipe(
      Effect.flatMap((next) =>
        persistAccountRateLimitsCache(cachePath, next).pipe(
          Effect.provideService(FileSystem.FileSystem, fs),
          Effect.provideService(Path.Path, path),
        ),
      ),
    );

  const getLatest: AccountRateLimitsStore["Service"]["getLatest"] = (input) =>
    Ref.get(state).pipe(
      Effect.map((current) => {
        const snapshot = current[input.provider]?.[input.rateLimitType];
        return snapshot === undefined ? Option.none() : Option.some(snapshot);
      }),
    );

  const getAllForProvider: AccountRateLimitsStore["Service"]["getAllForProvider"] = (provider) =>
    Ref.get(state).pipe(Effect.map((current) => Object.values(current[provider] ?? {})));

  return AccountRateLimitsStore.of({ set, getLatest, getAllForProvider });
});

export const layer = Layer.effect(AccountRateLimitsStore, make);
