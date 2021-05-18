import { strictEqual } from 'assert';
import HYDRATION_TIME_MS from '../../public/HYDRATION_TIME_MS.js';

export default (tests) => {
  tests.add('`HYDRATION_TIME_MS` value.', () => {
    strictEqual(HYDRATION_TIME_MS, 1000);
  });
};
