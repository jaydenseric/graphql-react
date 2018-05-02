const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const gql = require('fake-tag')
const next = require('next')

const schema = buildSchema(gql`
  type Query {
    timer(timerId: ID!): Timer!
    timers: [Timer]!
    exampleError: Boolean
  }

  type Mutation {
    createTimer: Timer!
  }

  type Timer {
    id: ID!
    milliseconds: Int!
  }
`)

const timers = {}

class Timer {
  constructor() {
    this.startDate = new Date()
    this.id = this.startDate.getTime()
  }

  milliseconds() {
    return new Date() - this.startDate
  }
}

const rootValue = {
  createTimer() {
    const timer = new Timer()
    return (timers[timer.id] = timer)
  },
  timer: ({ timerId }) => timers[timerId],
  timers: () => Object.values(timers),
  exampleError() {
    throw new Error(
      'This example error was thrown in the “exampleError” query resolver.'
    )
  }
}

const nextApp = next({ dev: process.env.NODE_ENV === 'development' })
const nextRequestHandler = nextApp.getRequestHandler()

nextApp.prepare().then(() =>
  express()
    .use('/graphql', graphqlHTTP({ schema, rootValue, graphiql: true }))
    .get('*', nextRequestHandler)
    .listen(process.env.PORT, error => {
      if (error) throw error
      // eslint-disable-next-line no-console
      console.info(
        `Serving localhost:${process.env.PORT} for ${process.env.NODE_ENV}.`
      )
    })
)
