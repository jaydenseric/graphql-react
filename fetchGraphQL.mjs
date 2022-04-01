// @ts-check

const ERROR_CODE_FETCH_ERROR = "FETCH_ERROR";
const ERROR_CODE_RESPONSE_HTTP_STATUS = "RESPONSE_HTTP_STATUS";
const ERROR_CODE_RESPONSE_JSON_PARSE_ERROR = "RESPONSE_JSON_PARSE_ERROR";
const ERROR_CODE_RESPONSE_MALFORMED = "RESPONSE_MALFORMED";

/** @typedef {import("./Cache.mjs").CacheValue} CacheValue */
/** @typedef {import("./types.mjs").GraphQLResult} GraphQLResult */

/**
 * Fetches a GraphQL operation, always resolving a
 * {@link GraphQLResult GraphQL result} suitable for use as a
 * {@link CacheValue cache value}, even if there are
 * {@link FetchGraphQLResultError errors}.
 * @param {string} fetchUri Fetch URI for the GraphQL API.
 * @param {RequestInit} [fetchOptions] Fetch options.
 * @returns {Promise<FetchGraphQLResult>} Resolves a result suitable for use as
 *   a {@link CacheValue cache value}. Shouldn’t reject.
 * @see [MDN `fetch` parameters docs](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @see [Polyfillable `fetch` options](https://github.github.io/fetch/#options).
 *   Don’t use other options if `fetch` is polyfilled for Node.js or legacy
 *   browsers.
 */
export default function fetchGraphQL(fetchUri, fetchOptions) {
  /** @type {FetchGraphQLResult} */
  const result = {};

  /** @type {Array<FetchGraphQLResultError>} */
  const resultErrors = [];

  const fetcher =
    typeof fetch === "function"
      ? fetch
      : () => Promise.reject(new TypeError("Global `fetch` API unavailable."));

  return fetcher(fetchUri, fetchOptions)
    .then(
      // Fetch ok.
      (response) => {
        // Allow the response to be read in the cache value, but prevent it from
        // serializing to JSON when sending SSR cache to the client for
        // hydration.
        Object.defineProperty(result, "response", { value: response });

        if (!response.ok)
          resultErrors.push(
            /** @type {import("./types.mjs").GraphQLResultErrorResponseHttpStatus} */ ({
              message: `HTTP ${response.status} status.`,
              extensions: {
                client: true,
                code: ERROR_CODE_RESPONSE_HTTP_STATUS,
                statusCode: response.status,
                statusText: response.statusText,
              },
            })
          );

        return response.json().then(
          // Response JSON parse ok.
          (json) => {
            // It’s not safe to assume that the response data format conforms to
            // the GraphQL spec.
            // https://spec.graphql.org/October2021/#sec-Response-Format

            if (typeof json !== "object" || !json || Array.isArray(json))
              resultErrors.push(
                /** @type {import("./types.mjs").GraphQLResultErrorResponseMalformed}*/ ({
                  message: "Response JSON isn’t an object.",
                  extensions: {
                    client: true,
                    code: ERROR_CODE_RESPONSE_MALFORMED,
                  },
                })
              );
            else {
              const hasErrors = "errors" in json;
              const hasData = "data" in json;

              if (!hasErrors && !hasData)
                resultErrors.push(
                  /** @type {import("./types.mjs").GraphQLResultErrorResponseMalformed}*/ ({
                    message:
                      "Response JSON is missing an `errors` or `data` property.",
                    extensions: {
                      client: true,
                      code: ERROR_CODE_RESPONSE_MALFORMED,
                    },
                  })
                );
              else {
                // The `errors` field should be an array, or not set.
                // https://spec.graphql.org/October2021/#sec-Errors
                if (hasErrors)
                  if (!Array.isArray(json.errors))
                    resultErrors.push(
                      /** @type {import("./types.mjs").GraphQLResultErrorResponseMalformed}*/ ({
                        message:
                          "Response JSON `errors` property isn’t an array.",
                        extensions: {
                          client: true,
                          code: ERROR_CODE_RESPONSE_MALFORMED,
                        },
                      })
                    );
                  else resultErrors.push(...json.errors);

                // The `data` field should be an object, null, or not set.
                // https://spec.graphql.org/October2021/#sec-Data
                if (hasData)
                  if (
                    // Note that `null` is an object.
                    typeof json.data !== "object" ||
                    Array.isArray(json.data)
                  )
                    resultErrors.push(
                      /** @type {import("./types.mjs").GraphQLResultErrorResponseMalformed}*/ ({
                        message:
                          "Response JSON `data` property isn’t an object or null.",
                        extensions: {
                          client: true,
                          code: ERROR_CODE_RESPONSE_MALFORMED,
                        },
                      })
                    );
                  else result.data = json.data;
              }
            }
          },

          // Response JSON parse error.
          ({ message }) => {
            resultErrors.push(
              /** @type {import("./types.mjs").GraphQLResultErrorResponseJsonParse} */ ({
                message: "Response JSON parse error.",
                extensions: {
                  client: true,
                  code: ERROR_CODE_RESPONSE_JSON_PARSE_ERROR,
                  jsonParseErrorMessage: message,
                },
              })
            );
          }
        );
      },

      // Fetch error.
      ({ message }) => {
        resultErrors.push(
          /** @type {import("./types.mjs").GraphQLResultErrorLoadingFetch} */ ({
            message: "Fetch error.",
            extensions: {
              client: true,
              code: ERROR_CODE_FETCH_ERROR,
              fetchErrorMessage: message,
            },
          })
        );
      }
    )
    .then(() => {
      if (resultErrors.length) result.errors = resultErrors;
      return result;
    });
}

/**
 * {@linkcode fetchGraphQL} {@link GraphQLResult GraphQL result}.
 * @typedef {import("./types.mjs").GraphQLResult<
 *   FetchGraphQLResultError
 * >} FetchGraphQLResult
 */

/**
 * {@linkcode fetchGraphQL} {@link GraphQLResult.errors GraphQL result error}.
 * @typedef {FetchGraphQLResultErrorLoading
 *   | import("./types.mjs").GraphQLResultError
 * } FetchGraphQLResultError
 */

/**
 * {@linkcode fetchGraphQL} {@link GraphQLResult.errors GraphQL result error}
 * that’s generated on the client, not the GraphQL server.
 * @typedef {import("./types.mjs").GraphQLResultErrorLoadingFetch
 *   | import("./types.mjs").GraphQLResultErrorResponseHttpStatus
 *   | import("./types.mjs").GraphQLResultErrorResponseJsonParse
 *   | import("./types.mjs").GraphQLResultErrorResponseMalformed
 * } FetchGraphQLResultErrorLoading
 */
