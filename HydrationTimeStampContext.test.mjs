import { strictEqual } from "assert";
import React from "react";
import ReactTestRenderer from "react-test-renderer";
import HydrationTimeStampContext from "./HydrationTimeStampContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

export default (tests) => {
  tests.add("`HydrationTimeStampContext` bundle size.", async () => {
    await assertBundleSize(
      new URL("./HydrationTimeStampContext.mjs", import.meta.url),
      150
    );
  });

  tests.add("`HydrationTimeStampContext` used as a React context.", () => {
    const TestComponent = () => React.useContext(HydrationTimeStampContext);
    const contextValue = "a";
    const testRenderer = ReactTestRenderer.create(
      React.createElement(
        HydrationTimeStampContext.Provider,
        { value: contextValue },
        React.createElement(TestComponent)
      )
    );

    strictEqual(testRenderer.toJSON(), contextValue);
  });
};
