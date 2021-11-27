import { strictEqual } from "assert";
import { useContext } from "react";
import ReactTestRenderer from "react-test-renderer";
import { jsx } from "react/jsx-runtime.js";
import CacheContext from "./CacheContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

export default (tests) => {
  tests.add("`CacheContext` bundle size.", async () => {
    await assertBundleSize(new URL("./CacheContext.mjs", import.meta.url), 100);
  });

  tests.add("`CacheContext` used as a React context.", () => {
    const TestComponent = () => useContext(CacheContext);
    const contextValue = "a";
    const testRenderer = ReactTestRenderer.create(
      jsx(CacheContext.Provider, {
        value: contextValue,
        children: jsx(TestComponent, {}),
      })
    );

    strictEqual(testRenderer.toJSON(), contextValue);
  });
};
