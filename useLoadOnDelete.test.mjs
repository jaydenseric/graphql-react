import { deepStrictEqual, strictEqual, throws } from "assert";
import {
  cleanup,
  renderHook,
  suppressErrorOutput,
} from "@testing-library/react-hooks/lib/pure.js";
import React from "react";
import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import cacheEntryDelete from "./cacheEntryDelete.mjs";
import cacheEntrySet from "./cacheEntrySet.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import useLoadOnDelete from "./useLoadOnDelete.mjs";

export default (tests) => {
  tests.add("`useLoadOnDelete` bundle size.", async () => {
    await assertBundleSize(
      new URL("./useLoadOnDelete.mjs", import.meta.url),
      500
    );
  });

  tests.add("`useLoadOnDelete` argument 1 `cacheKey` not a string.", () => {
    throws(() => {
      useLoadOnDelete(true);
    }, new TypeError("Argument 1 `cacheKey` must be a string."));
  });

  tests.add("`useLoadOnDelete` argument 2 `load` not a function.", () => {
    throws(() => {
      useLoadOnDelete("a", true);
    }, new TypeError("Argument 2 `load` must be a function."));
  });

  tests.add("`useLoadOnDelete` with cache context missing.", () => {
    try {
      const revertConsole = suppressErrorOutput();

      try {
        var { result } = renderHook(() => useLoadOnDelete("a", () => {}));
      } finally {
        revertConsole();
      }

      deepStrictEqual(result.error, new TypeError("Cache context missing."));
    } finally {
      cleanup();
    }
  });

  tests.add(
    "`useLoadOnDelete` with cache context value not a `Cache` instance.",
    () => {
      try {
        const wrapper = ({ children }) =>
          React.createElement(CacheContext.Provider, { value: true }, children);

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useLoadOnDelete("a", () => {}), {
            wrapper,
          });
        } finally {
          revertConsole();
        }

        deepStrictEqual(
          result.error,
          new TypeError("Cache context value must be a `Cache` instance.")
        );
      } finally {
        cleanup();
      }
    }
  );

  tests.add("`useLoadOnDelete` functionality.", async () => {
    const cacheKeyA = "a";
    const cacheKeyB = "b";
    const cacheA = new Cache({
      // Populate the cache entry so it can be deleted.
      [cacheKeyA]: 0,
    });
    const cacheB = new Cache({
      // Populate the cache entries so they can be deleted.
      [cacheKeyA]: 0,
      [cacheKeyB]: 0,
    });

    let loadCalls = [];

    // eslint-disable-next-line jsdoc/require-jsdoc
    function loadA() {
      loadCalls.push({
        loader: loadA,
        hadArgs: !!arguments.length,
      });
    }

    // eslint-disable-next-line jsdoc/require-jsdoc
    function loadB() {
      loadCalls.push({
        loader: loadB,
        hadArgs: !!arguments.length,
      });
    }

    const wrapper = ({ cache, children }) =>
      React.createElement(CacheContext.Provider, { value: cache }, children);

    try {
      const { result, rerender } = renderHook(
        ({ cacheKey, load }) => useLoadOnDelete(cacheKey, load),
        {
          wrapper,
          initialProps: {
            cache: cacheA,
            cacheKey: cacheKeyA,
            load: loadA,
          },
        }
      );

      strictEqual(result.all.length, 1);
      strictEqual(result.current, undefined);
      strictEqual(result.error, undefined);

      cacheEntryDelete(cacheA, cacheKeyA);

      deepStrictEqual(loadCalls, [
        {
          loader: loadA,
          hadArgs: false,
        },
      ]);

      loadCalls = [];

      // Test that re-rendering with the a different cache causes the listener
      // to be moved to the new cache.
      rerender({
        cache: cacheB,
        cacheKey: cacheKeyA,
        load: loadA,
      });

      strictEqual(result.all.length, 2);
      strictEqual(result.current, undefined);
      strictEqual(result.error, undefined);

      cacheEntryDelete(cacheB, cacheKeyA);

      deepStrictEqual(loadCalls, [
        {
          loader: loadA,
          hadArgs: false,
        },
      ]);

      loadCalls = [];

      // Test that re-rendering with a different cache key causes the listener
      // to be updated.
      rerender({
        cache: cacheB,
        cacheKey: cacheKeyB,
        load: loadA,
      });

      strictEqual(result.all.length, 3);
      strictEqual(result.current, undefined);
      strictEqual(result.error, undefined);

      cacheEntryDelete(cacheB, cacheKeyB);

      deepStrictEqual(loadCalls, [
        {
          loader: loadA,
          hadArgs: false,
        },
      ]);

      loadCalls = [];

      // Test that re-rendering with a different loader causes the listener
      // to be updated.
      rerender({
        cache: cacheB,
        cacheKey: cacheKeyB,
        load: loadB,
      });

      strictEqual(result.all.length, 4);
      strictEqual(result.current, undefined);
      strictEqual(result.error, undefined);

      // Repopulate the cache entry with any value so it can be deleted again.
      cacheEntrySet(cacheB, cacheKeyB, 0);
      cacheEntryDelete(cacheB, cacheKeyB);

      deepStrictEqual(loadCalls, [
        {
          loader: loadB,
          hadArgs: false,
        },
      ]);

      // Nothing should have caused a re-render.
      strictEqual(result.all.length, 4);
    } finally {
      cleanup();
    }
  });
};
