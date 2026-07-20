import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Path from "effect/Path";

import * as ServerConfig from "../config.ts";
import * as AccountRateLimitsStore from "./AccountRateLimitsStore.ts";

const makeServerConfigLayer = () =>
  ServerConfig.layerTest(process.cwd(), { prefix: "t3-account-rate-limits-store-test-" });

const makeAccountRateLimitsStoreLayer = () =>
  AccountRateLimitsStore.layer.pipe(Layer.provideMerge(makeServerConfigLayer()));

const fiveHourSnapshot: AccountRateLimitsStore.AccountRateLimitSnapshot = {
  provider: "claudeAgent",
  rateLimitType: "five_hour",
  utilization: 42,
  resetsAt: 1_700_000_000,
  status: "allowed",
  observedAt: "2026-07-19T00:00:00.000Z",
};

const sevenDaySnapshot: AccountRateLimitsStore.AccountRateLimitSnapshot = {
  provider: "claudeAgent",
  rateLimitType: "seven_day",
  utilization: 10,
  resetsAt: 1_700_600_000,
  status: "allowed",
  observedAt: "2026-07-19T00:05:00.000Z",
};

it.layer(NodeServices.layer)("AccountRateLimitsStore.layer", (it) => {
  it.effect("returns Option.none when no snapshot has been observed", () =>
    Effect.gen(function* () {
      const store = yield* AccountRateLimitsStore.AccountRateLimitsStore;

      const latest = yield* store.getLatest({
        provider: "claudeAgent",
        rateLimitType: "five_hour",
      });

      assert.isTrue(Option.isNone(latest));
    }).pipe(Effect.provide(makeAccountRateLimitsStoreLayer())),
  );

  it.effect("keeps the latest snapshot per rateLimitType without clobbering other windows", () =>
    Effect.gen(function* () {
      const store = yield* AccountRateLimitsStore.AccountRateLimitsStore;

      yield* store.set(fiveHourSnapshot);
      yield* store.set(sevenDaySnapshot);
      yield* store.set({
        ...fiveHourSnapshot,
        utilization: 55,
        observedAt: "2026-07-19T00:10:00.000Z",
      });

      const fiveHour = yield* store.getLatest({
        provider: "claudeAgent",
        rateLimitType: "five_hour",
      });
      const sevenDay = yield* store.getLatest({
        provider: "claudeAgent",
        rateLimitType: "seven_day",
      });

      assert.isTrue(Option.isSome(fiveHour));
      assert.equal(Option.getOrThrow(fiveHour).utilization, 55);
      assert.isTrue(Option.isSome(sevenDay));
      assert.equal(Option.getOrThrow(sevenDay).utilization, 10);
    }).pipe(Effect.provide(makeAccountRateLimitsStoreLayer())),
  );

  it.effect("lists all known windows for a provider", () =>
    Effect.gen(function* () {
      const store = yield* AccountRateLimitsStore.AccountRateLimitsStore;

      yield* store.set(fiveHourSnapshot);
      yield* store.set(sevenDaySnapshot);

      const all = yield* store.getAllForProvider("claudeAgent");

      assert.equal(all.length, 2);
    }).pipe(Effect.provide(makeAccountRateLimitsStoreLayer())),
  );

  it.effect("persists snapshots to the JSON cache file under the caches dir", () =>
    Effect.gen(function* () {
      const store = yield* AccountRateLimitsStore.AccountRateLimitsStore;
      const config = yield* ServerConfig.ServerConfig;
      const path = yield* Path.Path;
      const fs = yield* FileSystem.FileSystem;

      yield* store.set(fiveHourSnapshot);

      const cachePath = AccountRateLimitsStore.resolveAccountRateLimitsCachePath(
        config.providerStatusCacheDir,
        path,
      );
      const raw = yield* fs.readFileString(cachePath);
      // @effect-diagnostics-next-line preferSchemaOverJson:off
      const parsed = JSON.parse(raw) as Record<
        string,
        Record<string, AccountRateLimitsStore.AccountRateLimitSnapshot>
      >;

      assert.equal(parsed.claudeAgent?.five_hour?.utilization, 42);
    }).pipe(Effect.provide(makeAccountRateLimitsStoreLayer())),
  );
});
