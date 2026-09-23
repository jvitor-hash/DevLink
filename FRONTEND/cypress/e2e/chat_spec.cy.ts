describe("Fluxo do chat do projeto", () => {
  beforeEach(() => {
    cy.loginViaApi("test@example.com", "123456789");
  });

  const openChat = () => {
    cy.get('button[aria-label="chat"]').should("exist").click();
    cy.get('[data-testid="chat-dock"]').should("exist");
  };

  it("mantem o chat oculto ate o usuario abrir pelo botao", () => {
    cy.visit("/project/open/550e8400-e29b-41d4-a716-446655440000");

    cy.get('[data-testid="chat-dock"]').should("not.exist");

    cy.get('button[aria-label="chat"]').click();
    cy.get('[data-testid="chat-dock"]').should("exist");
    cy.get('[data-testid="chat-connection-status"]').should("exist");

    cy.get('[data-testid="close-chat-btn"]').click();
    cy.get('[data-testid="chat-dock"]').should("not.exist");
  });

  it("conecta o chat e envia mensagem criptografada", () => {
    cy.intercept("POST", "**/api/v1/messages").as("createMessage");
    cy.visit("/project/open/550e8400-e29b-41d4-a716-446655440000");

    openChat();

    cy.get('input[placeholder="Digite sua mensagem aqui..."]').type("Olá do Cypress");
    cy.get('[data-testid="chat-send-btn"]').click();

    cy.contains("Olá do Cypress").should("exist");
  });

  it("envia proposta de prazo", () => {
    cy.visit("/project/open/550e8400-e29b-41d4-a716-446655440000");

    openChat();

    cy.get('[data-testid="offer-mode-btn"]').click();
    cy.get('input[placeholder="Descreva a proposta de prazo..."]').type("Proposta de teste");
    cy.get('input[type="date"]').type("2026-12-31");
    cy.get('[data-testid="chat-send-btn"]').click();

    cy.contains("Proposta de prazo:").should("exist");
    cy.contains("Proposta de teste").should("exist");
  });

  it("aceita e rejeita propostas de prazo", () => {
    cy.visit("/project/open/550e8400-e29b-41d4-a716-446655440000");

    openChat();

    cy.get('[data-testid^="offer-accept-"]').first().then(($accept) => {
      const messageId = $accept.attr("data-testid")?.replace("offer-accept-", "") ?? "";

      cy.get(`[data-testid="offer-accept-${messageId}"]`).click();
      cy.get(`[data-testid="offer-status-${messageId}"]`).should("contain", "Proposta aceita");
    });

    cy.get('[data-testid^="offer-reject-"]').first().then(($reject) => {
      const messageId = $reject.attr("data-testid")?.replace("offer-reject-", "") ?? "";

      cy.get(`[data-testid="offer-reject-${messageId}"]`).click();
      cy.get(`[data-testid="offer-status-${messageId}"]`).should("contain", "Proposta rejeitada");
    });
  });
});
