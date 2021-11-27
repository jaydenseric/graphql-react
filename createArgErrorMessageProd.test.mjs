import { strictEqual } from "assert";
import createArgErrorMessageProd from "./createArgErrorMessageProd.mjs";

export default (tests) => {
  tests.add("`createArgErrorMessageProd` functionality.", () => {
    strictEqual(createArgErrorMessageProd(1), "Argument 1 type invalid.");
  });
};
