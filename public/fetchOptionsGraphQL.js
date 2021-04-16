'use strict';

const extractFiles = require('extract-files/public/extractFiles');

/**
 * Creates default [`fetch` options]{@link FetchOptions} for a
 * [GraphQL operation]{@link GraphQLOperation}. If the
 * [GraphQL operation]{@link GraphQLOperation} contains files to upload, the
 * options will be for a
 * [GraphQL multipart request](https://github.com/jaydenseric/graphql-multipart-request-spec),
 * otherwise they will be for a regular
 * [GraphQL `POST` request](https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md#post).
 *
 * This utility exists for user convenience and isn’t used directly by the
 * `graphql-react` API. If there is no chance the
 * [GraphQL operation]{@link GraphQLOperation} contains files, avoid using this
 * utility for a smaller bundle size.
 * @kind function
 * @name fetchOptionsGraphQL
 * @param {GraphQLOperation} operation GraphQL operation.
 * @returns {FetchOptions} [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) options.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { fetchOptionsGraphQL } from 'graphql-react';
 * ```
 *
 * ```js
 * import fetchOptionsGraphQL from 'graphql-react/public/fetchOptionsGraphQL.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { fetchOptionsGraphQL } = require('graphql-react');
 * ```
 *
 * ```js
 * const fetchOptionsGraphQL = require('graphql-react/public/fetchOptionsGraphQL');
 * ```
 */
module.exports = function fetchOptionsGraphQL(operation) {
  const fetchOptions = {
    method: 'POST',
    headers: { Accept: 'application/json' },
  };

  const { clone, files } = extractFiles(operation);
  const operationJSON = JSON.stringify(clone);

  if (files.size) {
    // See the GraphQL multipart request spec:
    // https://github.com/jaydenseric/graphql-multipart-request-spec

    const form = new FormData();

    form.set('operations', operationJSON);

    const map = {};
    let i = 0;
    files.forEach((paths) => {
      map[++i] = paths;
    });
    form.set('map', JSON.stringify(map));

    i = 0;
    files.forEach((paths, file) => {
      form.set(`${++i}`, file, file.name);
    });

    fetchOptions.body = form;
  } else {
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = operationJSON;
  }

  return fetchOptions;
};
