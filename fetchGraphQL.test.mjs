// @ts-check

import { deepStrictEqual, strictEqual } from "node:assert";
import { describe, it } from "node:test";
import revertableGlobals from "revertable-globals";

import fetchGraphQL from "./fetchGraphQL.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";

describe(
  "Function `fetchGraphQL`.",
  {
    // Some of the tests temporarily modify the global `fetch`.
    concurrency: false,
  },
  () => {
    /** @type {ResponseInit} */
    const graphqlResponseOptions = {
      status: 200,
      headers: {
        "Content-Type": "application/graphql+json",
      },
    };

    it("Bundle size.", async () => {
      await assertBundleSize(
        new URL("./fetchGraphQL.mjs", import.meta.url),
        600
      );
    });

    it("Global `fetch` API unavailable.", async () => {
      const revertGlobals = revertableGlobals({
        fetch: undefined,
      });

      try {
        deepStrictEqual(await fetchGraphQL("http://localhost"), {
          errors: [
            {
              message: "Fetch error.",
              extensions: {
                client: true,
                code: "FETCH_ERROR",
                fetchErrorMessage: "Global `fetch` API unavailable.",
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Fetch error.", async () => {
      let fetchedUri;
      let fetchedOptions;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const fetchErrorMessage = "Message.";
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;

          throw new Error(fetchErrorMessage);
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        deepStrictEqual(result, {
          errors: [
            {
              message: "Fetch error.",
              extensions: {
                client: true,
                code: "FETCH_ERROR",
                fetchErrorMessage,
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON parse error, HTTP status ok.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const responseJson = "{";
      const fetchResponse = new Response(responseJson, graphqlResponseOptions);
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchedResponse;
        },
      });

      // Don’t hard-code the expected JSON parse error message in case it differs
      // across environments.
      try {
        JSON.parse(responseJson);
      } catch ({ message }) {
        var jsonParseErrorMessage = message;
      }

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: "Response JSON parse error.",
              extensions: {
                client: true,
                code: "RESPONSE_JSON_PARSE_ERROR",
                jsonParseErrorMessage,
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON parse error, HTTP status error.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const responseJson = "{";
      const fetchResponse = new Response(responseJson, {
        ...graphqlResponseOptions,
        status: 500,
        statusText: "Internal Server Error",
      });
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchedResponse;
        },
      });

      // Don’t hard-code the expected JSON parse error message in case it
      // differs across environments.
      try {
        JSON.parse(responseJson);
      } catch ({ message }) {
        var jsonParseErrorMessage = message;
      }

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: `HTTP ${fetchResponse.status} status.`,
              extensions: {
                client: true,
                code: "RESPONSE_HTTP_STATUS",
                statusCode: fetchResponse.status,
                statusText: fetchResponse.statusText,
              },
            },
            {
              message: "Response JSON parse error.",
              extensions: {
                client: true,
                code: "RESPONSE_JSON_PARSE_ERROR",
                jsonParseErrorMessage,
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON not an object, HTTP status ok.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const fetchResponse = new Response("null", graphqlResponseOptions);
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchedResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: "Response JSON isn’t an object.",
              extensions: {
                client: true,
                code: "RESPONSE_MALFORMED",
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON not an object, HTTP status error.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const fetchResponse = new Response("null", {
        ...graphqlResponseOptions,
        status: 500,
        statusText: "Internal Server Error",
      });
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchedResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: `HTTP ${fetchResponse.status} status.`,
              extensions: {
                client: true,
                code: "RESPONSE_HTTP_STATUS",
                statusCode: fetchResponse.status,
                statusText: fetchResponse.statusText,
              },
            },
            {
              message: "Response JSON isn’t an object.",
              extensions: {
                client: true,
                code: "RESPONSE_MALFORMED",
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON missing an `errors` or `data` property, HTTP status ok.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const fetchResponse = new Response("{}", graphqlResponseOptions);
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchedResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message:
                "Response JSON is missing an `errors` or `data` property.",
              extensions: {
                client: true,
                code: "RESPONSE_MALFORMED",
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON missing an `errors` or `data` property, HTTP status error.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const fetchResponse = new Response("{}", {
        ...graphqlResponseOptions,
        status: 500,
        statusText: "Internal Server Error",
      });
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchedResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: `HTTP ${fetchResponse.status} status.`,
              extensions: {
                client: true,
                code: "RESPONSE_HTTP_STATUS",
                statusCode: fetchResponse.status,
                statusText: fetchResponse.statusText,
              },
            },
            {
              message:
                "Response JSON is missing an `errors` or `data` property.",
              extensions: {
                client: true,
                code: "RESPONSE_MALFORMED",
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON `errors` property not an array, no `data` property, HTTP status ok.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const fetchResponse = new Response(
        JSON.stringify({ errors: null }),
        graphqlResponseOptions
      );
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchedResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: "Response JSON `errors` property isn’t an array.",
              extensions: {
                client: true,
                code: "RESPONSE_MALFORMED",
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON `errors` property not an array, no `data` property, HTTP status error.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const fetchResponse = new Response(JSON.stringify({ errors: null }), {
        ...graphqlResponseOptions,
        status: 500,
        statusText: "Internal Server Error",
      });
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchedResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: `HTTP ${fetchResponse.status} status.`,
              extensions: {
                client: true,
                code: "RESPONSE_HTTP_STATUS",
                statusCode: fetchResponse.status,
                statusText: fetchResponse.statusText,
              },
            },
            {
              message: "Response JSON `errors` property isn’t an array.",
              extensions: {
                client: true,
                code: "RESPONSE_MALFORMED",
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("No response JSON `errors` property, `data` property not an object, HTTP status ok.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const fetchResponse = new Response(
        JSON.stringify({ data: true }),
        graphqlResponseOptions
      );
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: "Response JSON `data` property isn’t an object or null.",
              extensions: {
                client: true,
                code: "RESPONSE_MALFORMED",
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON `errors` property containing an error, no `data` property, HTTP status ok.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const errors = [{ message: "Unauthorized." }];
      const fetchResponse = new Response(
        JSON.stringify({ errors }),
        graphqlResponseOptions
      );
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, { errors });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON `errors` property containing an error, no `data` property, HTTP status error.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const error = { message: "Unauthorized." };
      const fetchResponse = new Response(JSON.stringify({ errors: [error] }), {
        ...graphqlResponseOptions,
        status: 401,
        statusText: "Unauthorized",
      });
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: `HTTP ${fetchResponse.status} status.`,
              extensions: {
                client: true,
                code: "RESPONSE_HTTP_STATUS",
                statusCode: fetchResponse.status,
                statusText: fetchResponse.statusText,
              },
            },
            error,
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON `errors` property containing an error, `data` property populated, HTTP status ok.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const errors = [
        {
          message: 'Cannot query field "b" on type "Query".',
          locations: [{ line: 1, column: 5 }],
        },
      ];
      const data = { a: true };
      const fetchResponse = new Response(
        JSON.stringify({ errors, data }),
        graphqlResponseOptions
      );
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, { errors, data });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON `errors` property containing an error, `data` property populated, HTTP status error.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const error = {
        message: 'Cannot query field "b" on type "Query".',
        locations: [{ line: 1, column: 5 }],
      };
      const data = { a: true };
      const fetchResponse = new Response(
        JSON.stringify({ errors: [error], data }),
        {
          ...graphqlResponseOptions,
          status: 400,
          statusText: "Bad Request",
        }
      );
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: `HTTP ${fetchResponse.status} status.`,
              extensions: {
                client: true,
                code: "RESPONSE_HTTP_STATUS",
                statusCode: fetchResponse.status,
                statusText: fetchResponse.statusText,
              },
            },
            error,
          ],
          data,
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON no `errors` property, `data` property not an object or null, HTTP status ok.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const fetchResponse = new Response(
        JSON.stringify({ data: true }),
        graphqlResponseOptions
      );
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: "Response JSON `data` property isn’t an object or null.",
              extensions: {
                client: true,
                code: "RESPONSE_MALFORMED",
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON no `errors` property, `data` property not an object or null, HTTP status error.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const fetchResponse = new Response(JSON.stringify({ data: true }), {
        ...graphqlResponseOptions,
        status: 500,
        statusText: "Internal Server Error",
      });
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: `HTTP ${fetchResponse.status} status.`,
              extensions: {
                client: true,
                code: "RESPONSE_HTTP_STATUS",
                statusCode: fetchResponse.status,
                statusText: fetchResponse.statusText,
              },
            },
            {
              message: "Response JSON `data` property isn’t an object or null.",
              extensions: {
                client: true,
                code: "RESPONSE_MALFORMED",
              },
            },
          ],
        });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON no `error` property, `data` property populated, HTTP status ok.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const data = { a: true };
      const fetchResponse = new Response(
        JSON.stringify({ data }),
        graphqlResponseOptions
      );
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, { data });
      } finally {
        revertGlobals();
      }
    });

    it("Response JSON no `error` property, `data` property populated, HTTP status error.", async () => {
      let fetchedUri;
      let fetchedOptions;
      let fetchedResponse;

      const fetchUri = "http://localhost";
      const fetchOptions = {};
      const data = { a: true };
      const fetchResponse = new Response(JSON.stringify({ data }), {
        ...graphqlResponseOptions,
        status: 500,
        statusText: "Internal Server Error",
      });
      const revertGlobals = revertableGlobals({
        /**
         * @param {string} uri Fetch URI.
         * @param {RequestInit} options Fetch options.
         * @returns {Promise<Response>} Response.
         */
        async fetch(uri, options) {
          fetchedUri = uri;
          fetchedOptions = options;
          fetchedResponse = fetchResponse;

          return fetchResponse;
        },
      });

      try {
        const result = await fetchGraphQL(fetchUri, fetchOptions);

        strictEqual(fetchedUri, fetchUri);
        strictEqual(fetchedOptions, fetchOptions);
        strictEqual(fetchedResponse, fetchResponse);
        strictEqual(result.response, fetchResponse);
        deepStrictEqual(result, {
          errors: [
            {
              message: `HTTP ${fetchResponse.status} status.`,
              extensions: {
                client: true,
                code: "RESPONSE_HTTP_STATUS",
                statusCode: fetchResponse.status,
                statusText: fetchResponse.statusText,
              },
            },
          ],
          data,
        });
      } finally {
        revertGlobals();
      }
    });
  }
);
