# @cypress/mock-ssr

# NOTE: This experimental package is in Developer Preview and is not yet published to npm

- [Connect](https://github.com/senchalabs/connect) middleware for any connect based Node.js server including [Express](https://expressjs.com), [Next.js](https://nextjs.org), [Nuxt.js](https://nuxtjs.org/).
- [Cypress](https://cypress.io) commands for mocking Server Side Rendered (SSR) content in [Cypress](https://cypress.io) tests.

## Install

```sh
$ npm install --dev https://github.com/cypress-io/cypress-mock-ssr#master
```

```sh
$ yarn add -D https://github.com/cypress-io/cypress-mock-ssr#master
```

## Cypress Commands

The following [Cypress](https://cypress.io) commands are bundled in this module.

### mockSSR

`mockSSR` sends a request to the middleware endpoint `/__cypress_server_mock` to set a mock for the given payload. Multiple calls to `mockSSR` can be made, each with distinct payloads.

```js
it("validate server rendered content", () => {
  const joke = "Our wedding was so beautiful, even the cake was in tiers."
  cy.mockSSR({
    hostname: "https://icanhazdadjoke.com",
    method: "GET",
    path: "/",
    statusCode: 200,
    body: {
      id: "NmbFtH69hFd",
      joke,
      status: 200,
    },
  })

  cy.visit("/")
  cy.contains("[data-cy=post]", joke)
})
```

mockSSR uses the [Nock](https://github.com/nock/) library to intercept the request. [By default](https://github.com/nock/nock#read-this---about-interceptors), Nock will only intercept a single call to for a URL before the intercept is discarded. To [persist](https://github.com/nock/nock#persist) the intercept across multiple calls, pass `persist: true` to `mockSSR`:

```js
it("validate server rendered content", () => {
  const joke = "Our wedding was so beautiful, even the cake was in tiers."
  cy.mockSSR({
    hostname: "https://icanhazdadjoke.com",
    method: "GET",
    path: "/",
    statusCode: 200,
    body: {
      id: "NmbFtH69hFd",
      joke,
      status: 200,
    },
    persist: true,
  })

  cy.visit("/")
  cy.contains("[data-cy=post]", joke)
})

it("renders the same joke over and over", () => {
  cy.visit("/")
  cy.contains("[data-cy=post]", joke)
})
```

### clearSSRMocks

> NOTE: `clearSSRMocks` is called in global `beforeEach` and `after` hooks when it is `require`d in `cypress/support/index.js`.

`clearSSRMocks` sends a request to the middleware endpoint `/__cypress_clear_mocks` to clear any mocks for the given test. It should be called in a lifecycle hook, such as `beforeEach`.

### Usage

Require `mockSSRCommands` in the `cypress/support/index.js` in your project.

```js
// cypress/support/index.js
require("./commands")
require("@cypress/mock-ssr/mockSSRCommands")
```

## Middleware

This module exports [connect middleware](https://github.com/senchalabs/connect) for use in Node.js servers to provide mock routes for mocking and clearing Server Side Rendered (SSR) content.

`cypressMockMiddleware` can be used in any [connect](https://github.com/senchalabs/connect) based Node.js server including [Express](https://expressjs.com), [Next.js](https://nextjs.org), [Nuxt.js](https://nuxtjs.org/).

```js
const { cypressMockMiddleware } = require("@cypress/mock-ssr")

const server = express()

server.use(cypressMockMiddleware())
```

### Express

`cypressMockMiddleware()` can be used with a [Express server](https://expressjs.com) to add the mocking capabilities for server rendered content.

```js
const express = require("express")
const { cypressMockMiddleware } = require("@cypress/mock-ssr")

const server = express()

server.use(cypressMockMiddleware())

server.get("*", (req, res) => {
  // ...
})

server.listen(port, (err) => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${port}`)
})
```

### Next.js

**Note: The custom server recommended is for testing purposes only and uses the base [custom server](https://nextjs.org/docs/advanced-features/custom-server) provided by the [Next.js](https://nextjs.org) team.**

`cypressMockMiddleware()` can be used with a [custom Next.js server](https://nextjs.org/docs/advanced-features/custom-server) to add the mocking capabilities to a [Next.js project](https://nextjs.org)

```js
// testServer.js
const express = require("express")
const next = require("next")
const { cypressMockMiddleware } = require("@cypress/mock-ssr")

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.use(cypressMockMiddleware())

  server.get("*", (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
```

It is recommended that this `testServer.js` be added as a separate npm script to be used during test runs.

```js
// package.json
"scripts": {
  "build": "next build",
  "dev": "next dev",
  "nextTestServer": "node testServer.js"
}
```

## Nuxt.js

For use with [Nuxt.js](https://nuxtjs.org), import `cypressMockMiddleware` and add it to the `serverMiddleware` array of middlewares.

```js
// nuxt.config.js
const { cypressMockMiddleware } = require("@cypress/mock-ssr")

export default {
  serverMiddleware: [cypressMockMiddleware()],
  // ...
}
```

## Credit

- Developed by the Cypress DX Team
- Thanks to [Gleb Bahmutov](https://twitter.com/@bahmutov) for the [inspiration](https://glebbahmutov.com/blog/mock-network-from-server/).
