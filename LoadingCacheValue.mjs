import Cache from "./Cache.mjs";
import Loading from "./Loading.mjs";
import cacheEntrySet from "./cacheEntrySet.mjs";

/**
 * Controls a loading [cache value]{@link CacheValue}.
 * @kind class
 * @name LoadingCacheValue
 * @param {Loading} loading Loading to update.
 * @param {Cache} cache Cache to update.
 * @param {CacheKey} cacheKey Cache key.
 * @param {Promise<CacheValue>} loadingResult Resolves the loading result (including any loading errors) to be set as the [cache value]{@link CacheValue} if loading isn’t aborted. Shouldn’t reject.
 * @param {AbortController} abortController Aborts this loading and skips setting the loading result as the [cache value]{@link CacheValue}. Has no effect after loading ends.
 * @fires Loading#event:start
 * @fires Cache#event:set
 * @fires Loading#event:end
 * @example <caption>How to import.</caption>
 * ```js
 * import LoadingCacheValue from "graphql-react/LoadingCacheValue.mjs";
 * ```
 */
export default class LoadingCacheValue {
  constructor(loading, cache, cacheKey, loadingResult, abortController) {
    if (!(loading instanceof Loading))
      throw new TypeError("Argument 1 `loading` must be a `Loading` instance.");

    if (!(cache instanceof Cache))
      throw new TypeError("Argument 2 `cache` must be a `Cache` instance.");

    if (typeof cacheKey !== "string")
      throw new TypeError("Argument 3 `cacheKey` must be a string.");

    if (!(loadingResult instanceof Promise))
      throw new TypeError(
        "Argument 4 `loadingResult` must be a `Promise` instance."
      );

    if (!(abortController instanceof AbortController))
      throw new TypeError(
        "Argument 5 `abortController` must be an `AbortController` instance."
      );

    /**
     * When this loading started.
     * @kind member
     * @name LoadingCacheValue#timeStamp
     * @type {HighResTimeStamp}
     */
    this.timeStamp = performance.now();

    /**
     * Aborts this loading and skips setting the loading result as the
     * [cache value]{@link CacheValue}. Has no effect after loading ends.
     * @kind member
     * @name LoadingCacheValue#abortController
     * @type {AbortController}
     */
    this.abortController = abortController;

    if (!(cacheKey in loading.store)) loading.store[cacheKey] = new Set();

    const loadingSet = loading.store[cacheKey];

    // In this constructor the instance must be synchronously added to the cache
    // key’s loading set, so instances are set in the order they’re constructed
    // and the loading store is updated for sync code following construction of
    // a new instance.

    let loadingAddedResolve;

    const loadingAdded = new Promise((resolve) => {
      loadingAddedResolve = resolve;
    });

    /**
     * Resolves the loading result, after the [cache value]{@link CacheValue}
     * has been set if the loading wasn’t aborted. Shouldn’t reject.
     * @kind member
     * @name LoadingCacheValue#promise
     * @type {Promise<*>}
     */
    this.promise = loadingResult.then(async (result) => {
      await loadingAdded;

      if (
        // The loading wasn’t aborted.
        !this.abortController.signal.aborted
      ) {
        // Before setting the cache value, await any earlier loading for the
        // same cache key to to ensure events are emitted in order and that the
        // last loading sets the final cache value.

        let previousPromise;

        for (const loadingCacheValue of loadingSet.values()) {
          if (loadingCacheValue === this) {
            // Harmless to await if it doesn’t exist.
            await previousPromise;
            break;
          }

          previousPromise = loadingCacheValue.promise;
        }

        cacheEntrySet(cache, cacheKey, result);
      }

      loadingSet.delete(this);

      if (!loadingSet.size) delete loading.store[cacheKey];

      loading.dispatchEvent(
        new CustomEvent(`${cacheKey}/end`, {
          detail: {
            loadingCacheValue: this,
          },
        })
      );

      return result;
    });

    loadingSet.add(this);

    loadingAddedResolve();

    loading.dispatchEvent(
      new CustomEvent(`${cacheKey}/start`, {
        detail: {
          loadingCacheValue: this,
        },
      })
    );
  }
}
