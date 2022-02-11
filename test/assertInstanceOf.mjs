// @ts-check

import { AssertionError } from "assert";
import { inspect } from "util";

/**
 * Asserts a value is an instance of a given class.
 * @template ExpectedClass
 * @param {unknown} value Value.
 * @param {{ new(...args: any): ExpectedClass }} expectedClass Expected class.
 * @returns {asserts value is ExpectedClass} `void` for JavaScript and the
 *   assertion for TypeScript.
 */
export default function assertInstanceOf(value, expectedClass) {
  if (!(value instanceof expectedClass))
    throw new AssertionError({
      message: `Expected instance of ${inspect(
        expectedClass
      )} for value:\n\n${inspect(value)}\n`,
      stackStartFn: assertInstanceOf,
    });
}
