// @ts-check

import { deepStrictEqual, ok, rejects, strictEqual, throws } from "node:assert";
import React from "react";
import ReactDOMServer from "react-dom/server";
import waterfallRender from "react-waterfall-render/waterfallRender.mjs";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import Loading from "./Loading.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useCacheEntry from "./useCacheEntry.mjs";
import useWaterfallLoad from "./useWaterfallLoad.mjs";

/**
 * Dummy loader for testing.
 * @type {import("./types.mjs").Loader}
 */
const dummyLoader = () =>
  new LoadingCacheValue(
    new Loading(),
    new Cache(),
    "a",
    Promise.resolve(),
    new AbortController()
  );

/**
 * Adds `useWaterfallLoad` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`useWaterfallLoad` bundle size.", async () => {
    await assertBundleSize(
      new URL("./useWaterfallLoad.mjs", import.meta.url),
      1000
    );
  });

  tests.add("`useWaterfallLoad` argument 1 `cacheKey` not a string.", () => {
    throws(() => {
      useWaterfallLoad(
        // @ts-expect-error Testing invalid.
        true,
        dummyLoader
      );
    }, new TypeError("Argument 1 `cacheKey` must be a string."));
  });

  tests.add("`useWaterfallLoad` argument 2 `load` not a function.", () => {
    throws(() => {
      useWaterfallLoad(
        "a",
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 2 `load` must be a function."));
  });

  tests.add("`useWaterfallLoad` with cache context missing.", () => {
    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(ReactHookTest, {
        useHook: () => useWaterfallLoad("a", dummyLoader),
        results,
      })
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(results[0].threw, new TypeError("Cache context missing."));
  });

  tests.add(
    "`useWaterfallLoad` with cache context value not a `Cache` instance.",
    () => {
      /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
      const results = [];

      createReactTestRenderer(
        React.createElement(
          CacheContext.Provider,
          {
            // @ts-expect-error Testing invalid.
            value: true,
          },
          React.createElement(ReactHookTest, {
            useHook: () => useWaterfallLoad("a", dummyLoader),
            results,
          })
        )
      );

      strictEqual(results.length, 1);
      ok("threw" in results[0]);
      deepStrictEqual(
        results[0].threw,
        new TypeError("Cache context value must be a `Cache` instance.")
      );
    }
  );

  tests.add(
    "`useWaterfallLoad` with waterfall render context value undefined.",
    () => {
      const cache = new Cache();

      let didLoad = false;

      /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
      const results = [];

      createReactTestRenderer(
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(ReactHookTest, {
            useHook: () =>
              useWaterfallLoad("a", () => {
                didLoad = true;

                return dummyLoader();
              }),
            results,
          })
        )
      );

      strictEqual(didLoad, false);
      strictEqual(results.length, 1);
      ok("returned" in results[0]);
      strictEqual(results[0].returned, false);
    }
  );

  tests.add(
    "`useWaterfallLoad` with waterfall render context value defined, without initial cache value, invalid `load` return.",
    async () => {
      const cache = new Cache();

      const TestComponent = () => {
        useWaterfallLoad(
          "a",
          () =>
            // @ts-expect-error Testing invalid.
            true
        );

        return null;
      };

      await rejects(
        waterfallRender(
          React.createElement(
            CacheContext.Provider,
            { value: cache },
            React.createElement(TestComponent)
          ),
          ReactDOMServer.renderToStaticMarkup
        ),
        new TypeError(
          "Argument 2 `load` must return a `LoadingCacheValue` instance."
        )
      );
    }
  );

  tests.add(
    "`useWaterfallLoad` with waterfall render context value defined, without initial cache value, valid `load` return.",
    async () => {
      const cacheKey = "a";
      const cacheValue = "b";
      const cache = new Cache();
      const loading = new Loading();

      /** @type {Array<boolean>} */
      const loadCalls = [];

      /** @type {Array<boolean>} */
      const hookReturns = [];

      /** @type {import("./types.mjs").Loader} */
      function load() {
        loadCalls.push(!!arguments.length);

        return new LoadingCacheValue(
          loading,
          cache,
          cacheKey,
          Promise.resolve(cacheValue),
          new AbortController()
        );
      }

      const TestComponent = () => {
        const cacheValue = /** @type {string | undefined} */ (
          useCacheEntry(cacheKey)
        );

        const didLoad = useWaterfallLoad(cacheKey, load);

        hookReturns.push(didLoad);

        return !cacheValue || didLoad
          ? null
          : React.createElement(React.Fragment, null, cacheValue);
      };

      const html = await waterfallRender(
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(TestComponent)
        ),
        ReactDOMServer.renderToStaticMarkup
      );

      deepStrictEqual(loadCalls, [false]);
      deepStrictEqual(hookReturns, [true, false]);
      deepStrictEqual(cache.store, {
        [cacheKey]: cacheValue,
      });
      strictEqual(html, cacheValue);
    }
  );

  tests.add(
    "`useWaterfallLoad` with waterfall render context value defined, with initial cache value, valid `load` return.",
    async () => {
      const cacheKey = "a";
      const cacheValue = "b";
      const cache = new Cache({
        [cacheKey]: cacheValue,
      });
      const loading = new Loading();

      /** @type {Array<boolean>} */
      const loadCalls = [];

      /** @type {Array<boolean>} */
      const hookReturns = [];

      /** @type {import("./types.mjs").Loader} */
      function load() {
        loadCalls.push(!!arguments.length);

        return new LoadingCacheValue(
          loading,
          cache,
          cacheKey,
          Promise.resolve("c"),
          new AbortController()
        );
      }

      const TestComponent = () => {
        const cacheValue = /** @type {string | undefined} */ (
          useCacheEntry(cacheKey)
        );

        const didLoad = useWaterfallLoad(cacheKey, load);

        hookReturns.push(didLoad);

        return !cacheValue || didLoad
          ? null
          : React.createElement(React.Fragment, null, cacheValue);
      };

      const html = await waterfallRender(
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(TestComponent)
        ),
        ReactDOMServer.renderToStaticMarkup
      );

      deepStrictEqual(loadCalls, []);
      deepStrictEqual(hookReturns, [false]);
      strictEqual(html, cacheValue);
    }
  );
};
