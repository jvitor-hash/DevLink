import { LoginPage } from "../pom/loginPage";

const API_URL = Cypress.expose("API_URL") ?? "http://localhost:3333";
const password = "123456789";
const tag = `chat-${Date.now()}`;
const client = { name: `Chat Client ${tag}`, email: `${tag}-client@example.com` };
const programmer = { name: `Chat Programmer ${tag}`, email: `${tag}-programmer@example.com` };

describe("Chat between real client and programmer users", () => {
  let projectId = "";
  let clientId = "";

  const signUp = (role: "client" | "programmer", user: { name: string; email: string }): void => {
    cy.request({
      method: "POST",
      url: `${API_URL}/api/auth/sign-up/${role}`,
      body: { name: user.name, email: user.email, password },
      failOnStatusCode: false,
    });
  };

  const loginWithPom = (user: { name: string; email: string }): void => {
    cy.visit("/");
    new LoginPage().login(user.name, user.email, password);
  };

  before(() => {
    signUp("client", client);
    signUp("programmer", programmer);

    loginWithPom(client);
    cy.request("GET", `${API_URL}/api/auth/get-session`).then((session) => {
      clientId = session.body.user.id;
    });
    cy.request({
      method: "POST",
      url: `${API_URL}/api/v1/projects`,
      body: {
        title: `Temporary chat project ${tag}`,
        description: "Temporary project used by the real-user chat E2E test.",
        category: "WEBSITES",
        sub_category: "WORDPRESS",
        primaryLanguage: "TYPESCRIPT",
        platforms: ["WEB"],
        audience: "CLIENTS",
        minBudget: 100,
        maxBudget: 500,
        problem: "Chat E2E project",
      },
    }).then((response) => {
      projectId = response.body.id;
    });
  });

  after(() => {
    if (!projectId) return;
    cy.clearCookies();
    loginWithPom(client);
    cy.request({ method: "DELETE", url: `${API_URL}/api/v1/projects/${projectId}`, failOnStatusCode: false });
  });

  it("shows messages sent by both real users", () => {
    cy.clearCookies();
    loginWithPom(programmer);
    cy.request("POST", `${API_URL}/api/v1/conversations`, { projectId, userId: "00000000-0000-0000-0000-000000000000", recipientId: clientId, lastMessage: `Programmer ${tag}` }).then((conversation) => {
      cy.request("POST", `${API_URL}/api/v1/messages`, { conversationId: conversation.body.id, content: `Programmer message ${tag}`, messageType: "MESSAGE" });
    });

    cy.clearCookies();
    loginWithPom(client);
    cy.visit(`/project/open/${projectId}`);
    cy.get('[aria-label="Histórico de conversa"]').click();
    cy.get('[data-testid="conversation-item"]').first().click();
    cy.contains(`Programmer message ${tag}`).should("be.visible");
    cy.get('[data-testid="chat-message-input"]').type(`Client message ${tag}`);
    cy.get('[data-testid="chat-send-message"]').click();
    cy.contains(`Client message ${tag}`).should("be.visible");

    cy.clearCookies();
    loginWithPom(programmer);
    cy.visit(`/project/open/${projectId}`);
    cy.get('[aria-label="Histórico de conversa"]').click();
    cy.get('[data-testid="conversation-item"]').first().click();
    cy.contains(`Programmer message ${tag}`).should("be.visible");
    cy.contains(`Client message ${tag}`).should("be.visible");
  });
});
