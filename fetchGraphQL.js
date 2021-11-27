'use strict';

const isObject = require('isobject/index.cjs.js');

const ERROR_CODE_FETCH_ERROR = 'FETCH_ERROR';
const ERROR_CODE_RESPONSE_HTTP_STATUS = 'RESPONSE_HTTP_STATUS';
const ERROR_CODE_RESPONSE_JSON_PARSE_ERROR = 'RESPONSE_JSON_PARSE_ERROR';
const ERROR_CODE_RESPONSE_MALFORMED = 'RESPONSE_MALFORMED';

/**
 * Fetches a GraphQL operation, always resolving a
 * [GraphQL result]{@link GraphQLResult} suitable for use as a
 * [cache value]{@link CacheValue}, even if there are errors. Loading errors
 * are added to the [GraphQL result]{@link GraphQLResult} `errors` property, and
 * have an `extensions` property containing `client: true`, along with `code`
 * and sometimes error-specific properties:
 *
 * | Error code                  | Reasons                                                                                                                                                           | Error specific properties                     |
 * | :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- |
 * | `FETCH_ERROR`               | Fetch error, e.g. the `fetch` global isn’t defined, or the network is offline.                                                                                    | `fetchErrorMessage` (string).                 |
 * | `RESPONSE_HTTP_STATUS`      | Response HTTP status code is in the error range.                                                                                                                  | `statusCode` (number), `statusText` (string). |
 * | `RESPONSE_JSON_PARSE_ERROR` | Response JSON parse error.                                                                                                                                        | `jsonParseErrorMessage` (string).             |
 * | `RESPONSE_MALFORMED`        | Response JSON isn’t an object, is missing an `errors` or `data` property, the `errors` property isn’t an array, or the `data` property isn’t an object or `null`. |                                               |
 * @kind function
 * @name fetchGraphQL
 * @param {string} fetchUri Fetch URI for the GraphQL API.
 * @param {FetchOptions} fetchOptions Fetch options.
 * @returns {Promise<GraphQLResult>} Resolves a result suitable for use as a [cache value]{@link CacheValue}. Shouldn’t reject.
 * @example <caption>How to `import`.</caption>
 * ```js
 * import fetchGraphQL from 'graphql-react/fetchGraphQL.js';
 * ```
 * @example <caption>How to `require`.</caption>
 * ```js
 * const fetchGraphQL = require('graphql-react/fetchGraphQL.js');
 * ```
 */
module.exports = function fetchGraphQL(fetchUri, fetchOptions) {
  const result = { errors: [] };
  const fetcher =
    typeof fetch === 'function'
      ? fetch
      : () => Promise.reject(new TypeError('Global `fetch` API unavailable.'));

  return fetcher(fetchUri, fetchOptions)
    .then(
      // Fetch ok.
      (response) => {
        // Allow the response to be read in the cache value, but prevent it from
        // serializing to JSON when sending SSR cache to the client for
        // hydration.
        Object.defineProperty(result, 'response', { value: response });

        if (!response.ok)
          result.errors.push({
            message: `HTTP ${response.status} status.`,
            extensions: {
              client: true,
              code: ERROR_CODE_RESPONSE_HTTP_STATUS,
              statusCode: response.status,
              statusText: response.statusText,
            },
          });

        return response.json().then(
          // Response JSON parse ok.
          (json) => {
            // It’s not safe to assume that the response data format conforms to
            // the GraphQL spec.
            // https://spec.graphql.org/June2018/#sec-Response-Format

            if (!isObject(json))
              result.errors.push({
                message: 'Response JSON isn’t an object.',
                extensions: {
                  client: true,
                  code: ERROR_CODE_RESPONSE_MALFORMED,
                },
              });
            else {
              const hasErrors = 'errors' in json;
              const hasData = 'data' in json;

              if (!hasErrors && !hasData)
                result.errors.push({
                  message:
                    'Response JSON is missing an `errors` or `data` property.',
                  extensions: {
                    client: true,
                    code: ERROR_CODE_RESPONSE_MALFORMED,
                  },
                });
              else {
                // The `errors` field should be either an array, or not set.
                // https://spec.graphql.org/June2018/#sec-Errors
                if (hasErrors)
                  if (!Array.isArray(json.errors))
                    result.errors.push({
                      message:
                        'Response JSON `errors` property isn’t an array.',
                      extensions: {
                        client: true,
                        code: ERROR_CODE_RESPONSE_MALFORMED,
                      },
                    });
                  else result.errors.push(...json.errors);

                // The `data` field should be either an object, null, or not set.
                // https://spec.graphql.org/June2018/#sec-Data
                if (hasData)
                  if (!isObject(json.data) && json.data !== null)
                    result.errors.push({
                      message:
                        'Response JSON `data` property isn’t an object or null.',
                      extensions: {
                        client: true,
                        code: ERROR_CODE_RESPONSE_MALFORMED,
                      },
                    });
                  else result.data = json.data;
              }
            }
          },

          // Response JSON parse error.
          ({ message }) => {
            result.errors.push({
              message: 'Response JSON parse error.',
              extensions: {
                client: true,
                code: ERROR_CODE_RESPONSE_JSON_PARSE_ERROR,
                jsonParseErrorMessage: message,
              },
            });
          }
        );
      },

      // Fetch error.
      ({ message }) => {
        result.errors.push({
          message: 'Fetch error.',
          extensions: {
            client: true,
            code: ERROR_CODE_FETCH_ERROR,
            fetchErrorMessage: message,
          },
        });
      }
    )
    .then(() => {
      if (!result.errors.length) delete result.errors;
      return result;
    });
};
