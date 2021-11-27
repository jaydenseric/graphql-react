import Cache from "./Cache.mjs";
import cacheEntryStale from "./cacheEntryStale.mjs";
import createArgErrorMessageProd from "./createArgErrorMessageProd.mjs";

/**
 * Stales [cache]{@link Cache#store} entries. Useful after a mutation.
 * @kind function
 * @name cacheStale
 * @param {Cache} cache Cache to update.
 * @param {CacheKeyMatcher} [cacheKeyMatcher] Matches [cache keys]{@link CacheKey} to stale. By default all are matched.
 * @fires Cache#event:stale
 * @example <caption>How to `import`.</caption>
 * ```js
 * import cacheStale from "graphql-react/cacheStale.mjs";
 * ```
 */
export default function cacheStale(cache, cacheKeyMatcher) {
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
      cacheEntryStale(cache, cacheKey);
}
