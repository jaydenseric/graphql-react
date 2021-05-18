import events from 'events';
import { performance } from 'perf_hooks';
import { AbortController, AbortSignal } from 'abort-controller';
import { Event, EventTarget } from 'event-target-shim';

if (!('performance' in global)) global.performance = performance;

if (!('EventTarget' in global))
  global.EventTarget = events.EventTarget || EventTarget;

if (!('Event' in global)) global.Event = events.Event || Event;

if (!('CustomEvent' in global))
  global.CustomEvent = class CustomEvent extends global.Event {
    constructor(eventName, { detail, ...eventOptions } = {}) {
      super(eventName, eventOptions);
      this.detail = detail;
    }
  };

if (!('AbortSignal' in global)) global.AbortSignal = AbortSignal;

if (!('AbortController' in global)) global.AbortController = AbortController;
