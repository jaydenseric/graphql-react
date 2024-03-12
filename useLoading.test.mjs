// @ts-check

import { deepStrictEqual, ok, strictEqual } from "node:assert";
import { describe, it } from "node:test";
import React from "react";
import ReactTestRenderer from "react-test-renderer";

import Loading from "./Loading.mjs";
import LoadingContext from "./LoadingContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useLoading from "./useLoading.mjs";

describe("React hook `useLoading`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(new URL("./useLoading.mjs", import.meta.url), 300);
  });

  it("Loading context missing.", () => {
    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(ReactHookTest, {
        useHook: useLoading,
        results,
      })
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(
      results[0].threw,
      new TypeError("Loading context missing.")
    );
  });

  it("Loading context value not a `Loading` instance.", () => {
    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(
        LoadingContext.Provider,
        {
          // @ts-expect-error Testing invalid.
          value: true,
        },
        React.createElement(ReactHookTest, {
          useHook: useLoading,
          results,
        })
      )
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(
      results[0].threw,
      new TypeError("Loading context value must be a `Loading` instance.")
    );
  });

  it("Getting the loading.", () => {
    const loadingA = new Loading();

    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    const testRenderer = createReactTestRenderer(
      React.createElement(
        LoadingContext.Provider,
        { value: loadingA },
        React.createElement(ReactHookTest, {
          useHook: useLoading,
          results,
        })
      )
    );

    strictEqual(results.length, 1);
    ok("returned" in results[0]);
    strictEqual(results[0].returned, loadingA);

    const loadingB = new Loading();

    ReactTestRenderer.act(() => {
      testRenderer.update(
        React.createElement(
          LoadingContext.Provider,
          { value: loadingB },
          React.createElement(ReactHookTest, {
            useHook: useLoading,
            results,
          })
        )
      );
    });

    strictEqual(results.length, 2);
    ok("returned" in results[1]);
    strictEqual(results[1].returned, loadingB);
  });
});
