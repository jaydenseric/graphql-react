// @ts-check

import { performance } from "perf_hooks";

if (!("performance" in global))
  // @ts-ignore Node.js has a partial implementation.
  global.performance = performance;
