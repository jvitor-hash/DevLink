const API_URL = Cypress.expose("API_URL") ?? "http://localhost:3333";
const password = "123456789";
const tag = `offer-${Date.now()}`;
const client = { name: `Offer Client ${tag}`, email: `${tag}-client@example.com` };
const programmer = { name: `Offer Programmer ${tag}`, email: `${tag}-programmer@example.com` };

describe("Offer acceptance and rejection", () => {
  let acceptedProjectId = "";
  let rejectedProjectId = "";

  const signUp = (role: "client" | "programmer", user: { name: string; email: string }): void => {
    cy.request({ method: "POST", url: `${API_URL}/api/auth/sign-up/${role}`, body: { ...user, password }, failOnStatusCode: false });
  };

  const login = (user: { email: string }): void => {
    cy.loginViaApi(user.email, password);
  };

  const createProject = (title: string): Cypress.Chainable<string> => cy.request({
    method: "POST",
    url: `${API_URL}/api/v1/projects`,
    body: {
      title, description: title, category: "WEBSITES", sub_category: "OTHER",
      primaryLanguage: "TYPESCRIPT", platforms: ["WEB"], audience: "CLIENTS",
      minBudget: 100, maxBudget: 500, problem: title,
    },
  }).then((response) => response.body.id as string);

  const createOffer = (projectId: string): Cypress.Chainable<string> => {
    cy.clearCookies();
    cy.loginViaApiAsProgrammer(programmer.email, password);
    return cy.request({ method: "POST", url: `${API_URL}/api/v1/conversations`, body: { projectId, userId: "00000000-0000-0000-0000-000000000000", recipientId: "00000000-0000-0000-0000-000000000000" } })
      .then((conversation) => cy.request({ method: "POST", url: `${API_URL}/api/v1/messages`, body: { conversationId: conversation.body.id, content: `Offer ${tag}`, messageType: "OFFER", offerStatus: "PENDING", offerMoney: 250 }).then(() => conversation.body.id as string));
  };

  before(() => {
    signUp("client", client);
    signUp("programmer", programmer);
    cy.clearCookies();
    login(client);
    createProject(`Accepted offer ${tag}`).then((id) => { acceptedProjectId = id; });
    createProject(`Rejected offer ${tag}`).then((id) => { rejectedProjectId = id; });
  });

  it("lets the client accept an offer and assigns the programmer", () => {
    createOffer(acceptedProjectId);
    cy.clearCookies();
    login(client);
    cy.visit(`/project/open/${acceptedProjectId}`);
    cy.get('[aria-label="Histórico de conversa"]').click();
    cy.get('[data-testid="conversation-item"]').first().click();
    cy.get('[data-testid="offer-accept"]').click();
    cy.contains("Aceita").should("be.visible");
    cy.clearCookies();
    login(programmer);
    cy.request("GET", `${API_URL}/api/v1/projects/${acceptedProjectId}`).its("body.programmerId").should("not.be.null");
  });

  it("lets the client reject an offer and keeps it unassigned", () => {
    createOffer(rejectedProjectId);
    cy.clearCookies();
    login(client);
    cy.visit(`/project/open/${rejectedProjectId}`);
    cy.get('[aria-label="Histórico de conversa"]').click();
    cy.get('[data-testid="conversation-item"]').first().click();
    cy.get('[data-testid="offer-reject"]').click();
    cy.contains("Recusada").should("be.visible");
    cy.clearCookies();
    login(programmer);
    cy.request("GET", `${API_URL}/api/v1/projects/${rejectedProjectId}`).its("body.programmerId").should("be.null");
  });
});
