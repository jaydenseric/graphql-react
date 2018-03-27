const timers = {}

export default {
  Query: {
    timer: (obj, { timerId }) => timers[timerId],
    timers: () => Object.values(timers),
    exampleError: () => {
      throw new Error(
        'This example error was thrown in the “exampleError” query resolver.'
      )
    }
  },
  Mutation: {
    createTimer: () => {
      const startDate = new Date()
      const id = startDate.getTime()
      return (timers[id] = { id, startDate })
    }
  },
  Timer: {
    milliseconds: ({ startDate }) => new Date() - startDate
  }
}
