describe("Fluxo do chat do projeto", () => {
  beforeEach(() => {
    cy.loginViaApi("test@example.com", "123456789");
  });

  it("exibe o chat embutido na pagina sem botao de abrir", () => {
    cy.visit("/project/open/550e8400-e29b-41d4-a716-446655440000");

    // The panel is part of the page: visible on load, no toggle button anywhere.
    cy.get('[data-testid="chat-dock"]').should("exist");
    cy.get('[data-testid="chat-connection-status"]').should("exist");
    cy.get('button[aria-label="chat"]').should("not.exist");
    cy.get('[data-testid="close-chat-btn"]').should("not.exist");
  });

  it("exibe a caixa de entrada com uma conversa por participante", () => {
    cy.visit("/project/open/550e8400-e29b-41d4-a716-446655440000");

    cy.get('[data-testid="chat-history"]').should("exist");
    cy.get('[data-testid="chat-history-participant"]')
      .should("have.length.at.least", 1)
      .first()
      .should("be.visible")
      .and("not.be.empty");
  });

  it("abre a conversa de um programador a partir da caixa de entrada", () => {
    cy.visit("/project/open/550e8400-e29b-41d4-a716-446655440000");

    cy.get('[data-testid="chat-history-participant"]').first().click();

    cy.get('[data-testid="chat-thread-header"]').should("exist");
    cy.get('[data-testid="chat-thread-back"]').should("exist").click();
    cy.get('[data-testid="chat-history"]').should("exist");
  });

  it("conecta o chat em modo leitura para o cliente criador", () => {
    cy.visit("/project/open/550e8400-e29b-41d4-a716-446655440000");

    // The project creator is view-only; programmers write the messages.
    cy.get('input[placeholder="Digite sua mensagem aqui..."]').should("not.exist");
    cy.contains("Apenas programadores podem enviar mensagens neste chat.").should("exist");
  });

  it("marca propostas como vistas ao rolar a conversa", () => {
    // Previous runs consumed the seeded offers; restore them to PENDING.
    cy.task("resetChatFixture");

    cy.visit("/project/open/550e8400-e29b-41d4-a716-446655440000");

    // Unseen offers badge on the panel header while the inbox is open.
    cy.get('[data-testid="chat-offer-badge"]').first()
      .should("have.attr", "data-count")
      .and("match", /^[1-9][0-9]*$/);

    // Capture the count before opening the thread.
    cy.get('[data-testid="chat-offer-badge"]').first().then(($badge) => {
      const before = Number($badge.attr("data-count"));

      cy.get('[data-testid="chat-history-participant"]').first().click();

      // Offers visible in the viewport are marked seen automatically.
      cy.get("[data-seen-watcher='true']").its("length").then((watched) => {
        if (watched === 0) return;

        cy.get("[data-seen-watcher='true']").first().should("be.visible");
        cy.get('[data-testid="chat-offer-badge"]', { timeout: 8000 }).then(($after) => {
          if ($after.length === 0) {
            expect(before).to.be.greaterThan(0);
          } else {
            expect(Number($after.attr("data-count"))).to.be.lessThan(before);
          }
        });
      });
    });
  });

  it("aceita e rejeita propostas de prazo", () => {
    // Offers arrive from programmers; the client creator reviews them here.
    // Previous runs consumed the seeded offers; restore them to PENDING.
    cy.task("resetChatFixture");

    cy.visit("/project/open/550e8400-e29b-41d4-a716-446655440000");

    cy.get('[data-testid="offer-accept"]').first().then(($accept) => {
      const messageId = $accept.attr("data-message-id") ?? "";

      cy.get(`[data-testid="offer-accept"][data-message-id="${messageId}"]`).click();
      cy.get(`[data-testid="offer-status-accepted"][data-message-id="${messageId}"]`).should("contain", "Proposta aceita");
    });

    cy.get('[data-testid="offer-reject"]').first().then(($reject) => {
      const messageId = $reject.attr("data-message-id") ?? "";

      cy.get(`[data-testid="offer-reject"][data-message-id="${messageId}"]`).click();
      cy.get(`[data-testid="offer-status-rejected"][data-message-id="${messageId}"]`).should("contain", "Proposta rejeitada");
    });
  });
});
