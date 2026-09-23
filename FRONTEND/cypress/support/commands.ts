/// <reference types="cypress" />
// Custom commands registered for the e2e specs.

const API_URL = (Cypress.env('API_URL') as string | undefined) ?? 'http://localhost:3333';

Cypress.Commands.add('loginViaApi', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/api/auth/sign-in/email`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) {
      cy.request({
        method: 'POST',
        url: `${API_URL}/api/auth/sign-up/client`,
        body: { name: 'test', email, password },
        failOnStatusCode: false,
      });

      cy.request({
        method: 'POST',
        url: `${API_URL}/api/auth/sign-in/email`,
        body: { email, password },
      });
    }
  });
});

// declare global {
//   namespace Cypress {
//     interface Chainable {
//       loginViaApi(email: string, password: string): Chainable<void>
//     }
//   }
// }
