'use strict';

const { TestDirector } = require('test-director');

const tests = new TestDirector();

require('./server/ssr.test.js')(tests);
require('./universal/GraphQL.test.js')(tests);
require('./universal/graphqlFetchOptions.test.js')(tests);
require('./universal/hashObject.test.js')(tests);
require('./universal/useGraphQL.test.js')(tests);

tests.run();
