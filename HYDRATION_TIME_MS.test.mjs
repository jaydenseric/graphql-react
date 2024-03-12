// @ts-check

import { strictEqual } from "node:assert";
import { describe, it } from "node:test";

import HYDRATION_TIME_MS from "./HYDRATION_TIME_MS.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

describe("Constant `HYDRATION_TIME_MS`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(
      new URL("./HYDRATION_TIME_MS.mjs", import.meta.url),
      65
    );
  });

  it("Value.", () => {
    strictEqual(HYDRATION_TIME_MS, 1000);
  });
});
