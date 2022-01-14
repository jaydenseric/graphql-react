// Don’t type check this module; the dev dependency has type definition issues.
// The published code is type checked against the proper globals available in
// modern Node.js versions.

import { AbortSignal } from "abort-controller";

if (!("AbortSignal" in global)) global.AbortSignal = AbortSignal;
