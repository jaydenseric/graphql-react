// @ts-check

import { Event } from "event-target-shim";

if (!("Event" in global)) global.Event = Event;
