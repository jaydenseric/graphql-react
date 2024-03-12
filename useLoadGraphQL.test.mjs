// @ts-check

import "./test/polyfillCustomEvent.mjs";

import { deepStrictEqual, fail, ok, strictEqual, throws } from "node:assert";
import { after, describe, it } from "node:test";

import React from "react";
import ReactTestRenderer from "react-test-renderer";
import revertableGlobals from "revertable-globals";

import Cache from "./Cache.mjs";
import CacheContext from "./CacheContext.mjs";
import cacheDelete from "./cacheDelete.mjs";
import Loading from "./Loading.mjs";
import LoadingCacheValue from "./LoadingCacheValue.mjs";
import LoadingContext from "./LoadingContext.mjs";
import assertBundleSize from "./test/assertBundleSize.mjs";
import assertInstanceOf from "./test/assertInstanceOf.mjs";
import assertTypeOf from "./test/assertTypeOf.mjs";
import createReactTestRenderer from "./test/createReactTestRenderer.mjs";
import ReactHookTest from "./test/ReactHookTest.mjs";
import useLoadGraphQL from "./useLoadGraphQL.mjs";

describe("React hook `useLoadGraphQL`.", { concurrency: true }, () => {
  it("Bundle size.", async () => {
    await assertBundleSize(
      new URL("./useLoadGraphQL.mjs", import.meta.url),
      1800,
    );
  });

  it("Cache context missing.", () => {
    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(ReactHookTest, {
        useHook: useLoadGraphQL,
        results,
      }),
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(results[0].threw, new TypeError("Cache context missing."));
  });

  it("Cache context value not a `Cache` instance.", () => {
    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(
        CacheContext.Provider,
        {
          // @ts-expect-error Testing invalid.
          value: true,
        },
        React.createElement(ReactHookTest, {
          useHook: useLoadGraphQL,
          results,
        }),
      ),
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(
      results[0].threw,
      new TypeError("Cache context value must be a `Cache` instance."),
    );
  });

  it("Loading context missing.", () => {
    const cache = new Cache();

    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(
        CacheContext.Provider,
        { value: cache },
        React.createElement(ReactHookTest, {
          useHook: useLoadGraphQL,
          results,
        }),
      ),
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(
      results[0].threw,
      new TypeError("Loading context missing."),
    );
  });

  it("Loading context value not a `Loading` instance.", () => {
    const cache = new Cache();

    /** @type {Array<import("./test/ReactHookTest.mjs").ReactHookResult>} */
    const results = [];

    createReactTestRenderer(
      React.createElement(
        CacheContext.Provider,
        { value: cache },
        React.createElement(
          LoadingContext.Provider,
          {
            // @ts-expect-error Testing invalid.
            value: true,
          },
          React.createElement(ReactHookTest, {
            useHook: useLoadGraphQL,
            results,
          }),
        ),
      ),
    );

    strictEqual(results.length, 1);
    ok("threw" in results[0]);
    deepStrictEqual(
      results[0].threw,
      new TypeError("Loading context value must be a `Loading` instance."),
    );
  });

  describe(
    "Functionality.",
    {
      // Some of the tests temporarily modify the global `fetch`.
      concurrency: false,
    },
    async () => {
      const cache = new Cache();
      const loading = new Loading();

      /**
       * @type {Array<
       *   import("./test/ReactHookTest.mjs").ReactHookResult<
       *     ReturnType<useLoadGraphQL>
       *   >
       * >}
       */
      const results = [];

      createReactTestRenderer(
        React.createElement(
          CacheContext.Provider,
          { value: cache },
          React.createElement(
            LoadingContext.Provider,
            { value: loading },
            React.createElement(ReactHookTest, {
              useHook: useLoadGraphQL,
              results,
            }),
          ),
        ),
      );

      strictEqual(results.length, 1);
      ok("returned" in results[0]);
      assertTypeOf(results[0].returned, "function");

      // Test that re-rendering with the same props doesn’t cause the returned
      // load GraphQL function to change.
      ReactTestRenderer.act(() => {
        results[0].rerender();
      });

      strictEqual(results.length, 2);
      ok("returned" in results[1]);

      const result2Returned = results[1].returned;

      strictEqual(result2Returned, results[0].returned);

      after(() => {
        // No re-rendering should have happened.
        strictEqual(results.length, 2);
      });

      it("Load GraphQL with argument 1 `cacheKey` not a string.", () => {
        throws(() => {
          result2Returned(
            // @ts-expect-error Testing invalid.
            true,
            "",
            {},
          );
        }, new TypeError("Argument 1 `cacheKey` must be a string."));
      });

      it("Load GraphQL with argument 2 `fetchUri` not a string.", () => {
        throws(() => {
          result2Returned(
            "a",
            // @ts-expect-error Testing invalid.
            true,
            {},
          );
        }, new TypeError("Argument 2 `fetchUri` must be a string."));
      });

      it("Load GraphQL with argument 3 `fetchOptions` not an object.", () => {
        throws(() => {
          result2Returned(
            "a",
            "",
            // @ts-expect-error Testing invalid.
            null,
          );
        }, new TypeError("Argument 3 `fetchOptions` must be an object."));
      });

      it("Load GraphQL without aborting.", async () => {
        const fetchUri = "the-uri";
        const fetchOptions = Object.freeze({ body: "a" });
        const cacheKey = "a";
        const cacheValue = {
          data: {
            a: 1,
          },
        };

        /** @type {string | undefined} */
        let fetchedUri;

        /** @type {RequestInit | undefined} */
        let fetchedOptions;

        /** @type {LoadingCacheValue | undefined} */
        let loadGraphQLReturn;

        const revertGlobals = revertableGlobals({
          /**
           * @param {string} uri Fetch URI.
           * @param {RequestInit} options Fetch options.
           */
          async fetch(uri, options) {
            fetchedUri = uri;
            fetchedOptions = options;

            return new Response(JSON.stringify(cacheValue), {
              status: 200,
              headers: {
                "Content-Type": "application/graphql+json",
              },
            });
          },
        });

        try {
          try {
            ReactTestRenderer.act(() => {
              loadGraphQLReturn = result2Returned(
                cacheKey,
                fetchUri,
                fetchOptions,
              );
            });
          } finally {
            revertGlobals();
          }

          strictEqual(fetchedUri, fetchUri);
          assertTypeOf(fetchedOptions, "object");

          const { signal: fetchedOptionsSignal, ...fetchedOptionsRest } =
            fetchedOptions;

          assertInstanceOf(fetchedOptionsSignal, AbortSignal);
          deepStrictEqual(fetchedOptionsRest, fetchOptions);

          assertInstanceOf(loadGraphQLReturn, LoadingCacheValue);
          deepStrictEqual(await loadGraphQLReturn.promise, cacheValue);
          deepStrictEqual(cache.store, {
            [cacheKey]: cacheValue,
          });
        } finally {
          // Undo any cache changes for future tests.
          cacheDelete(cache);
        }
      });

      it("Load GraphQL aborting, no fetch options `signal`.", async () => {
        const fetchUri = "the-uri";
        const fetchOptions = Object.freeze({ body: "a" });
        const fetchError = new Error("The operation was aborted.");
        const cacheKey = "a";

        /** @type {string | undefined} */
        let fetchedUri;

        /** @type {RequestInit | undefined} */
        let fetchedOptions;

        /** @type {LoadingCacheValue | undefined} */
        let loadGraphQLReturn;

        const revertGlobals = revertableGlobals({
          /**
           * @param {string} uri Fetch URI.
           * @param {RequestInit} options Fetch options.
           */
          async fetch(uri, options) {
            fetchedUri = uri;
            fetchedOptions = options;

            return new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(fail("Fetch wasn’t aborted."));
              }, 800);

              assertInstanceOf(options.signal, AbortSignal);

              options.signal.addEventListener(
                "abort",
                () => {
                  clearTimeout(timeout);
                  reject(fetchError);
                },
                { once: true },
              );
            });
          },
        });

        try {
          try {
            ReactTestRenderer.act(() => {
              loadGraphQLReturn = result2Returned(
                cacheKey,
                fetchUri,
                fetchOptions,
              );
            });
          } finally {
            revertGlobals();
          }

          strictEqual(fetchedUri, fetchUri);
          assertTypeOf(fetchedOptions, "object");

          const { signal: fetchedOptionsSignal, ...fetchedOptionsRest } =
            fetchedOptions;

          assertInstanceOf(fetchedOptionsSignal, AbortSignal);
          deepStrictEqual(fetchedOptionsRest, fetchOptions);
          assertInstanceOf(loadGraphQLReturn, LoadingCacheValue);

          loadGraphQLReturn.abortController.abort();

          deepStrictEqual(await loadGraphQLReturn.promise, {
            errors: [
              {
                message: "Fetch error.",
                extensions: {
                  client: true,
                  code: "FETCH_ERROR",
                  fetchErrorMessage: fetchError.message,
                },
              },
            ],
          });
          deepStrictEqual(
            cache.store,
            // Cache shouldn’t be affected by aborted loading.
            {},
          );
        } finally {
          // Undo any cache changes for future tests.
          cacheDelete(cache);
        }
      });

      it("Load GraphQL aborting, fetch options `signal`, not yet aborted.", async () => {
        const fetchUri = "the-uri";
        const abortController = new AbortController();
        const fetchOptionsWithoutSignal = { body: "a" };
        const fetchOptions = Object.freeze({
          ...fetchOptionsWithoutSignal,
          signal: abortController.signal,
        });
        const fetchError = new Error("The operation was aborted.");
        const cacheKey = "a";

        /** @type {string | undefined} */
        let fetchedUri;

        /** @type {RequestInit | undefined} */
        let fetchedOptions;

        /** @type {LoadingCacheValue | undefined} */
        let loadGraphQLReturn;

        const revertGlobals = revertableGlobals({
          /**
           * @param {string} uri Fetch URI.
           * @param {RequestInit} options Fetch options.
           */
          async fetch(uri, options) {
            fetchedUri = uri;
            fetchedOptions = options;

            return new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(fail("Fetch wasn’t aborted."));
              }, 800);

              assertInstanceOf(options.signal, AbortSignal);

              options.signal.addEventListener(
                "abort",
                () => {
                  clearTimeout(timeout);
                  reject(fetchError);
                },
                { once: true },
              );
            });
          },
        });

        try {
          try {
            ReactTestRenderer.act(() => {
              loadGraphQLReturn = result2Returned(
                cacheKey,
                fetchUri,
                fetchOptions,
              );
            });
          } finally {
            revertGlobals();
          }

          strictEqual(fetchedUri, fetchUri);
          assertTypeOf(fetchedOptions, "object");

          const { signal: fetchedOptionsSignal, ...fetchedOptionsRest } =
            fetchedOptions;

          assertInstanceOf(fetchedOptionsSignal, AbortSignal);
          deepStrictEqual(fetchedOptionsRest, fetchOptionsWithoutSignal);
          assertInstanceOf(loadGraphQLReturn, LoadingCacheValue);

          abortController.abort();

          deepStrictEqual(await loadGraphQLReturn.promise, {
            errors: [
              {
                message: "Fetch error.",
                extensions: {
                  client: true,
                  code: "FETCH_ERROR",
                  fetchErrorMessage: fetchError.message,
                },
              },
            ],
          });
          deepStrictEqual(
            cache.store,
            // Cache shouldn’t be affected by aborted loading.
            {},
          );
        } finally {
          // Undo any cache changes for future tests.
          cacheDelete(cache);
        }
      });

      it("Load GraphQL aborting, fetch options `signal`, already aborted.", async () => {
        const fetchUri = "the-uri";
        const abortController = new AbortController();

        abortController.abort();

        const fetchOptionsWithoutSignal = { body: "a" };
        const fetchOptions = Object.freeze({
          ...fetchOptionsWithoutSignal,
          signal: abortController.signal,
        });
        const fetchError = new Error("The operation was aborted.");
        const cacheKey = "a";

        /** @type {string | undefined} */
        let fetchedUri;

        /** @type {RequestInit | undefined} */
        let fetchedOptions;

        /** @type {LoadingCacheValue | undefined} */
        let loadGraphQLReturn;

        const revertGlobals = revertableGlobals({
          /**
           * @param {string} uri Fetch URI.
           * @param {RequestInit} options Fetch options.
           */
          async fetch(uri, options) {
            fetchedUri = uri;
            fetchedOptions = options;

            assertInstanceOf(options.signal, AbortSignal);

            throw options.signal.aborted
              ? fetchError
              : fail("Abort signal wasn’t already aborted.");
          },
        });

        try {
          try {
            ReactTestRenderer.act(() => {
              loadGraphQLReturn = result2Returned(
                cacheKey,
                fetchUri,
                fetchOptions,
              );
            });
          } finally {
            revertGlobals();
          }

          strictEqual(fetchedUri, fetchUri);
          assertTypeOf(fetchedOptions, "object");

          const { signal: fetchedOptionsSignal, ...fetchedOptionsRest } =
            fetchedOptions;

          assertInstanceOf(fetchedOptionsSignal, AbortSignal);
          deepStrictEqual(fetchedOptionsRest, fetchOptionsWithoutSignal);
          assertInstanceOf(loadGraphQLReturn, LoadingCacheValue);
          deepStrictEqual(await loadGraphQLReturn.promise, {
            errors: [
              {
                message: "Fetch error.",
                extensions: {
                  client: true,
                  code: "FETCH_ERROR",
                  fetchErrorMessage: fetchError.message,
                },
              },
            ],
          });
          deepStrictEqual(
            cache.store,
            // Cache shouldn’t be affected by aborted loading.
            {},
          );
        } finally {
          // Undo any cache changes for future tests.
          cacheDelete(cache);
        }
      });
    },
  );
});
