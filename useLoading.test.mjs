// @ts-check

import { deepStrictEqual, strictEqual } from "assert";
import {
  cleanup,
  renderHook,
  suppressErrorOutput,
} from "@testing-library/react-hooks/lib/pure.js";
import React from "react";
import Loading from "./Loading.mjs";
import LoadingContext from "./LoadingContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import useLoading from "./useLoading.mjs";

/**
 * Adds `useLoading` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`useLoading` bundle size.", async () => {
    await assertBundleSize(new URL("./useLoading.mjs", import.meta.url), 300);
  });

  tests.add("`useLoading` with loading context missing.", () => {
    try {
      const revertConsole = suppressErrorOutput();

      try {
        var { result } = renderHook(() => useLoading());
      } finally {
        revertConsole();
      }

      deepStrictEqual(result.error, new TypeError("Loading context missing."));
    } finally {
      cleanup();
    }
  });

  tests.add(
    "`useLoading` with loading context value not a `Loading` instance.",
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
          var { result } = renderHook(() => useLoading(), { wrapper });
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

  tests.add("`useLoading` getting the loading.", () => {
    try {
      /** @param {{ loading: Loading, children?: React.ReactNode }} props Props. */
      const wrapper = ({ loading, children }) =>
        React.createElement(
          LoadingContext.Provider,
          { value: loading },
          children
        );

      const loadingA = new Loading();

      const { result, rerender } = renderHook(() => useLoading(), {
        wrapper,
        initialProps: {
          loading: loadingA,
        },
      });

      strictEqual(result.all.length, 1);
      strictEqual(result.current, loadingA);
      strictEqual(result.error, undefined);

      const loadingB = new Loading();

      rerender({ loading: loadingB });

      strictEqual(result.all.length, 2);
      strictEqual(result.current, loadingB);
      strictEqual(result.error, undefined);
    } finally {
      cleanup();
    }
  });
};
