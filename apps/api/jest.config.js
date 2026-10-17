/* eslint-disable @typescript-eslint/no-require-imports */
const { createConfig } = require("../../jest.config.base");

module.exports = createConfig({
  name: "api",
  rel: "apps/api",
  env: "node",
});
