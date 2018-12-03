import 'cross-fetch/polyfill'
import CaptureStdout from 'capture-stdout'
import { buildSchema } from 'graphql'
import { errorHandler, execute } from 'graphql-api-koa'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import PropTypes from 'prop-types'
import React from 'react'
import reactDom from 'react-dom/server'
import t from 'tap'
import { GraphQL, Provider, Query, preload } from '.'

// eslint-disable-next-line no-console
console.log(
  `Testing ${
    process.execArgv.includes('--experimental-modules') ? 'ESM' : 'CJS'
  } library with ${process.env.NODE_ENV} NODE_ENV…\n\n`
)

const EPOCH_QUERY = /* GraphQL */ `
  {
    epoch {
      iso
    }
  }
`

const YEAR_QUERY = /* GraphQL */ `
  query($date: String!) {
    date(isoDate: $date) {
      year
    }
  }
`

const schema = buildSchema(/* GraphQL */ `
  type Query {
    date(isoDate: String!): Date!
    epoch: Date!
    daysBetween(isoDateFrom: String!, isoDateTo: String!): Int!
  }

  type Date {
    iso: String!
    year: Int!
  }
`)

const rootValue = {
  date: ({ isoDate }) => new ISODate(isoDate),
  epoch: () => new ISODate(0),
  daysBetween: ({ isoDateFrom, isoDateTo }) =>
    Math.floor((new Date(isoDateTo) - new Date(isoDateFrom)) / 86400000)
}

/**
 * A test class that represents a date.
 * @kind class
 * @name ISODate
 * @param {string} value ISO date string.
 * @ignore
 */
class ISODate {
  // eslint-disable-next-line require-jsdoc
  constructor(value) {
    this.date = new Date(value)
  }

  /**
   * Gets the date as an ISO string.
   * @kind function
   * @name ISODate#iso
   * @returns {string} ISO date.
   * @ignore
   */
  iso() {
    return this.date.toISOString()
  }

  /**
   * Gets the year.
   * @kind function
   * @name ISODate#year
   * @returns {string} Year.
   * @ignore
   */
  year() {
    return this.date.getFullYear()
  }
}

/**
 * Asynchronously starts a given Koa app server that automatically closes when
 * the given test tears down.
 * @kind function
 * @name startServer
 * @param {Test} t Tap test.
 * @param {Object} app Koa app.
 * @returns {Promise<Server>} Node.js net server.
 * @ignore
 */
const startServer = (t, app) =>
  new Promise((resolve, reject) => {
    app.listen(function(error) {
      if (error) reject(error)
      else {
        t.tearDown(() => this.close())
        resolve(this.address().port)
      }
    })
  })

/**
 * Converts an object to a snapshot string.
 * @kind function
 * @name snapshotObject
 * @param {Object} object Object to snapshot.
 * @returns {string} Snapshot.
 * @ignore
 */
const snapshotObject = object =>
  JSON.stringify(
    object,
    (key, value) => (typeof value === 'function' ? '[Function]' : value),
    2
  )

t.test('Query SSR with fetch unavailable.', async t => {
  const graphql = new GraphQL()
  const operation = { query: EPOCH_QUERY }
  const captureStdout = new CaptureStdout()

  // Store the global fetch polyfill.
  const { fetch } = global

  captureStdout.startCapture()

  try {
    // Delete the global fetch polyfill.
    delete global.fetch

    // Run the query with fetch unavailable.
    var requestCache = await graphql.query({ operation }).request
  } finally {
    captureStdout.stopCapture()

    // Restore the global fetch polyfill.
    global.fetch = fetch
  }

  t.matchSnapshot(
    snapshotObject(captureStdout.getCapturedText()),
    'Console log.'
  )

  t.matchSnapshot(snapshotObject(requestCache), 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query loadOnMount operation={operation}>
        {function() {
          t.matchSnapshot(
            snapshotObject(arguments),
            'Query render function arguments.'
          )
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with relative fetch URL.', async t => {
  // The relative default fetch options URL causes a fetch error in a server
  // environment.

  const graphql = new GraphQL()
  const operation = { query: EPOCH_QUERY }
  const captureStdout = new CaptureStdout()

  captureStdout.startCapture()

  try {
    var requestCache = await graphql.query({ operation }).request
  } finally {
    captureStdout.stopCapture()
  }

  t.matchSnapshot(
    snapshotObject(captureStdout.getCapturedText()),
    'Console log.'
  )

  t.matchSnapshot(snapshotObject(requestCache), 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query loadOnMount operation={operation}>
        {function() {
          t.matchSnapshot(
            snapshotObject(arguments),
            'Query render function arguments.'
          )
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with HTTP error.', async t => {
  const app = new Koa().use(async (ctx, next) => {
    ctx.response.status = 404
    ctx.response.type = 'text/plain'
    ctx.response.body = 'Not found.'
    await next()
  })

  const port = await startServer(t, app)
  const graphql = new GraphQL()

  // eslint-disable-next-line require-jsdoc
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }

  const operation = { query: EPOCH_QUERY }
  const captureStdout = new CaptureStdout()

  captureStdout.startCapture()

  try {
    var requestCache = await graphql.query({
      fetchOptionsOverride,
      operation
    }).request
  } finally {
    captureStdout.stopCapture()
  }

  t.matchSnapshot(
    snapshotObject(captureStdout.getCapturedText()),
    'Console log.'
  )

  // Prevent the dynamic port that appears in the error message from failing
  // snapshot comparisons.
  if (typeof requestCache.parseError === 'string')
    requestCache.parseError = requestCache.parseError.replace(port, '<port>')

  t.matchSnapshot(snapshotObject(requestCache), 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        operation={operation}
      >
        {function() {
          t.matchSnapshot(
            snapshotObject(arguments),
            'Query render function arguments.'
          )
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with response JSON invalid.', async t => {
  const app = new Koa().use(async (ctx, next) => {
    ctx.response.status = 200
    ctx.response.type = 'text'
    ctx.response.body = 'Not JSON.'
    await next()
  })

  const port = await startServer(t, app)
  const graphql = new GraphQL()

  // eslint-disable-next-line require-jsdoc
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }

  const operation = { query: EPOCH_QUERY }
  const captureStdout = new CaptureStdout()

  captureStdout.startCapture()

  try {
    var requestCache = await graphql.query({
      fetchOptionsOverride,
      operation
    }).request
  } finally {
    captureStdout.stopCapture()
  }

  t.matchSnapshot(
    snapshotObject(captureStdout.getCapturedText()),
    'Console log.'
  )

  // Prevent the dynamic port that appears in the error message from failing
  // snapshot comparisons.
  if (typeof requestCache.parseError === 'string')
    requestCache.parseError = requestCache.parseError.replace(port, '<port>')

  t.matchSnapshot(snapshotObject(requestCache), 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        operation={operation}
      >
        {function() {
          t.matchSnapshot(
            snapshotObject(arguments),
            'Query render function arguments.'
          )
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with response payload malformed.', async t => {
  const app = new Koa().use(async (ctx, next) => {
    ctx.response.status = 200
    ctx.response.type = 'json'
    ctx.response.body = '[{"bad": true}]'
    await next()
  })

  const port = await startServer(t, app)
  const graphql = new GraphQL()

  // eslint-disable-next-line require-jsdoc
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }

  const operation = { query: EPOCH_QUERY }
  const captureStdout = new CaptureStdout()

  captureStdout.startCapture()

  try {
    var requestCache = await graphql.query({
      fetchOptionsOverride,
      operation
    }).request
  } finally {
    captureStdout.stopCapture()
  }

  t.matchSnapshot(
    snapshotObject(captureStdout.getCapturedText()),
    'Console log.'
  )

  t.matchSnapshot(snapshotObject(requestCache), 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        operation={operation}
      >
        {function() {
          t.matchSnapshot(
            snapshotObject(arguments),
            'Query render function arguments.'
          )
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with GraphQL errors.', async t => {
  const app = new Koa()
    .use(errorHandler())
    .use(bodyParser())
    .use(execute({ schema, rootValue }))

  const port = await startServer(t, app)
  const graphql = new GraphQL()

  // eslint-disable-next-line require-jsdoc
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }

  const operation = { query: '{ x }' }
  const captureStdout = new CaptureStdout()

  captureStdout.startCapture()

  try {
    var requestCache = await graphql.query({
      fetchOptionsOverride,
      operation
    }).request
  } finally {
    captureStdout.stopCapture()
  }

  t.matchSnapshot(
    snapshotObject(captureStdout.getCapturedText()),
    'Console log.'
  )

  t.matchSnapshot(snapshotObject(requestCache), 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        operation={operation}
      >
        {function() {
          t.matchSnapshot(
            snapshotObject(arguments),
            'Query render function arguments.'
          )
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with variables.', async t => {
  const app = new Koa()
    .use(errorHandler())
    .use(bodyParser())
    .use(execute({ schema, rootValue }))

  const port = await startServer(t, app)
  const graphql = new GraphQL()

  // eslint-disable-next-line require-jsdoc
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }

  const variables = { date: '2018-01-01' }
  const operation = { variables, query: YEAR_QUERY }
  const requestCache = await graphql.query({
    fetchOptionsOverride,
    operation
  }).request

  t.matchSnapshot(snapshotObject(requestCache), 'GraphQL request cache.')

  reactDom.renderToString(
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        operation={operation}
      >
        {function() {
          t.matchSnapshot(
            snapshotObject(arguments),
            'Query render function arguments.'
          )
          return null
        }}
      </Query>
    </Provider>
  )
})

t.test('Query SSR with nested query.', async t => {
  const app = new Koa()
    .use(errorHandler())
    .use(bodyParser())
    .use(execute({ schema, rootValue }))

  const port = await startServer(t, app)
  const graphql = new GraphQL()

  // eslint-disable-next-line require-jsdoc
  const fetchOptionsOverride = options => {
    options.url = `http://localhost:${port}`
  }

  const tree = (
    <Provider value={graphql}>
      <Query
        loadOnMount
        fetchOptionsOverride={fetchOptionsOverride}
        operation={{ query: EPOCH_QUERY }}
      >
        {({
          data: {
            epoch: { iso }
          }
        }) => (
          <Query
            loadOnMount
            fetchOptionsOverride={fetchOptionsOverride}
            operation={{
              variables: { isoDateFrom: iso },
              query: /* GraphQL */ `
                query($isoDateFrom: String!) {
                  daysBetween(
                    isoDateFrom: $isoDateFrom
                    isoDateTo: "2018-01-01"
                  )
                }
              `
            }}
          >
            {result => (
              <pre
                dangerouslySetInnerHTML={{
                  __html: snapshotObject(result)
                }}
              />
            )}
          </Query>
        )}
      </Query>
    </Provider>
  )

  await preload(tree)

  t.matchSnapshot(
    reactDom.renderToString(tree),
    'HTML displaying the nested query render function argument.'
  )
})

t.test('Preload legacy React context API components.', async t => {
  /**
   * A test legacy context provider component.
   * @ignore
   */
  class LegacyContextProvider extends React.Component {
    static propTypes = {
      value: PropTypes.string,
      children: PropTypes.node
    }

    static childContextTypes = {
      value: PropTypes.string
    }

    /**
     * Provides the context value for descendants.
     * @returns {Object} Context value.
     * @ignore
     */
    getChildContext() {
      return { value: this.props.value }
    }

    /**
     * Renders the component.
     * @ignore
     * @returns {ReactElement} React virtual DOM element.
     */
    render() {
      return <div>{this.props.children}</div>
    }
  }

  /**
   * A test legacy context consumer component.
   * @ignore
   */
  class LegacyContextConsumer extends React.Component {
    static contextTypes = {
      value: PropTypes.string
    }

    /**
     * Renders the component.
     * @ignore
     * @returns {ReactElement} React virtual DOM element.
     */
    render() {
      return <p>{this.context.value}</p>
    }
  }

  const tree = (
    <LegacyContextProvider value="Context value.">
      <div>
        <LegacyContextConsumer />
      </div>
    </LegacyContextProvider>
  )

  t.matchSnapshot(reactDom.renderToString(tree), 'HTML.')

  await preload(tree)
})

t.test('Cache export & import.', async t => {
  const app = new Koa()
    .use(errorHandler())
    .use(bodyParser())
    .use(execute({ schema, rootValue }))
  const port = await startServer(t, app)
  const graphql1 = new GraphQL()
  await graphql1.query({
    fetchOptionsOverride(options) {
      options.url = `http://localhost:${port}`
    },
    operation: {
      variables: { date: '2018-01-01' },
      query: YEAR_QUERY
    }
  }).request
  const graphql2 = new GraphQL({ cache: graphql1.cache })

  t.equals(graphql1.cache, graphql2.cache, 'Exported and imported cache match.')
})

t.test('Cache reset.', async t => {
  const app = new Koa()
    .use(errorHandler())
    .use(bodyParser())
    .use(execute({ schema, rootValue }))
  const port = await startServer(t, app)
  const graphql = new GraphQL()

  const {
    fetchOptionsHash: fetchOptionsHash1,
    request: request1
  } = await graphql.query({
    fetchOptionsOverride(options) {
      options.url = `http://localhost:${port}`
    },
    operation: {
      variables: { date: '2018-01-01' },
      query: YEAR_QUERY
    }
  })

  await request1

  const cacheBefore = JSON.stringify(graphql.cache)

  const { request: request2 } = graphql.query({
    fetchOptionsOverride(options) {
      options.url = `http://localhost:${port}`
    },
    operation: {
      variables: { date: '2018-01-02' },
      query: YEAR_QUERY
    }
  })

  await request2

  t.plan(2)

  graphql.on('reset', () => t.pass('`reset` event.'))

  graphql.reset(fetchOptionsHash1)

  const cacheAfter = JSON.stringify(graphql.cache)

  t.equals(cacheAfter, cacheBefore, 'Before and after reset cache match.')
})
