'use strict';

const { deepStrictEqual, strictEqual } = require('assert');
const {
  cleanup,
  renderHook,
  suppressErrorOutput,
} = require('@testing-library/react-hooks/pure');
const { jsx } = require('react/jsx-runtime');
const Loading = require('../../public/Loading');
const LoadingContext = require('../../public/LoadingContext');
const useLoading = require('../../public/useLoading');

module.exports = (tests) => {
  tests.add('`useLoading` with loading context missing.', () => {
    try {
      const revertConsole = suppressErrorOutput();

      try {
        var { result } = renderHook(() => useLoading());
      } finally {
        revertConsole();
      }

      deepStrictEqual(result.error, new TypeError('Loading context missing.'));
    } finally {
      cleanup();
    }
  });

  tests.add(
    '`useLoading` with loading context value not a `Loading` instance.',
    () => {
      try {
        const wrapper = ({ children }) =>
          jsx(LoadingContext.Provider, {
            value: true,
            children,
          });

        const revertConsole = suppressErrorOutput();

        try {
          var { result } = renderHook(() => useLoading(), { wrapper });
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

  tests.add('`useLoading` getting the loading.', () => {
    try {
      const wrapper = ({ loading, children }) =>
        jsx(LoadingContext.Provider, {
          value: loading,
          children,
        });

      const loadingA = new Loading();

      const { result, rerender } = renderHook(() => useLoading(), {
        wrapper,
        initialProps: {
          loading: loadingA,
        },
      });

      strictEqual(result.all.length, 1);
      strictEqual(result.current, loadingA);
      strictEqual(result.error, undefined);

      const loadingB = new Loading();

      rerender({ loading: loadingB });

      strictEqual(result.all.length, 2);
      strictEqual(result.current, loadingB);
      strictEqual(result.error, undefined);
    } finally {
      cleanup();
    }
  });
};
