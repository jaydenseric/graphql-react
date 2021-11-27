import React from 'react';
import createArgErrorMessageProd from './createArgErrorMessageProd.mjs';
import useCache from './useCache.mjs';

/**
 * Cancels an event.
 * @kind function
 * @name cancelEvent
 * @param {Event} event Event.
 * @ignore
 */
function cancelEvent(event) {
  event.preventDefault();
}

/**
 * A React hook to prevent a [cache]{@link Cache#store} entry from being pruned,
 * by canceling the cache entry deletion for
 * [prune events]{@link Cache#event:prune} with `event.preventDefault()`.
 * @kind function
 * @name useCacheEntryPrunePrevention
 * @param {CacheKey} cacheKey Cache key.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import useCacheEntryPrunePrevention from 'graphql-react/useCacheEntryPrunePrevention.mjs';
 * ```
 */
export default function useCacheEntryPrunePrevention(cacheKey) {
  if (typeof cacheKey !== 'string')
    throw new TypeError(
      typeof process === 'object' && process.env.NODE_ENV !== 'production'
        ? 'Argument 1 `cacheKey` must be a string.'
        : createArgErrorMessageProd(1)
    );

  const cache = useCache();

  React.useEffect(() => {
    const eventNamePrune = `${cacheKey}/prune`;

    cache.addEventListener(eventNamePrune, cancelEvent);

    return () => {
      cache.removeEventListener(eventNamePrune, cancelEvent);
    };
  }, [cache, cacheKey]);
}
