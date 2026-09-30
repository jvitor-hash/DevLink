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

const ensureUser = (name: string, email: string, password: string, role: 'client' | 'programmer'): void => {
  const endpoint = role === 'client'
    ? `${API_URL}/api/auth/sign-up/client`
    : `${API_URL}/api/auth/sign-up/programmer`;

  cy.request({
    method: 'POST',
    url: endpoint,
    body: { name, email, password },
    failOnStatusCode: false,
  });
};

Cypress.Commands.add('loginViaApi', (email: string, password: string) => {
  // Session is created once per user; later tests replay cached cookies
  // instead of hammering the auth endpoint.
  cy.session([email, password], () => {
    signIn(email, password).then((response) => {
      if (response.status !== 200) {
        ensureUser('test', email, password, 'client');

        signIn(email, password);
      }
    });
  });
});

// Programmers sign up through a dedicated endpoint that assigns the role.
Cypress.Commands.add('loginViaApiAsProgrammer', (email: string, password: string, name = 'programmer') => {
  cy.session([email, password, 'programmer'], () => {
    signIn(email, password).then((response) => {
      if (response.status !== 200) {
        ensureUser(name, email, password, 'programmer');

        signIn(email, password);
      }
    });
  });
});

// declare global {
//   namespace Cypress {
//     interface Chainable {
//       loginViaApi(email: string, password: string): Chainable<void>
//       loginViaApiAsProgrammer(email: string, password: string, name?: string): Chainable<void>
//     }
//   }
// }
