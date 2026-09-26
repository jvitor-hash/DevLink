/// <reference types="cypress" />
// Custom commands registered for the e2e specs.

const API_URL = Cypress.expose('API_URL') ?? 'http://localhost:3333';

// 429-tolerant sign-in; better-auth throttles rapid repeat logins.
const signIn = (email: string, password: string): Cypress.Chainable<Cypress.Response<unknown>> =>
  cy.request({
    method: 'POST',
    url: `${API_URL}/api/auth/sign-in/email`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 429) {
      cy.wait(1500);

      return signIn(email, password);
    }

    return response;
  });

Cypress.Commands.add('loginViaApi', (email: string, password: string) => {
  // Session is created once per user; later tests replay cached cookies
  // instead of hammering the auth endpoint.
  cy.session([email, password], () => {
    signIn(email, password).then((response) => {
      if (response.status !== 200) {
        cy.request({
          method: 'POST',
          url: `${API_URL}/api/auth/sign-up/client`,
          body: { name: 'test', email, password },
          failOnStatusCode: false,
        });

        signIn(email, password);
      }
    });
  });
});

// declare global {
//   namespace Cypress {
//     interface Chainable {
//       loginViaApi(email: string, password: string): Chainable<void>
//     }
//   }
// }
