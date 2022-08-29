// @ts-check

import extractFiles from "extract-files/extractFiles.mjs";
import isExtractableFile from "extract-files/isExtractableFile.mjs";

/** @typedef {import("./types.mjs").GraphQLOperation} GraphQLOperation */

/**
 * Creates default {@link RequestInit `fetch` options} for a
 * {@link GraphQLOperation GraphQL operation}. If the operation contains files
 * to upload, the options will be for a
 * [GraphQL multipart request](https://github.com/jaydenseric/graphql-multipart-request-spec),
 * otherwise they will be for a regular
 * [GraphQL `POST` request](https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md#post).
 *
 * This utility exists for convenience in projects and isn’t used directly by
 * this library. Avoid using it if there’s no chance the operation contains
 * files.
 * @param {GraphQLOperation} operation GraphQL operation.
 * @returns {RequestInit} [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) options.
 */
export default function fetchOptionsGraphQL(operation) {
  /** @type {RequestInit} */
  const fetchOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  };

  const { clone, files } = extractFiles(operation, isExtractableFile);
  const operationJSON = JSON.stringify(clone);

  if (files.size) {
    // See the GraphQL multipart request spec:
    // https://github.com/jaydenseric/graphql-multipart-request-spec

    const form = new FormData();

    form.set("operations", operationJSON);

    /** @type {{ [formFieldName: string]: Array<string> }} */
    const map = {};

    let i = 0;
    files.forEach((paths) => {
      map[++i] = paths;
    });
    form.set("map", JSON.stringify(map));

    i = 0;
    files.forEach((paths, file) => {
      form.set(
        `${++i}`,
        file,
        // @ts-ignore It’s ok for `name` to be undefined for a `Blob` instance.
        file.name
      );
    });

    fetchOptions.body = form;
  } else {
    /** @type {{ [headerName: string]: string }} */ (fetchOptions.headers)[
      "Content-Type"
    ] = "application/json";
    fetchOptions.body = operationJSON;
  }

  return fetchOptions;
}
