// @ts-check

import {
  act,
  cleanup,
  renderHook,
} from "@testing-library/react-hooks/lib/pure.js";
import { strictEqual } from "assert";

import assertTypeOf from "./test/assertTypeOf.mjs";
import useForceUpdate from "./useForceUpdate.mjs";

/**
 * Adds `useForceUpdate` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`useForceUpdate` forcing an update.", async () => {
    try {
      const { result } = renderHook(() => useForceUpdate());

      strictEqual(result.all.length, 1);
      assertTypeOf(result.current, "function");
      strictEqual(result.error, undefined);

      act(() => {
        result.current();
      });

      strictEqual(result.all.length, 2);
      assertTypeOf(result.current, "function");
      strictEqual(result.error, undefined);

      act(() => {
        result.current();
      });

      strictEqual(result.all.length, 3);
      assertTypeOf(result.current, "function");
      strictEqual(result.error, undefined);
    } finally {
      cleanup();
    }
  });
};
