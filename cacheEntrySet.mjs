import Cache from "./Cache.mjs";
import createArgErrorMessageProd from "./createArgErrorMessageProd.mjs";

/**
 * Sets a [cache]{@link Cache#store} entry.
 * @kind function
 * @name cacheEntrySet
 * @param {Cache} cache Cache to update.
 * @param {CacheKey} cacheKey Cache key.
 * @param {CacheValue} cacheValue Cache value.
 * @fires Cache#event:set
 * @example <caption>How to `import`.</caption>
 * ```js
 * import cacheEntrySet from "graphql-react/cacheEntrySet.mjs";
 * ```
 */
export default function cacheEntrySet(cache, cacheKey, cacheValue) {
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

  cache.store[cacheKey] = cacheValue;

  cache.dispatchEvent(
    new CustomEvent(`${cacheKey}/set`, {
      detail: {
        cacheValue,
      },
    })
  );
}
