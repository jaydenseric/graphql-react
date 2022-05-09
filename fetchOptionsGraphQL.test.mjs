// @ts-check

import { deepStrictEqual, strictEqual } from "assert";
import { File, FormData } from "node-fetch";
import revertableGlobals from "revertable-globals";

import fetchOptionsGraphQL from "./fetchOptionsGraphQL.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

/**
 * Adds `fetchOptionsGraphQL` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`fetchOptionsGraphQL` bundle size.", async () => {
    await assertBundleSize(
      new URL("./fetchOptionsGraphQL.mjs", import.meta.url),
      800
    );
  });

  tests.add("`fetchOptionsGraphQL` without files.", () => {
    deepStrictEqual(fetchOptionsGraphQL({ query: "" }), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: '{"query":""}',
    });
  });

  tests.add("`fetchOptionsGraphQL` with files.", () => {
    const revertGlobals = revertableGlobals({ File, FormData });

    try {
      const fileName = "a.txt";
      const options = fetchOptionsGraphQL({
        query: "",
        variables: { a: new File(["a"], fileName) },
      });

      // See the GraphQL multipart request spec:
      // https://github.com/jaydenseric/graphql-multipart-request-spec

      strictEqual(options.method, "POST");
      deepStrictEqual(options.headers, { Accept: "application/json" });
      assertInstanceOf(options.body, FormData);

      const formDataEntries = Array.from(options.body.entries());

      strictEqual(formDataEntries.length, 3);
      deepStrictEqual(formDataEntries[0], [
        "operations",
        '{"query":"","variables":{"a":null}}',
      ]);
      deepStrictEqual(formDataEntries[1], ["map", '{"1":["variables.a"]}']);
      strictEqual(formDataEntries[2][0], "1");
      assertInstanceOf(formDataEntries[2][1], File);
      strictEqual(formDataEntries[2][1].name, fileName);
    } finally {
      revertGlobals();
    }
  });
};
