import { deepStrictEqual, fail, strictEqual, throws } from 'assert';
import {
  act,
  cleanup,
  renderHook,
  suppressErrorOutput,
} from '@testing-library/react-hooks/lib/pure.js';
import { AbortError, Response } from 'node-fetch';
import { jsx } from 'react/jsx-runtime.js';
import revertableGlobals from 'revertable-globals';
import TestDirector from 'test-director';
import Cache from './Cache.mjs';
import CacheContext from './CacheContext.mjs';
import Loading from './Loading.mjs';
import LoadingCacheValue from './LoadingCacheValue.mjs';
import LoadingContext from './LoadingContext.mjs';
import cacheDelete from './cacheDelete.mjs';
import createArgErrorMessageProd from './createArgErrorMessageProd.mjs';
import assertBundleSize from './test/assertBundleSize.mjs';
import useLoadGraphQL from './useLoadGraphQL.mjs';

export default (tests) => {
  tests.add('`useLoadGraphQL` bundle size.', async () => {
    await assertBundleSize(
      new URL('./useLoadGraphQL.mjs', import.meta.url),
      1800
    );
  });

  tests.add('`useLoadGraphQL` with cache context missing.', () => {
    try {
      const revertConsole = suppressErrorOutput();

      try {
        var { result } = renderHook(() => useLoadGraphQL());
      } finally {
        revertConsole();
      }

      deepStrictEqual(result.error, new TypeError('Cache context missing.'));
    } finally {
      cleanup();
    }
  });

  tests.add(
    '`useLoadGraphQL` with cache context value not a `Cache` instance.',
    () => {
      try {
        const wrapper = ({ children }) =>
          jsx(CacheContext.Provider, {
            value: true,
            children,
          });

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useLoadGraphQL(), {
            wrapper,
          });
        } finally {
          revertConsole();
        }

        deepStrictEqual(
          result.error,
          new TypeError('Cache context value must be a `Cache` instance.')
        );
      } finally {
        cleanup();
      }
    }
  );

  tests.add('`useLoadGraphQL` with loading context missing.', () => {
    try {
      const cache = new Cache();
      const wrapper = ({ children }) =>
        jsx(CacheContext.Provider, {
          value: cache,
          children,
        });

      const revertConsole = suppressErrorOutput();

      try {
        var { result } = renderHook(() => useLoadGraphQL(), {
          wrapper,
        });
      } finally {
        revertConsole();
      }

      deepStrictEqual(result.error, new TypeError('Loading context missing.'));
    } finally {
      cleanup();
    }
  });

  tests.add(
    '`useLoadGraphQL` with loading context value not a `Loading` instance.',
    () => {
      try {
        const cache = new Cache();
        const wrapper = ({ children }) =>
          jsx(CacheContext.Provider, {
            value: cache,
            children: jsx(LoadingContext.Provider, {
              value: true,
              children,
            }),
          });

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useLoadGraphQL(), {
            wrapper,
          });
        } finally {
          revertConsole();
        }

        deepStrictEqual(
          result.error,
          new TypeError('Loading context value must be a `Loading` instance.')
        );
      } finally {
        cleanup();
      }
    }
  );

  tests.add('`useLoadGraphQL` functionality.', async () => {
    try {
      const cache = new Cache();
      const loading = new Loading();
      const wrapper = ({ children }) =>
        jsx(CacheContext.Provider, {
          value: cache,
          children: jsx(LoadingContext.Provider, {
            value: loading,
            children,
          }),
        });

      const { result, rerender } = renderHook(() => useLoadGraphQL(), {
        wrapper,
      });

      strictEqual(result.all.length, 1);
      strictEqual(typeof result.current, 'function');
      strictEqual(result.error, undefined);

      // Test that re-rendering with the same props doesn’t cause the returned
      // load GraphQL function to change.
      rerender();

      strictEqual(result.all.length, 2);
      strictEqual(result.current, result.all[0]);
      strictEqual(result.error, undefined);

      const loadGraphQLTests = new TestDirector();

      loadGraphQLTests.add(
        'Load GraphQL with argument 1 `cacheKey` not a string.',
        () => {
          const cacheKey = true;

          throws(() => {
            result.current(cacheKey);
          }, new TypeError('Argument 1 `cacheKey` must be a string.'));

          const revertGlobals = revertableGlobals(
            { NODE_ENV: 'production' },
            process.env
          );

          try {
            throws(() => {
              result.current(cacheKey);
            }, new TypeError(createArgErrorMessageProd(1)));
          } finally {
            revertGlobals();
          }
        }
      );

      loadGraphQLTests.add(
        'Load GraphQL with argument 2 `fetchUri` not a string.',
        () => {
          const cacheKey = '';
          const fetchUri = true;

          throws(() => {
            result.current(cacheKey, fetchUri);
          }, new TypeError('Argument 2 `fetchUri` must be a string.'));

          const revertGlobals = revertableGlobals(
            { NODE_ENV: 'production' },
            process.env
          );

          try {
            throws(() => {
              result.current(cacheKey, fetchUri);
            }, new TypeError(createArgErrorMessageProd(2)));
          } finally {
            revertGlobals();
          }
        }
      );

      loadGraphQLTests.add(
        'Load GraphQL with argument 3 `fetchOptions` not an object.',
        () => {
          const cacheKey = '';
          const fetchUri = '';
          const fetchOptions = null;

          throws(() => {
            result.current(cacheKey, fetchUri, fetchOptions);
          }, new TypeError('Argument 3 `fetchOptions` must be an object.'));

          const revertGlobals = revertableGlobals(
            { NODE_ENV: 'production' },
            process.env
          );

          try {
            throws(() => {
              result.current(cacheKey, fetchUri, fetchOptions);
            }, new TypeError(createArgErrorMessageProd(3)));
          } finally {
            revertGlobals();
          }
        }
      );

      loadGraphQLTests.add('Load GraphQL without aborting.', async () => {
        const fetchUri = 'the-uri';
        const fetchOptions = Object.freeze({ a: 1 });
        const cacheKey = 'a';
        const cacheValue = {
          data: {
            a: 1,
          },
        };

        let fetchedUri;
        let fetchedOptions;
        let loadGraphQLReturn;

        const revertGlobals = revertableGlobals({
          async fetch(uri, options) {
            fetchedUri = uri;
            fetchedOptions = options;

            return new Response(JSON.stringify(cacheValue), {
              status: 200,
              headers: {
                'Content-Type': 'application/graphql+json',
              },
            });
          },
        });

        try {
          try {
            act(() => {
              loadGraphQLReturn = result.current(
                cacheKey,
                fetchUri,
                fetchOptions
              );
            });
          } finally {
            revertGlobals();
          }

          strictEqual(fetchedUri, fetchUri);
          strictEqual(typeof fetchedOptions, 'object');

          const { signal: fetchedOptionsSignal, ...fetchedOptionsRest } =
            fetchedOptions;

          strictEqual(fetchedOptionsSignal instanceof AbortSignal, true);
          deepStrictEqual(fetchedOptionsRest, fetchOptions);
          strictEqual(loadGraphQLReturn instanceof LoadingCacheValue, true);
          deepStrictEqual(await loadGraphQLReturn.promise, cacheValue);
          deepStrictEqual(cache.store, {
            [cacheKey]: cacheValue,
          });
        } finally {
          // Undo any cache changes for future tests.
          cacheDelete(cache);
        }
      });

      loadGraphQLTests.add(
        'Load GraphQL aborting, no fetch options `signal`.',
        async () => {
          const fetchUri = 'the-uri';
          const fetchOptions = Object.freeze({ a: 1 });
          const fetchAbortError = new AbortError('The operation was aborted.');
          const cacheKey = 'a';

          let fetchedUri;
          let fetchedOptions;
          let loadGraphQLReturn;

          const revertGlobals = revertableGlobals({
            async fetch(uri, options) {
              fetchedUri = uri;
              fetchedOptions = options;

              return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                  reject(fail('Fetch wasn’t aborted.'));
                }, 800);

                options.signal.addEventListener(
                  'abort',
                  () => {
                    clearTimeout(timeout);
                    reject(fetchAbortError);
                  },
                  { once: true }
                );
              });
            },
          });

          try {
            try {
              act(() => {
                loadGraphQLReturn = result.current(
                  cacheKey,
                  fetchUri,
                  fetchOptions
                );
              });
            } finally {
              revertGlobals();
            }

            strictEqual(fetchedUri, fetchUri);
            strictEqual(typeof fetchedOptions, 'object');

            const { signal: fetchedOptionsSignal, ...fetchedOptionsRest } =
              fetchedOptions;

            strictEqual(fetchedOptionsSignal instanceof AbortSignal, true);
            deepStrictEqual(fetchedOptionsRest, fetchOptions);
            strictEqual(loadGraphQLReturn instanceof LoadingCacheValue, true);

            loadGraphQLReturn.abortController.abort();

            deepStrictEqual(await loadGraphQLReturn.promise, {
              errors: [
                {
                  message: 'Fetch error.',
                  extensions: {
                    client: true,
                    code: 'FETCH_ERROR',
                    fetchErrorMessage: fetchAbortError.message,
                  },
                },
              ],
            });
            deepStrictEqual(
              cache.store,
              // Cache shouldn’t be affected by aborted loading.
              {}
            );
          } finally {
            // Undo any cache changes for future tests.
            cacheDelete(cache);
          }
        }
      );

      loadGraphQLTests.add(
        'Load GraphQL aborting, fetch options `signal`, not yet aborted.',
        async () => {
          const fetchUri = 'the-uri';
          const abortController = new AbortController();
          const fetchOptionsWithoutSignal = { a: 1 };
          const fetchOptions = Object.freeze({
            ...fetchOptionsWithoutSignal,
            signal: abortController.signal,
          });
          const fetchAbortError = new AbortError('The operation was aborted.');
          const cacheKey = 'a';

          let fetchedUri;
          let fetchedOptions;
          let loadGraphQLReturn;

          const revertGlobals = revertableGlobals({
            async fetch(uri, options) {
              fetchedUri = uri;
              fetchedOptions = options;

              return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                  reject(fail('Fetch wasn’t aborted.'));
                }, 800);

                options.signal.addEventListener(
                  'abort',
                  () => {
                    clearTimeout(timeout);
                    reject(fetchAbortError);
                  },
                  { once: true }
                );
              });
            },
          });

          try {
            try {
              act(() => {
                loadGraphQLReturn = result.current(
                  cacheKey,
                  fetchUri,
                  fetchOptions
                );
              });
            } finally {
              revertGlobals();
            }

            strictEqual(fetchedUri, fetchUri);
            strictEqual(typeof fetchedOptions, 'object');

            const { signal: fetchedOptionsSignal, ...fetchedOptionsRest } =
              fetchedOptions;

            strictEqual(fetchedOptionsSignal instanceof AbortSignal, true);
            deepStrictEqual(fetchedOptionsRest, fetchOptionsWithoutSignal);
            strictEqual(loadGraphQLReturn instanceof LoadingCacheValue, true);

            abortController.abort();

            deepStrictEqual(await loadGraphQLReturn.promise, {
              errors: [
                {
                  message: 'Fetch error.',
                  extensions: {
                    client: true,
                    code: 'FETCH_ERROR',
                    fetchErrorMessage: fetchAbortError.message,
                  },
                },
              ],
            });
            deepStrictEqual(
              cache.store,
              // Cache shouldn’t be affected by aborted loading.
              {}
            );
          } finally {
            // Undo any cache changes for future tests.
            cacheDelete(cache);
          }
        }
      );

      loadGraphQLTests.add(
        'Load GraphQL aborting, fetch options `signal`, already aborted.',
        async () => {
          const fetchUri = 'the-uri';

          const abortController = new AbortController();
          abortController.abort();

          const fetchOptionsWithoutSignal = { a: 1 };
          const fetchOptions = Object.freeze({
            ...fetchOptionsWithoutSignal,
            signal: abortController.signal,
          });
          const fetchAbortError = new AbortError('The operation was aborted.');
          const cacheKey = 'a';

          let fetchedUri;
          let fetchedOptions;
          let loadGraphQLReturn;

          const revertGlobals = revertableGlobals({
            async fetch(uri, options) {
              fetchedUri = uri;
              fetchedOptions = options;

              throw options.signal.aborted
                ? fetchAbortError
                : fail('Abort signal wasn’t already aborted.');
            },
          });

          try {
            try {
              act(() => {
                loadGraphQLReturn = result.current(
                  cacheKey,
                  fetchUri,
                  fetchOptions
                );
              });
            } finally {
              revertGlobals();
            }

            strictEqual(fetchedUri, fetchUri);
            strictEqual(typeof fetchedOptions, 'object');

            const { signal: fetchedOptionsSignal, ...fetchedOptionsRest } =
              fetchedOptions;

            strictEqual(fetchedOptionsSignal instanceof AbortSignal, true);
            deepStrictEqual(fetchedOptionsRest, fetchOptionsWithoutSignal);
            strictEqual(loadGraphQLReturn instanceof LoadingCacheValue, true);
            deepStrictEqual(await loadGraphQLReturn.promise, {
              errors: [
                {
                  message: 'Fetch error.',
                  extensions: {
                    client: true,
                    code: 'FETCH_ERROR',
                    fetchErrorMessage: fetchAbortError.message,
                  },
                },
              ],
            });
            deepStrictEqual(
              cache.store,
              // Cache shouldn’t be affected by aborted loading.
              {}
            );
          } finally {
            // Undo any cache changes for future tests.
            cacheDelete(cache);
          }
        }
      );

      await loadGraphQLTests.run(true);

      // No re-rendering should have happened.
      strictEqual(result.all.length, 2);
    } finally {
      cleanup();
    }
  });
};
