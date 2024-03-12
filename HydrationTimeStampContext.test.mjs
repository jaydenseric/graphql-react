// @ts-check

import { strictEqual } from "node:assert";
import { describe, it } from "node:test";

import React from "react";

import HydrationTimeStampContext from "./HydrationTimeStampContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";

describe(
  "React context `HydrationTimeStampContext`.",
  { concurrency: true },
  () => {
    it("Bundle size.", async () => {
      await assertBundleSize(
        new URL("./HydrationTimeStampContext.mjs", import.meta.url),
        150,
      );
    });

    it("Used as a React context.", () => {
      let contextValue;

      function TestComponent() {
        contextValue = React.useContext(HydrationTimeStampContext);
        return null;
      }

      const value = 1;

      createReactTestRenderer(
        React.createElement(
          HydrationTimeStampContext.Provider,
          { value },
          React.createElement(TestComponent),
        ),
      );

      strictEqual(contextValue, value);
    });
  },
);
