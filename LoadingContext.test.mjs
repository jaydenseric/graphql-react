// @ts-check

import { strictEqual } from "assert";
import React from "react";
import ReactDOMServer from "react-dom/server.js";

import Loading from "./Loading.mjs";
import LoadingContext from "./LoadingContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

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

    /** Test component. */
    function TestComponent() {
      contextValue = React.useContext(LoadingContext);
      return null;
    }

    const value = new Loading();

    ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        LoadingContext.Provider,
        { value },
        React.createElement(TestComponent)
      )
    );

    strictEqual(contextValue, value);
  });
};
