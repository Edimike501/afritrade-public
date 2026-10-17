/* eslint-disable @typescript-eslint/no-require-imports */
const { createConfig } = require("../../jest.config.base");

module.exports = createConfig({
  name: "ui",
  rel: "packages/ui",
  env: "jsdom",
});
