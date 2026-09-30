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
        // Ensures the E2E programmer account exists with the PROGRAMMER role.
        async createProgrammerUser({ name, email, password }: { name: string; email: string; password: string }) {
          const { createRequire } = await import("node:module");
          const { readFileSync } = await import("node:fs");

          const apiRequire = createRequire(new URL("../API/package.json", import.meta.url));
          const { Pool } = apiRequire("pg") as typeof import("pg");

          const envText = readFileSync(new URL("../API/.env", import.meta.url), "utf8");
          const connectionString = process.env.DATABASE_URL ?? envText.match(/^DATABASE_URL=["']?([^"'\r\n]+)/m)?.[1];

          if (!connectionString) return null;

          const pool = new Pool({ connectionString });

          try {
            const existing = await pool.query(`SELECT id FROM "user" WHERE email = $1 LIMIT 1`, [email]);
            if (existing.rowCount && existing.rowCount > 0) return null;

            // better-auth hashes passwords; reuse its API via HTTP instead of
            // crafting the row by hand.
            const response = await fetch(`${process.env.CYPRESS_API_URL ?? "http://localhost:3333"}/api/auth/sign-up/programmer`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok && response.status !== 422) {
              throw new Error(`Failed to create programmer: ${response.status}`);
            }
          } finally {
            await pool.end();
          }

          return null;
        },

        // Polls until an OFFER_SENT notification row exists for the client.
        async waitForOfferNotification([clientId, projectId]: [string, string]) {
          const { createRequire } = await import("node:module");
          const { readFileSync } = await import("node:fs");

          const apiRequire = createRequire(new URL("../API/package.json", import.meta.url));
          const { Pool } = apiRequire("pg") as typeof import("pg");

          const envText = readFileSync(new URL("../API/.env", import.meta.url), "utf8");
          const connectionString = process.env.DATABASE_URL ?? envText.match(/^DATABASE_URL=["']?([^"'\r\n]+)/m)?.[1];

          if (!connectionString) return false;

          const pool = new Pool({ connectionString });

          try {
            const deadline = Date.now() + 10_000;

            while (Date.now() < deadline) {
              const result = await pool.query(
                `SELECT 1 FROM notification
                 WHERE user_id = $1 AND project_id = $2 AND type = 'NEW_MESSAGE'
                 AND title = 'Nova proposta de prazo' LIMIT 1`,
                [clientId, projectId],
              );

              if (result.rowCount && result.rowCount > 0) return true;

              await new Promise((resolve) => setTimeout(resolve, 500));
            }

            return false;
          } finally {
            await pool.end();
          }
        },

        // Removes the offer created by the spec so reruns stay deterministic.
        async deleteProgrammerOffer([projectId, content]: [string, string]) {
          const { createRequire } = await import("node:module");
          const { readFileSync } = await import("node:fs");

          const apiRequire = createRequire(new URL("../API/package.json", import.meta.url));
          const { Pool } = apiRequire("pg");

          const envText = readFileSync(new URL("../API/.env", import.meta.url), "utf8");
          const connectionString = process.env.DATABASE_URL ?? envText.match(/^DATABASE_URL=["']?([^"'\r\n]+)/m)?.[1];

          if (!connectionString) return null;

          const pool = new Pool({ connectionString });

          try {
            await pool.query(
              `DELETE FROM notification WHERE project_id = $1 AND type = 'NEW_MESSAGE' AND message LIKE $2`,
              [projectId, `%${content}%`],
            );
            await pool.query(
              `DELETE FROM message WHERE project_id = $1 AND content LIKE $2`,
              [projectId, `%${content}%`],
            );
          } finally {
          	pool.end();
          }

          return null;
        },

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
