import Cache from "./Cache.mjs";
import cacheEntryDelete from "./cacheEntryDelete.mjs";
import createArgErrorMessageProd from "./createArgErrorMessageProd.mjs";

/**
 * Prunes a [cache]{@link Cache#store} entry, if no
 * [prune event]{@link Cache#event:prune} listener cancels the
 * [cache]{@link Cache#store} entry deletion via `event.preventDefault()`.
 * @kind function
 * @name cacheEntryPrune
 * @param {Cache} cache Cache to update.
 * @param {CacheKey} cacheKey Cache key.
 * @fires Cache#event:prune
 * @fires Cache#event:delete
 * @example <caption>How to `import`.</caption>
 * ```js
 * import cacheEntryPrune from "graphql-react/cacheEntryPrune.mjs";
 * ```
 */
export default function cacheEntryPrune(cache, cacheKey) {
  if (!(cache instanceof Cache))
    throw new TypeError(
      typeof process === "object" && process.env.NODE_ENV !== "production"
        ? "Argument 1 `cache` must be a `Cache` instance."
        : createArgErrorMessageProd(1)
    );

  if (typeof cacheKey !== "string")
    throw new TypeError(
      typeof process === "object" && process.env.NODE_ENV !== "production"
        ? "Argument 2 `cacheKey` must be a string."
        : createArgErrorMessageProd(2)
    );

  if (cacheKey in cache.store) {
    const notCanceled = cache.dispatchEvent(
      new CustomEvent(`${cacheKey}/prune`, { cancelable: true })
    );

    if (notCanceled) cacheEntryDelete(cache, cacheKey);
  }
}
