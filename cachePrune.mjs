import Cache from "./Cache.mjs";
import cacheEntryPrune from "./cacheEntryPrune.mjs";
import createArgErrorMessageProd from "./createArgErrorMessageProd.mjs";

/**
 * Prunes [cache]{@link Cache#store} entries. Useful after a mutation.
 * @kind function
 * @name cachePrune
 * @param {Cache} cache Cache to update.
 * @param {CacheKeyMatcher} [cacheKeyMatcher] Matches [cache keys]{@link CacheKey} to prune. By default all are matched.
 * @fires Cache#event:prune
 * @fires Cache#event:delete
 * @example <caption>How to `import`.</caption>
 * ```js
 * import cachePrune from "graphql-react/cachePrune.mjs";
 * ```
 */
export default function cachePrune(cache, cacheKeyMatcher) {
  if (!(cache instanceof Cache))
    throw new TypeError(
      typeof process === "object" && process.env.NODE_ENV !== "production"
        ? "Argument 1 `cache` must be a `Cache` instance."
        : createArgErrorMessageProd(1)
    );

  if (cacheKeyMatcher !== undefined && typeof cacheKeyMatcher !== "function")
    throw new TypeError(
      typeof process === "object" && process.env.NODE_ENV !== "production"
        ? "Argument 2 `cacheKeyMatcher` must be a function."
        : createArgErrorMessageProd(2)
    );

  for (const cacheKey in cache.store)
    if (!cacheKeyMatcher || cacheKeyMatcher(cacheKey))
      cacheEntryPrune(cache, cacheKey);
}
