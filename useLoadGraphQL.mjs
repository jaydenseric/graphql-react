// @ts-check

import React from "react";

import fetchGraphQL from "./fetchGraphQL.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import useCache from "./useCache.mjs";
import useLoading from "./useLoading.mjs";

/**
 * React hook to get a function for loading a GraphQL operation.
 * @returns {LoadGraphQL} Loads a GraphQL operation.
 */
export default function useLoadGraphQL() {
  const cache = useCache();
  const loading = useLoading();

  return React.useCallback(
    (cacheKey, fetchUri, fetchOptions) => {
      if (typeof cacheKey !== "string")
        throw new TypeError("Argument 1 `cacheKey` must be a string.");

      if (typeof fetchUri !== "string")
        throw new TypeError("Argument 2 `fetchUri` must be a string.");

      if (
        typeof fetchOptions !== "object" ||
        !fetchOptions ||
        Array.isArray(fetchOptions)
      )
        throw new TypeError("Argument 3 `fetchOptions` must be an object.");

      /** @type {RequestInit["signal"]} */
      let signal;

      /**
       * Fetch options, modified without mutating the input.
       * @type {RequestInit}
       */
      let modifiedFetchOptions;

      ({ signal, ...modifiedFetchOptions } = fetchOptions);

      const abortController = new AbortController();

      // Respect an existing abort controller signal.
      if (signal)
        signal.aborted
          ? // Signal already aborted, so immediately abort.
            abortController.abort()
          : // Signal not already aborted, so setup a listener to abort when it
            // does.
            signal.addEventListener(
              "abort",
              () => {
                abortController.abort();
              },
              {
                // Prevent a memory leak if the existing abort controller is
                // long lasting, or controls multiple things.
                once: true,
              }
            );

      modifiedFetchOptions.signal = abortController.signal;

      return new LoadingCacheValue(
        loading,
        cache,
        cacheKey,
        fetchGraphQL(fetchUri, modifiedFetchOptions),
        abortController
      );
    },
    [cache, loading]
  );
}

/**
 * Loads a GraphQL operation, using {@linkcode fetchGraphQL}.
 * @callback LoadGraphQL
 * @param {import("./Cache.mjs").CacheKey} cacheKey Cache key to store the
 *   loading result under.
 * @param {string} fetchUri [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
 *   URI.
 * @param {RequestInit} fetchOptions [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
 *   options.
 * @returns {LoadingCacheValue} The loading cache value.
 */
