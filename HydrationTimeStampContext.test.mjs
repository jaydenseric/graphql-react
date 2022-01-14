// @ts-check

import { strictEqual } from "assert";
import React from "react";
import ReactDOMServer from "react-dom/server.js";
import HydrationTimeStampContext from "./HydrationTimeStampContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

/**
 * Adds `HydrationTimeStampContext` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`HydrationTimeStampContext` bundle size.", async () => {
    await assertBundleSize(
      new URL("./HydrationTimeStampContext.mjs", import.meta.url),
      150
    );
  });

  tests.add("`HydrationTimeStampContext` used as a React context.", () => {
    let contextValue;

    /** Test component. */
    function TestComponent() {
      contextValue = React.useContext(HydrationTimeStampContext);
      return null;
    }

    const value = 1;

    ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        HydrationTimeStampContext.Provider,
        { value },
        React.createElement(TestComponent)
      )
    );

    strictEqual(contextValue, value);
  });
};
