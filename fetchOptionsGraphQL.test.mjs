// @ts-check

import "./test/polyfillFile.mjs";

import { deepStrictEqual, strictEqual } from "node:assert";
import { describe, it } from "node:test";

import fetchOptionsGraphQL from "./fetchOptionsGraphQL.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";

describe("Function `fetchOptionsGraphQL`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(
      new URL("./fetchOptionsGraphQL.mjs", import.meta.url),
      800
    );
  });

  it("Without files.", () => {
    deepStrictEqual(fetchOptionsGraphQL({ query: "" }), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: '{"query":""}',
    });
  });

  it("With files.", () => {
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
  });
});
