export default /* GraphQL */ `
  type Query {
    timer(timerId: ID!): Timer!
    timers: [Timer]!
    exampleError: Boolean!
  }

  type Mutation {
    createTimer: Timer!
  }

  type Timer {
    id: ID!
    milliseconds: Int!
  }
`
