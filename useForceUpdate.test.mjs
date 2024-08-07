// @ts-check

/** @import { ReactHookResult } from "./test/ReactHookTest.mjs" */

import { ok, strictEqual } from "node:assert";
import { describe, it } from "node:test";

import React from "react";
import ReactTestRenderer from "react-test-renderer";

import assertTypeOf from "./test/assertTypeOf.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useForceUpdate from "./useForceUpdate.mjs";

describe("React hook `useForceUpdate`.", { concurrency: true }, () => {
  it("Forcing an update.", async () => {
    /** @type {Array<ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(ReactHookTest, {
        useHook: useForceUpdate,
        results,
      }),
    );

    strictEqual(results.length, 1);
    ok("returned" in results[0]);

    const result1Returned = results[0].returned;

    assertTypeOf(result1Returned, "function");

    ReactTestRenderer.act(() => {
      result1Returned();
    });

    strictEqual(results.length, 2);
    ok("returned" in results[1]);

    const result2Returned = results[1].returned;

    assertTypeOf(result2Returned, "function");

    ReactTestRenderer.act(() => {
      result2Returned();
    });

    strictEqual(results.length, 3);
    ok("returned" in results[2]);
    assertTypeOf(results[2].returned, "function");
  });
});
