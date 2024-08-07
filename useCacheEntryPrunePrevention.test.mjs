// @ts-check

/** @import { ReactHookResult } from "./test/ReactHookTest.mjs" */

import "./test/polyfillCustomEvent.mjs";

import { deepStrictEqual, ok, strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";

import React from "react";
import ReactTestRenderer from "react-test-renderer";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import cacheEntryPrune from "./cacheEntryPrune.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useCacheEntryPrunePrevention from "./useCacheEntryPrunePrevention.mjs";

describe(
  "React hook `useCacheEntryPrunePrevention`.",
  { concurrency: true },
  () => {
    it("Bundle size.", async () => {
      await assertBundleSize(
        new URL("./useCacheEntryPrunePrevention.mjs", import.meta.url),
        450,
      );
    });

    it("Argument 1 `cacheKey` not a string.", () => {
      throws(() => {
        useCacheEntryPrunePrevention(
          // @ts-expect-error Testing invalid.
          true,
        );
      }, new TypeError("Argument 1 `cacheKey` must be a string."));
    });

    it("Cache context missing.", () => {
      /** @type {Array<ReactHookResult>} */
      const results = [];

      createReactTestRenderer(
        React.createElement(ReactHookTest, {
          useHook: () => useCacheEntryPrunePrevention("a"),
          results,
        }),
      );

      strictEqual(results.length, 1);
      ok("threw" in results[0]);
      deepStrictEqual(
        results[0].threw,
        new TypeError("Cache context missing."),
      );
    });

    it("Cache context value not a `Cache` instance.", () => {
      /** @type {Array<ReactHookResult>} */
      const results = [];

      createReactTestRenderer(
        React.createElement(
          CacheContext.Provider,
          {
            // @ts-expect-error Testing invalid.
            value: true,
          },
          React.createElement(ReactHookTest, {
            useHook: () => useCacheEntryPrunePrevention("a"),
            results,
          }),
        ),
      );

      strictEqual(results.length, 1);
      ok("threw" in results[0]);
      deepStrictEqual(
        results[0].threw,
        new TypeError("Cache context value must be a `Cache` instance."),
      );
    });

    it("Functionality.", () => {
      const cacheKeyA = "a";
      const cacheKeyB = "b";
      const initialCacheStore = {
        [cacheKeyA]: 1,
        [cacheKeyB]: 2,
      };
      const cache = new Cache({ ...initialCacheStore });

      /** @type {Array<ReactHookResult>} */
      const results = [];

      const testRenderer = createReactTestRenderer(
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(ReactHookTest, {
            useHook: () => useCacheEntryPrunePrevention(cacheKeyA),
            results,
          }),
        ),
      );

      strictEqual(results.length, 1);
      ok("returned" in results[0]);
      strictEqual(results[0].returned, undefined);

      ReactTestRenderer.act(() => {
        // This cache entry prune should be prevented.
        cacheEntryPrune(cache, cacheKeyA);
      });

      deepStrictEqual(cache.store, initialCacheStore);

      strictEqual(results.length, 1);

      ReactTestRenderer.act(() => {
        testRenderer.update(
          React.createElement(
            CacheContext.Provider,
            { value: cache },
            React.createElement(ReactHookTest, {
              useHook: () => useCacheEntryPrunePrevention(cacheKeyB),
              results,
            }),
          ),
        );
      });

      strictEqual(results.length, 2);
      ok("returned" in results[1]);
      strictEqual(results[1].returned, undefined);

      ReactTestRenderer.act(() => {
        // This cache entry prune should be prevented.
        cacheEntryPrune(cache, cacheKeyB);
      });

      deepStrictEqual(cache.store, initialCacheStore);

      strictEqual(results.length, 2);

      ReactTestRenderer.act(() => {
        // This cache entry prune should no longer be prevented.
        cacheEntryPrune(cache, cacheKeyA);
      });

      deepStrictEqual(cache.store, { [cacheKeyB]: 2 });

      strictEqual(results.length, 2);
    });
  },
);
