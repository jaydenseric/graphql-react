// @ts-check

import { deepStrictEqual, strictEqual, throws } from "assert";
import {
  act,
  cleanup,
  renderHook,
  suppressErrorOutput,
} from "@testing-library/react-hooks/lib/pure.js";
import React from "react";
import Cache from "./Cache.mjs";
import Loading from "./Loading.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import LoadingContext from "./LoadingContext.mjs";
import Deferred from "./test/Deferred.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import useLoadingEntry from "./useLoadingEntry.mjs";

/**
 * Adds `useLoadingEntry` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`useLoadingEntry` bundle size.", async () => {
    await assertBundleSize(
      new URL("./useLoadingEntry.mjs", import.meta.url),
      500
    );
  });

  tests.add("`useLoadingEntry` argument 1 `cacheKey` not a string.", () => {
    throws(() => {
      useLoadingEntry(
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 1 `cacheKey` must be a string."));
  });

  tests.add("`useLoadingEntry` with loading context missing.", () => {
    try {
      const revertConsole = suppressErrorOutput();

      try {
        var { result } = renderHook(() => useLoadingEntry("a"));
      } finally {
        revertConsole();
      }

      deepStrictEqual(result.error, new TypeError("Loading context missing."));
    } finally {
      cleanup();
    }
  });

  tests.add(
    "`useLoadingEntry` with loading context value not a `Loading` instance.",
    () => {
      try {
        /** @param {{ children?: React.ReactNode }} props Props. */
        const wrapper = ({ children }) =>
          React.createElement(
            LoadingContext.Provider,
            {
              // @ts-expect-error Testing invalid.
              value: true,
            },
            children
          );

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useLoadingEntry("a"), { wrapper });
        } finally {
          revertConsole();
        }

        deepStrictEqual(
          result.error,
          new TypeError("Loading context value must be a `Loading` instance.")
        );
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    "`useLoadingEntry` without initial loading for each cache key used.",
    async () => {
      try {
        const loading = new Loading();
        const cache = new Cache();

        /** @param {{ children?: React.ReactNode }} props Props. */
        const wrapper = ({ children }) =>
          React.createElement(
            LoadingContext.Provider,
            { value: loading },
            children
          );

        const cacheKeyA = "a";

        const { result, rerender } = renderHook(
          ({ cacheKey }) => useLoadingEntry(cacheKey),
          {
            wrapper,
            initialProps: {
              cacheKey: cacheKeyA,
            },
          }
        );

        strictEqual(result.all.length, 1);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);

        const { promise: loadingA1Result, resolve: loadingA1ResultResolve } =
          new Deferred();

        /** @type {LoadingCacheValue | undefined} */
        let loadingA1CacheValue;

        act(() => {
          loadingA1CacheValue = new LoadingCacheValue(
            loading,
            cache,
            cacheKeyA,
            loadingA1Result,
            new AbortController()
          );
        });

        strictEqual(result.all.length, 2);
        deepStrictEqual(result.current, new Set([loadingA1CacheValue]));
        strictEqual(result.error, undefined);

        await act(async () => {
          loadingA1ResultResolve({});
          await /** @type {LoadingCacheValue} */ (loadingA1CacheValue).promise;
        });

        strictEqual(result.all.length, 3);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);

        const cacheKeyB = "b";

        rerender({ cacheKey: cacheKeyB });

        strictEqual(result.all.length, 4);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);

        const { promise: loadingB1Result, resolve: loadingB1ResultResolve } =
          new Deferred();

        /** @type {LoadingCacheValue | undefined} */
        let loadingB1CacheValue;

        act(() => {
          loadingB1CacheValue = new LoadingCacheValue(
            loading,
            cache,
            cacheKeyB,
            loadingB1Result,
            new AbortController()
          );
        });

        strictEqual(result.all.length, 5);
        deepStrictEqual(result.current, new Set([loadingB1CacheValue]));
        strictEqual(result.error, undefined);

        await act(async () => {
          loadingB1ResultResolve({});
          await /** @type {LoadingCacheValue} */ (loadingB1CacheValue).promise;
        });

        strictEqual(result.all.length, 6);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
      } finally {
        cleanup();
      }
    }
  );

  tests.add(
    "`useLoadingEntry` with initial loading for each cache key used.",
    async () => {
      try {
        const loading = new Loading();
        const cache = new Cache();
        const cacheKeyA = "a";
        const { promise: loadingA1Result, resolve: loadingA1ResultResolve } =
          new Deferred();
        const loadingA1CacheValue = new LoadingCacheValue(
          loading,
          cache,
          cacheKeyA,
          loadingA1Result,
          new AbortController()
        );

        /** @param {{ children?: React.ReactNode }} props Props. */
        const wrapper = ({ children }) =>
          React.createElement(
            LoadingContext.Provider,
            { value: loading },
            children
          );

        const { result, rerender } = renderHook(
          ({ cacheKey }) => useLoadingEntry(cacheKey),
          {
            wrapper,
            initialProps: {
              cacheKey: cacheKeyA,
            },
          }
        );

        strictEqual(result.all.length, 1);
        deepStrictEqual(result.current, new Set([loadingA1CacheValue]));
        strictEqual(result.error, undefined);

        const { promise: loadingA2Result, resolve: loadingA2ResultResolve } =
          new Deferred();

        /** @type {LoadingCacheValue | undefined} */
        let loadingA2CacheValue;

        act(() => {
          loadingA2CacheValue = new LoadingCacheValue(
            loading,
            cache,
            cacheKeyA,
            loadingA2Result,
            new AbortController()
          );
        });

        strictEqual(result.all.length, 2);
        deepStrictEqual(
          result.current,
          new Set([loadingA1CacheValue, loadingA2CacheValue])
        );
        strictEqual(result.error, undefined);

        await act(async () => {
          loadingA1ResultResolve({});
          await loadingA1CacheValue.promise;
        });

        strictEqual(result.all.length, 3);
        deepStrictEqual(result.current, new Set([loadingA2CacheValue]));
        strictEqual(result.error, undefined);

        await act(async () => {
          loadingA2ResultResolve({});
          await /** @type {LoadingCacheValue} */ (loadingA2CacheValue).promise;
        });

        strictEqual(result.all.length, 4);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);

        const cacheKeyB = "b";
        const { promise: loadingB1Result, resolve: loadingB1ResultResolve } =
          new Deferred();

        /** @type {LoadingCacheValue | undefined} */
        let loadingB1CacheValue;

        loadingB1CacheValue = new LoadingCacheValue(
          loading,
          cache,
          cacheKeyB,
          loadingB1Result,
          new AbortController()
        );

        rerender({ cacheKey: cacheKeyB });

        strictEqual(result.all.length, 5);
        deepStrictEqual(result.current, new Set([loadingB1CacheValue]));
        strictEqual(result.error, undefined);

        await act(async () => {
          loadingB1ResultResolve({});
          await /** @type {LoadingCacheValue} */ (loadingB1CacheValue).promise;
        });

        strictEqual(result.all.length, 6);
        strictEqual(result.current, undefined);
        strictEqual(result.error, undefined);
      } finally {
        cleanup();
      }
    }
  );
};
