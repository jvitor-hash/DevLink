import { defineConfig } from "cypress";
import { registerCodeCoverageTasks } from "@cypress/code-coverage/support";

export default defineConfig({
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
      registerCodeCoverageTasks(on, config);
      on("after:spec", (spec, results) => {
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === "failed"),
          );
          if (!failures) {
            // delete the video if the spec passed and no tests retried
            Bun.file.unlinkSync(results.video);
          }
        }
      });
      return config;
    },
  },
});
