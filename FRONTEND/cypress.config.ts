import { unlinkSync } from "node:fs";
import { defineConfig } from "cypress";
import codeCoverage from "@cypress/code-coverage/plugins";

const CHAT_TEST_PROJECT_ID = "550e8400-e29b-41d4-a716-446655440000";

export default defineConfig({
  expose: {
    API_URL: process.env.CYPRESS_API_URL ?? "http://localhost:3333",
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  },
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    videosFolder: "cypress/videos/",
    screenshotsFolder: "cypress/screenshots/",
    video: true,
    videoCompression: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,

    defaultCommandTimeout: 5000,

    setupNodeEvents(on, config) {
      // @cypress/code-coverage v4: register tasks via the plugins export.
      const withCoverage = codeCoverage(on, config);

      // Keeps the chat spec idempotent: restores seeded offers consumed by
      // previous runs back to PENDING.
      on("task", {
        async resetChatFixture() {
          const { createRequire } = await import("node:module");
          const { readFileSync } = await import("node:fs");

          // pg lives in the API workspace; resolve it from there.
          const apiRequire = createRequire(new URL("../API/package.json", import.meta.url));
          const { Pool } = apiRequire("pg") as typeof import("pg");

          const envText = readFileSync(new URL("../API/.env", import.meta.url), "utf8");
          const connectionString = process.env.DATABASE_URL ?? envText.match(/^DATABASE_URL=["']?([^"'\r\n]+)/m)?.[1];

          if (!connectionString) return null;

          const pool = new Pool({ connectionString });

          try {
            await pool.query(
              `UPDATE message SET offer_status = 'PENDING', is_read = false
               WHERE project_id = $1 AND content LIKE 'Proposta seed%'`,
              [CHAT_TEST_PROJECT_ID],
            );
          } finally {
            await pool.end();
          }

          return null;
        },
      });

      on("after:spec", (spec, results) => {
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === "failed"),
          );
          if (!failures) {
            // delete the video if the spec passed and no tests retried
            unlinkSync(results.video);
          }
        }
      });

      return withCoverage;
    },
  },
});
