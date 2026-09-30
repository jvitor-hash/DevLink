// Programmer-side chat flow: a programmer opens the project room, sends a
// plain message and a negotiation offer; the client gets an outbox-routed
// notification for the offer.
//
// Seeded fixture (chat_test project):
//   client 550e8400-e29b-41d4-a716-446655440001 (test@example.com)
//   project 550e8400-e29b-41d4-a716-446655440000 (OPEN)

const PROJECT_ID = "550e8400-e29b-41d4-a716-446655440000";
const CLIENT_ID = "550e8400-e29b-41d4-a716-446655440001";
const PROGRAMMER_EMAIL = "programmer@example.com";
const PROGRAMMER_PASSWORD = "123456789";
const UNIQUE_TAG = `cy-${Date.now()}`;

describe("Fluxo do programador no chat do projeto", () => {
  before(() => {
    // Ensures the programmer account exists before its session is cached.
    cy.task("createProgrammerUser", {
      name: "Programador Cypress",
      email: PROGRAMMER_EMAIL,
      password: PROGRAMMER_PASSWORD,
    });
  });

  beforeEach(() => {
    cy.loginViaApiAsProgrammer(PROGRAMMER_EMAIL, PROGRAMMER_PASSWORD);
  });

  afterEach(() => {
    // Keeps reruns deterministic: drops this run's message and notification.
    cy.task("deleteProgrammerOffer", [PROJECT_ID, UNIQUE_TAG]);
  });

  it("envia mensagens e propostas enquanto o cliente recebe notificacao", () => {
    cy.visit(`/project/open/${PROJECT_ID}`);

    // Programmer writes: composer and offer toggle are rendered for them.
    cy.get('[data-testid="chat-dock"]').should("exist");
    cy.get('input[placeholder="Digite sua mensagem aqui..."]').should("exist");
    cy.get('[data-testid="offer-mode-btn"]').should("exist");

    // Plain message lands in the room.
    cy.get('input[placeholder="Digite sua mensagem aqui..."]').type(`Olá do programador ${UNIQUE_TAG}`);
    cy.get('[data-testid="chat-send-btn"]').click();
    cy.contains(`Olá do programador ${UNIQUE_TAG}`).should("exist");

    // Offer flow: date + description, then the pending bubble appears.
    cy.get('[data-testid="offer-mode-btn"]').click();
    cy.get('input[type="date"]').type("2026-12-31");
    cy.get('input[placeholder="Descreva a proposta de prazo..."]').type(`Proposta ${UNIQUE_TAG}`);
    cy.get('[data-testid="chat-send-btn"]').click();

    cy.contains(`Proposta ${UNIQUE_TAG}`).should("exist");
    cy.contains("Proposta de prazo:").should("exist");

    // No accept/reject for the sender; decisions belong to the client.
    cy.get('[data-testid="offer-accept"]').should("not.exist");
    cy.get('[data-testid="offer-reject"]').should("not.exist");

    // The outbox drains the OFFER_SENT event and inserts the client
    // notification (also fanned out to webhook subscribers).
    cy.task("waitForOfferNotification", [CLIENT_ID, PROJECT_ID]).then((found) => {
      expect(found, "client received the offer notification").to.equal(true);
    });
  });
});
