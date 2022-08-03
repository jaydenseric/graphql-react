// @ts-check

import { EventTarget } from "event-target-shim";

if (!("EventTarget" in globalThis)) globalThis.EventTarget = EventTarget;
