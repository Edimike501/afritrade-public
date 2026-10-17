/* eslint-disable @typescript-eslint/no-require-imports */
const { createConfig } = require("../../jest.config.base");
module.exports = createConfig({ name: "hooks", rel: "packages/hooks", env: "node" });
