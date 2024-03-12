// @ts-check

import { strictEqual } from "node:assert";
import { describe, it } from "node:test";

import React from "react";

import Loading from "./Loading.mjs";
import LoadingContext from "./LoadingContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";

describe("React context `LoadingContext`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(
      new URL("./LoadingContext.mjs", import.meta.url),
      120,
    );
  });

  it("Used as a React context.", () => {
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
        React.createElement(TestComponent),
      ),
    );

    strictEqual(contextValue, value);
  });
});
