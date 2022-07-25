const connect = require("connect")
const nock = require("nock")

const cypressMockMiddleware = () => {
  const middleware = connect()

  middleware.use(
    "/__cypress_server_mock",
    function cypressServerMock(req, res) {
      const chunks = []

      req.on("data", (chunk) => {
        chunks.push(chunk)
      })

      req.on("end", () => {
        const reqBody = JSON.parse(Buffer.concat(chunks).toString())

        const { hostname, method, path, statusCode, body, persist } = reqBody
        lcMethod = method.toLowerCase()
        const chain = persist ? nock(hostname).persist() : nock(hostname);
        chain[lcMethod](path).reply(statusCode, body)
      })
      res.statusCode = 200
      res.end()
    }
  )

  middleware.use(
    "/__cypress_clear_mocks",
    function cypressClearServerMock(req, res) {
      nock.restore()
      nock.cleanAll()
      nock.activate()
      res.statusCode = 200
      res.end()
    }
  )

  return middleware
}

module.exports = { cypressMockMiddleware }
