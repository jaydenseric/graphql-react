import { deepStrictEqual, strictEqual } from 'assert';
import {
  cleanup,
  renderHook,
  suppressErrorOutput,
} from '@testing-library/react-hooks/lib/pure.js';
import { jsx } from 'react/jsx-runtime.js';
import Loading from '../../public/Loading.js';
import LoadingContext from '../../public/LoadingContext.js';
import useLoading from '../../public/useLoading.js';
import assertBundleSize from '../assertBundleSize.mjs';

export default (tests) => {
  tests.add('`useLoading` bundle size.', async () => {
    await assertBundleSize(
      new URL('../../public/useLoading.js', import.meta.url),
      500
    );
  });

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
