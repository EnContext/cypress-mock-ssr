const connect = require('connect')
const nock = require('nock')

const cypressMockMiddleware = connect();

cypressMockMiddleware.use('/__cypress_server_mock', function cypressServerMock(req, res, next) {
  const chunks = []

  req.on("data", (chunk) => {
    chunks.push(chunk)
  });

  req.on("end", () => {
    const reqBody = JSON.parse(Buffer.concat(chunks).toString());

    const { hostname, method, path, statusCode, body } = reqBody
    lcMethod = method.toLowerCase()
    nock(hostname)[lcMethod](path).reply(statusCode, body)
  });
  res.statusCode = 200;
  res.end()
});

cypressMockMiddleware.use('/__cypress_clear_mocks', function cypressClearServerMock(req, res) {
  nock.restore()
  nock.cleanAll()
  nock.activate()
  res.statusCode = 200;
  res.end()
})

module.exports = { cypressMockMiddleware };
