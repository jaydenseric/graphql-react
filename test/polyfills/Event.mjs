// @ts-check

import { Event } from "event-target-shim";

if (!("Event" in globalThis)) globalThis.Event = Event;
