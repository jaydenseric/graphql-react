import { strictEqual } from "assert";
import React from "react";
import ReactTestRenderer from "react-test-renderer";
import LoadingContext from "./LoadingContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

export default (tests) => {
  tests.add("`LoadingContext` bundle size.", async () => {
    await assertBundleSize(
      new URL("./LoadingContext.mjs", import.meta.url),
      120
    );
  });

  tests.add("`LoadingContext` used as a React context.", () => {
    const TestComponent = () => React.useContext(LoadingContext);
    const contextValue = "a";
    const testRenderer = ReactTestRenderer.create(
      React.createElement(
        LoadingContext.Provider,
        { value: contextValue },
        React.createElement(TestComponent)
      )
    );

    strictEqual(testRenderer.toJSON(), contextValue);
  });
};
