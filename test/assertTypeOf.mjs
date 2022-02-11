// @ts-check

import { AssertionError } from "assert";
import { inspect } from "util";

/**
 * Asserts a value is a given type.
 * @template {keyof TypeMap} ExpectedType
 * @param {unknown} value Value.
 * @param {ExpectedType} expectedType Expected type.
 * @returns {asserts value is TypeMap[ExpectedType]} `void` for JavaScript and
 *   the assertion for TypeScript.
 */
export default function assertTypeOf(value, expectedType) {
  if (typeof value !== expectedType)
    throw new AssertionError({
      message: `Expected type ${inspect(
        expectedType
      )} but actual type is ${inspect(typeof value)} for value:\n\n${inspect(
        value
      )}\n`,
      stackStartFn: assertTypeOf,
    });
}

/**
 * JavaScript type to TypeScript type map.
 * @typedef {{
 *   bigint: BigInt,
 *   boolean: boolean,
 *   function: Function,
 *   number: number,
 *   object: object,
 *   string: string,
 *   symbol: Symbol,
 *   undefined: undefined
 * }} TypeMap
 */
