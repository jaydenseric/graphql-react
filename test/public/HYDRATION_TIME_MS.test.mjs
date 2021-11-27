import { strictEqual } from 'assert';
import HYDRATION_TIME_MS from '../../public/HYDRATION_TIME_MS.js';
import assertBundleSize from '../assertBundleSize.mjs';

export default (tests) => {
  tests.add('`HYDRATION_TIME_MS` bundle size.', async () => {
    await assertBundleSize(
      new URL('../../public/HYDRATION_TIME_MS.js', import.meta.url),
      150
    );
  });

  tests.add('`HYDRATION_TIME_MS` value.', () => {
    strictEqual(HYDRATION_TIME_MS, 1000);
  });
};
