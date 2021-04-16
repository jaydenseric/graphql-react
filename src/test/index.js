'use strict';

const { TestDirector } = require('test-director');

const tests = new TestDirector();

require('./private/FirstRenderDateContext.test')(tests);
require('./private/graphqlFetchOptions.test')(tests);
require('./public/GraphQL.test')(tests);
require('./public/hashObject.test')(tests);
require('./public/useGraphQL.test')(tests);
require('./bundle.test')(tests);

tests.run();
