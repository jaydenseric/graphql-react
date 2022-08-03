// @ts-check

import { strictEqual, throws } from "assert";
import React from "react";
import ReactTestRenderer from "react-test-renderer";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import HydrationTimeStampContext from "./HydrationTimeStampContext.mjs";
import Loading from "./Loading.mjs";
import LoadingContext from "./LoadingContext.mjs";
import Provider from "./Provider.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";
import assertTypeOf from "./test/assertTypeOf.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import suppressReactRenderErrorConsoleOutput from "./test/suppressReactRenderErrorConsoleOutput.mjs";

/**
 * Adds `Provider` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`Provider` bundle size.", async () => {
    await assertBundleSize(new URL("./Provider.mjs", import.meta.url), 500);
  });

  tests.add("`Provider` with prop `cache` missing.", () => {
    const revertConsole = suppressReactRenderErrorConsoleOutput();

    try {
      throws(() => {
        createReactTestRenderer(
          React.createElement(
            Provider,
            // @ts-expect-error Testing invalid.
            {}
          )
        );
      }, new TypeError("Prop `cache` must be a `Cache` instance."));
    } finally {
      revertConsole();
    }
  });

  tests.add("`Provider` used correctly.", () => {
    /**
     * @type {Array<{
     *   hydrationTimeStampContextValue: number | undefined,
     *   cacheContextValue: Cache | undefined,
     *   loadingContextValue: Loading | undefined
     * }>}
     */
    const results = [];

    function TestComponent() {
      results.push({
        hydrationTimeStampContextValue: React.useContext(
          HydrationTimeStampContext
        ),
        cacheContextValue: React.useContext(CacheContext),
        loadingContextValue: React.useContext(LoadingContext),
      });
      return null;
    }

    const cache = new Cache();
    const testRenderer = createReactTestRenderer(
      React.createElement(
        Provider,
        { cache },
        React.createElement(TestComponent)
      )
    );

    strictEqual(results.length, 1);
    assertTypeOf(results[0].hydrationTimeStampContextValue, "number");
    strictEqual(
      performance.now() - results[0].hydrationTimeStampContextValue < 100,
      true
    );
    strictEqual(results[0].cacheContextValue, cache);
    assertInstanceOf(results[0].loadingContextValue, Loading);

    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          Provider,
          {
            // @ts-ignore Force the component to re-render by setting a new
            // arbitrary prop.
            a: true,
            cache,
          },
          React.createElement(TestComponent)
        )
      );
    });

    strictEqual(results.length, 2);
    strictEqual(
      results[1].hydrationTimeStampContextValue,
      results[0].hydrationTimeStampContextValue
    );
    strictEqual(results[1].cacheContextValue, results[0].cacheContextValue);
    strictEqual(results[1].loadingContextValue, results[0].loadingContextValue);
  });
};
