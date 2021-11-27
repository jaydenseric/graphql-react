import { strictEqual } from "assert";
import { useContext } from "react";
import ReactTestRenderer from "react-test-renderer";
import { jsx } from "react/jsx-runtime.js";
import LoadingContext from "./LoadingContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

export default (tests) => {
  tests.add("`LoadingContext` bundle size.", async () => {
    await assertBundleSize(
      new URL("./LoadingContext.mjs", import.meta.url),
      100
    );
  });

  tests.add("`LoadingContext` used as a React context.", () => {
    const TestComponent = () => useContext(LoadingContext);
    const contextValue = "a";
    const testRenderer = ReactTestRenderer.create(
      jsx(LoadingContext.Provider, {
        value: contextValue,
        children: jsx(TestComponent, {}),
      })
    );

    strictEqual(testRenderer.toJSON(), contextValue);
  });
};
