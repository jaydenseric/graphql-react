import provider from '../provider'
import Page from '../components/page'
import CacheResetter from '../components/cache-resetter'
import CreateTimer from '../components/create-timer'
import Timers from '../components/timers'
import Pokemon from '../components/pokemon'
import ExampleGraphQLError from '../components/example-graphql-error'

export default provider(
  <Page
    title="graphql-react example"
    description="Example GraphQL API and Next.js web app demonstrating server side rendering (SSR) and functionality of the graphql-react npm package."
  >
    <header>
      <img
        src="https://cdn.rawgit.com/jaydenseric/graphql-react/b2e60e80/graphql-react-logo.svg"
        alt="graphql-react logo"
      />
      <h1>graphql-react example</h1>
      <p>
        This is an example GraphQL API and{' '}
        <a href="https://github.com/zeit/next.js">Next.js</a> web app
        demonstrating server side rendering (SSR) and functionality of the{' '}
        <a href="https://github.com/jaydenseric/graphql-react">graphql-react</a>{' '}
        npm package.
      </p>
      <p>
        <a href="https://github.com/jaydenseric/graphql-react/tree/master/example">
          See the source code on Github
        </a>.
      </p>
    </header>
    <section>
      <h2>Mutations</h2>
      <p>
        The{' '}
        <a href="https://github.com/jaydenseric/graphql-react#query-1">
          <code>Query</code>
        </a>{' '}
        component identically manages queries and mutations. Its{' '}
        <code>resetOnLoad</code> prop is mostly used to reset the cache after a
        mutation. The button below creates a timer on the server that counts
        milliseconds.
      </p>
      <CreateTimer />
    </section>
    <section>
      <h2>Queries</h2>
      <p>
        <a href="https://github.com/jaydenseric/graphql-react#query-1">
          <code>Query</code>
        </a>{' '}
        component props can be used to optionally load on mount (<code>
          loadOnMount
        </code>{' '}
        boolean), when cache resets (<code>loadOnReset</code> boolean), or on
        demand (<code>load</code> function). SSR can handle any depth of nested
        queries.
      </p>
      <p>
        Below one query populates the entire timer list on mount, automatically
        updating when the “Create timer” button resets cache. Nested queries
        allow current durations to be loaded on demand.
      </p>
      <Timers />
    </section>
    <section>
      <h2>Query multiple APIs</h2>
      <p>
        Any GraphQL API can be queried using the{' '}
        <a href="https://github.com/jaydenseric/graphql-react#query-1">
          <code>Query</code>
        </a>{' '}
        component <code>fetchOptionsOverride</code> prop. Pikachu facts are
        queried from the{' '}
        <a href="https://github.com/lucasbento/graphql-pokemon">
          GraphQL Pokémon API
        </a>{' '}
        below.
      </p>
      <Pokemon name="Pikachu" />
    </section>
    <section>
      <h2>Reset cache</h2>
      <p>
        The{' '}
        <a href="https://github.com/jaydenseric/graphql-react#consumer">
          <code>Consumer</code>
        </a>{' '}
        component can be used to access the{' '}
        <a href="https://github.com/jaydenseric/graphql-react#graphql">
          <code>GraphQL</code>
        </a>{' '}
        instance{' '}
        <a href="https://github.com/jaydenseric/graphql-react#reset">
          <code>reset</code>
        </a>{' '}
        method. Resetting the cache causes all{' '}
        <a href="https://github.com/jaydenseric/graphql-react#query-1">
          <code>Query</code>
        </a>{' '}
        components with the <code>loadOnReset</code> prop to reload.
      </p>
      <CacheResetter />
    </section>
    <section>
      <h2>SSR errors</h2>
      <p>
        A novel characteristic is that errors cache and therefore SSR. Below is
        a query with an example error thrown in the resolver.
      </p>
      <ExampleGraphQLError />
    </section>
  </Page>
)
