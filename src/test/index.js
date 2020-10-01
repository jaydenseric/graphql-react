'use strict';

const { TestDirector } = require('test-director');

const tests = new TestDirector();

require('./server/ssr.test')(tests);
require('./universal/arrayFlat.test')(tests);
require('./universal/GraphQL.test')(tests);
require('./universal/graphqlFetchOptions.test')(tests);
require('./universal/hashObject.test')(tests);
require('./universal/useGraphQL.test')(tests);

tests.run();
