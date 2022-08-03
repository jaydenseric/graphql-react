// @ts-check

import { performance } from "perf_hooks";

if (!("performance" in globalThis))
  // @ts-ignore Node.js has a partial implementation.
  globalThis.performance = performance;
