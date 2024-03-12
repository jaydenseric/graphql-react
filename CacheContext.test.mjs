// @ts-check

import { strictEqual } from "node:assert";
import { describe, it } from "node:test";

import React from "react";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";

describe("React context `CacheContext`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(new URL("./CacheContext.mjs", import.meta.url), 120);
  });

  it("Used as a React context.", () => {
    let contextValue;

    function TestComponent() {
      contextValue = React.useContext(CacheContext);
      return null;
    }

    const value = new Cache();

    createReactTestRenderer(
      React.createElement(
        CacheContext.Provider,
        { value },
        React.createElement(TestComponent),
      ),
    );

    strictEqual(contextValue, value);
  });
});
