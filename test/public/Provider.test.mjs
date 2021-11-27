import { strictEqual, throws } from 'assert';
import { useContext } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { jsx } from 'react/jsx-runtime.js';
import Cache from '../../public/Cache.js';
import CacheContext from '../../public/CacheContext.js';
import HydrationTimeStampContext from '../../public/HydrationTimeStampContext.js';
import Loading from '../../public/Loading.js';
import LoadingContext from '../../public/LoadingContext.js';
import Provider from '../../public/Provider.js';
import assertBundleSize from '../assertBundleSize.mjs';
import suppressReactRenderErrorConsoleOutput from '../suppressReactRenderErrorConsoleOutput.mjs';

export default (tests) => {
  tests.add('`Provider` bundle size.', async () => {
    await assertBundleSize(
      new URL('../../public/Provider.js', import.meta.url),
      900
    );
  });

  tests.add('`Provider` with prop `cache` missing.', () => {
    const revertConsole = suppressReactRenderErrorConsoleOutput();

    try {
      throws(() => {
        ReactTestRenderer.create(jsx(Provider, {}));
      }, new TypeError('Prop `cache` must be a `Cache` instance.'));
    } finally {
      revertConsole();
    }
  });

  tests.add('`Provider` used correctly.', () => {
    const results = [];
    const TestComponent = () => {
      results.push({
        hydrationTimeStampContextValue: useContext(HydrationTimeStampContext),
        cacheContextValue: useContext(CacheContext),
        loadingContextValue: useContext(LoadingContext),
      });
      return null;
    };
    const cache = new Cache();
    const testRenderer = ReactTestRenderer.create(
      jsx(Provider, {
        cache,
        children: jsx(TestComponent, {}),
      })
    );

    strictEqual(results.length, 1);
    strictEqual(typeof results[0].hydrationTimeStampContextValue, 'number');
    strictEqual(
      performance.now() - results[0].hydrationTimeStampContextValue < 100,
      true
    );
    strictEqual(results[0].cacheContextValue, cache);
    strictEqual(results[0].loadingContextValue instanceof Loading, true);

    testRenderer.update(
      jsx(Provider, {
        // Force the component to re-render by setting a new, useless prop.
        a: true,
        cache,
        children: jsx(TestComponent, {}),
      })
    );

    strictEqual(results.length, 2);
    strictEqual(
      results[1].hydrationTimeStampContextValue,
      results[0].hydrationTimeStampContextValue
    );
    strictEqual(results[1].cacheContextValue, results[0].cacheContextValue);
    strictEqual(results[1].loadingContextValue, results[0].loadingContextValue);
  });
};
