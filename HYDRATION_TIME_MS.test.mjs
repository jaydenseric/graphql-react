import { strictEqual } from "assert";
import HYDRATION_TIME_MS from "./HYDRATION_TIME_MS.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

export default (tests) => {
  tests.add("`HYDRATION_TIME_MS` bundle size.", async () => {
    await assertBundleSize(
      new URL("./HYDRATION_TIME_MS.mjs", import.meta.url),
      65
    );
  });

  tests.add("`HYDRATION_TIME_MS` value.", () => {
    strictEqual(HYDRATION_TIME_MS, 1000);
  });
};
