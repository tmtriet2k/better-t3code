import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as Scope from "effect/Scope";

export interface AutoPickupReactorShape {
  /**
   * Start the background auto-pickup reactor within the provided scope.
   */
  readonly start: () => Effect.Effect<void, never, Scope.Scope>;
}

export class AutoPickupReactor extends Context.Service<AutoPickupReactor, AutoPickupReactorShape>()(
  "t3/orchestration/Services/AutoPickupReactor",
) {}
