import { strictEqual } from "assert";
import React from "react";
import ReactTestRenderer from "react-test-renderer";
import CacheContext from "./CacheContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

export default (tests) => {
  tests.add("`CacheContext` bundle size.", async () => {
    await assertBundleSize(new URL("./CacheContext.mjs", import.meta.url), 120);
  });

  tests.add("`CacheContext` used as a React context.", () => {
    const TestComponent = () => React.useContext(CacheContext);
    const contextValue = "a";
    const testRenderer = ReactTestRenderer.create(
      React.createElement(
        CacheContext.Provider,
        { value: contextValue },
        React.createElement(TestComponent)
      )
    );

    strictEqual(testRenderer.toJSON(), contextValue);
  });
};
