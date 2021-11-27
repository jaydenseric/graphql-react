import Cache from "./Cache.mjs";
import cacheEntryDelete from "./cacheEntryDelete.mjs";

/**
 * Deletes [cache]{@link Cache#store} entries. Useful after a user logs out.
 * @kind function
 * @name cacheDelete
 * @param {Cache} cache Cache to update.
 * @param {CacheKeyMatcher} [cacheKeyMatcher] Matches [cache keys]{@link CacheKey} to delete. By default all are matched.
 * @fires Cache#event:delete
 * @example <caption>How to `import`.</caption>
 * ```js
 * import cacheDelete from "graphql-react/cacheDelete.mjs";
 * ```
 */
export default function cacheDelete(cache, cacheKeyMatcher) {
  if (!(cache instanceof Cache))
    throw new TypeError("Argument 1 `cache` must be a `Cache` instance.");

  if (cacheKeyMatcher !== undefined && typeof cacheKeyMatcher !== "function")
    throw new TypeError("Argument 2 `cacheKeyMatcher` must be a function.");

  for (const cacheKey in cache.store)
    if (!cacheKeyMatcher || cacheKeyMatcher(cacheKey))
      cacheEntryDelete(cache, cacheKey);
}
