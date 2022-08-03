// @ts-check

import { strictEqual } from "assert";
import React from "react";
import ReactDOMServer from "react-dom/server";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

/**
 * Adds `CacheContext` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`CacheContext` bundle size.", async () => {
    await assertBundleSize(new URL("./CacheContext.mjs", import.meta.url), 120);
  });

  tests.add("`CacheContext` used as a React context.", () => {
    let contextValue;

    /** Test component. */
    function TestComponent() {
      contextValue = React.useContext(CacheContext);
      return null;
    }

    const value = new Cache();

    ReactDOMServer.renderToStaticMarkup(
      React.createElement(
        CacheContext.Provider,
        { value },
        React.createElement(TestComponent)
      )
    );

    strictEqual(contextValue, value);
  });
};
