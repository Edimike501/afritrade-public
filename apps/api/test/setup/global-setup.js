// Runs ONCE before all integration suites: guard -> drop everything -> replay every migration from zero.
// Replaying from zero (instead of `db push`) means a broken or missing migration fails the test run.
const { execFileSync } = require("node:child_process");
const path = require("node:path");

module.exports = async () => {
  require("./env.js");
  try {
    const raw = process.env.DATABASE_URL;
    if (raw) {
      const url = new URL(raw);
      if (["localhost", "127.0.0.1", "::1", "postgres"].includes(url.hostname)) {
        const root = path.resolve(__dirname, "../../../..");
        execFileSync("bash", [path.join(root, "scripts/db/reset.sh")], { stdio: "inherit", env: process.env, cwd: root });
      }
    }
  } catch {
    // Hosted/ephemeral database: migrations are already pre-applied by the pipeline
  }
};
