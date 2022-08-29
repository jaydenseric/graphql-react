// @ts-check

import { strictEqual } from "node:assert";
import React from "react";

import Loading from "./Loading.mjs";
import LoadingContext from "./LoadingContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";

/**
 * Adds `LoadingContext` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`LoadingContext` bundle size.", async () => {
    await assertBundleSize(
      new URL("./LoadingContext.mjs", import.meta.url),
      120
    );
  });

  tests.add("`LoadingContext` used as a React context.", () => {
    let contextValue;

    function TestComponent() {
      contextValue = React.useContext(LoadingContext);
      return null;
    }

    const value = new Loading();

    createReactTestRenderer(
      React.createElement(
        LoadingContext.Provider,
        { value },
        React.createElement(TestComponent)
      )
    );

    strictEqual(contextValue, value);
  });
};
