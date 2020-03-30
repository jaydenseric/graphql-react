import { TestDirector } from 'test-director';
import ssr from './server/ssr.test.mjs';
import GraphQL from './universal/GraphQL.test.mjs';
import graphqlFetchOptions from './universal/graphqlFetchOptions.test.mjs';
import hashObject from './universal/hashObject.test.mjs';
import useGraphQL from './universal/useGraphQL.test.mjs';

const tests = new TestDirector();

ssr(tests);
GraphQL(tests);
graphqlFetchOptions(tests);
hashObject(tests);

// eslint-disable-next-line react-hooks/rules-of-hooks
useGraphQL(tests);

tests.run();
