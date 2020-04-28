'use strict';

const { extractFiles } = require('extract-files');

/**
 * Gets default [`fetch` options]{@link GraphQLFetchOptions} for a
 * [GraphQL operation]{@link GraphQLOperation}.
 * @param {GraphQLOperation} operation GraphQL operation.
 * @returns {GraphQLFetchOptions} [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API) options.
 * @ignore
 */
module.exports = function graphqlFetchOptions(operation) {
  const fetchOptions = {
    url: '/graphql',
    method: 'POST',
    headers: { Accept: 'application/json' },
  };

  const { clone, files } = extractFiles(operation);
  const operationJSON = JSON.stringify(clone);

  if (files.size) {
    // See the GraphQL multipart request spec:
    // https://github.com/jaydenseric/graphql-multipart-request-spec

    const form = new FormData();

    form.append('operations', operationJSON);

    const map = {};
    let i = 0;
    files.forEach((paths) => {
      map[++i] = paths;
    });
    form.append('map', JSON.stringify(map));

    i = 0;
    files.forEach((paths, file) => {
      form.append(`${++i}`, file, file.name);
    });

    fetchOptions.body = form;
  } else {
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = operationJSON;
  }

  return fetchOptions;
};
