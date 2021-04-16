'use strict';

if (!('performance' in global))
  global.performance = require('perf_hooks').performance;

if (!('EventTarget' in global))
  global.EventTarget =
    require('events').EventTarget || require('event-target-shim').EventTarget;

if (!('Event' in global))
  global.Event = require('events').Event || require('event-target-shim').Event;

if (!('CustomEvent' in global))
  global.CustomEvent = class CustomEvent extends Event {
    constructor(eventName, { detail, ...eventOptions } = {}) {
      super(eventName, eventOptions);
      this.detail = detail;
    }
  };

require('abort-controller/polyfill');

const { TestDirector } = require('test-director');

const tests = new TestDirector();

require('./private/createArgErrorMessageProd.test')(tests);
require('./private/useForceUpdate.test')(tests);
require('./public/Cache.test')(tests);
require('./public/CacheContext.test')(tests);
require('./public/cacheDelete.test')(tests);
require('./public/cacheEntryDelete.test')(tests);
require('./public/cacheEntryPrune.test')(tests);
require('./public/cacheEntrySet.test')(tests);
require('./public/cacheEntryStale.test')(tests);
require('./public/cachePrune.test')(tests);
require('./public/cacheStale.test')(tests);
require('./public/fetchGraphQL.test')(tests);
require('./public/fetchOptionsGraphQL.test')(tests);
require('./public/HYDRATION_TIME_MS.test')(tests);
require('./public/HydrationTimeStampContext.test')(tests);
require('./public/Loading.test')(tests);
require('./public/LoadingCacheValue.test')(tests);
require('./public/LoadingContext.test')(tests);
require('./public/Provider.test')(tests);
require('./public/useAutoAbortLoad.test')(tests);
require('./public/useAutoLoad.test')(tests);
require('./public/useCache.test')(tests);
require('./public/useCacheEntry.test')(tests);
require('./public/useCacheEntryPrunePrevention.test')(tests);
require('./public/useLoadGraphQL.test')(tests);
require('./public/useLoading.test')(tests);
require('./public/useLoadingEntry.test')(tests);
require('./public/useLoadOnDelete.test')(tests);
require('./public/useLoadOnMount.test')(tests);
require('./public/useLoadOnStale.test')(tests);
require('./public/useWaterfallLoad.test')(tests);
require('./bundle.test')(tests);

tests.run();
