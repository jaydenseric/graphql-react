/**
 * Starts a Node.js HTTP server.
 * @param {object} server Node.js HTTP server.
 * @returns {Promise<{port: number, close: Function}>} Resolves the port the server is listening on, and a server close function.
 * @ignore
 */
export function listen(server) {
  return new Promise((resolve, reject) => {
    server.listen(function (error) {
      if (error) reject(error)
      else
        resolve({
          port: this.address().port,
          close: () => this.close(),
        })
    })
  })
}
