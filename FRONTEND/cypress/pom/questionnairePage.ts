/**
 * Page object for the questionnaire wizard (/questionnaire).
 *
 * The page sits behind ProtectedRoute; seedAdminUser() fakes an
 * authenticated ADMIN session in localStorage so no real API is needed
 * to reach the page (isAdmin short-circuits the permission check).
 */
export class QuestionnairePage {
  // Banner
  private bannerError = '[data-testid="banner-error"]';

  // Step 1 — problem
  private problemInput = 'textarea[name="problem"]';
  private affectedUsersInput = 'textarea[name="affected"]';
  private northQuestionInput = 'textarea[name="northQuestion"]';
  private hypothesisInput = 'textarea[name="hypothesis"]';

  // Step 2 — audience
  private audiencePainPointsInput = 'textarea[name="audiencePainPoints"]';
  private audienceAssumptionsInput = 'textarea[name="audienceAssumptions"]';
  private notAudienceInput = 'textarea[name="notAudience"]';

  // Step 3 — solution
  private requirementsInput = 'textarea[name="requirements"]';
  private successCriteriaInput = 'textarea[name="successCriteria"]';
  private valuePropositionInput = 'textarea[name="valueProposition"]';
  private differentiationInput = 'textarea[name="differentiation"]';
  private platformWebCheckbox = 'input[type="checkbox"]';

  // Step 4 — details
  private titleInput = 'input[name="title"]';
  private descriptionInput = 'textarea[name="description"]';
  private categorySelect = 'select[name="category"]';
  private subCategoryInput = 'input[name="subCategory"]';
  private minBudgetInput = '[data-testid="minBudget"]';
  private maxBudgetInput = '[data-testid="maxBudget"]';
  private deadlineInput = 'input[name="deadline"]';

  // Navigation
  private nextButton = '[data-testid="questionnaire-next"]';
  private backButton = '[data-testid="questionnaire-back"]';

  /** Fakes an authenticated ADMIN session so ProtectedRoute lets the page through. */
  seedAdminUser(): void {
    const adminUser = {
      id: "e2e-admin-user",
      name: "E2E Admin",
      email: "e2e-admin@example.com",
      emailVerified: true,
      role: "ADMIN",
    };

    // cy.window() targets the application under test: a bare
    // window.localStorage here would write to Cypress' spec frame,
    // where the app never looks.
    cy.window().then((win) => {
      win.localStorage.setItem("devlink:current_user", JSON.stringify(adminUser));
    });
  }

  visit(): void {
    // Visit the app first so localStorage belongs to the app's origin,
    // then seed the session and enter the protected route. Seeding
    // before any visit would write to the spec frame's origin, where
    // the app would never read it.
    cy.visit("/");
    this.seedAdminUser();
    cy.visit("/questionnaire");

    // Page is ready once the first step's first input is visible.
    cy.get(this.problemInput, { timeout: 15000 }).should("be.visible");
  }

  /**
   * Fail state: tries to advance past step 1 with every input empty.
   * The banner must appear and the unfilled textarea must carry the
   * error style (aria-invalid) while the user stays on step 1.
   */
  assertBlockedOnEmptyStep(): void {
    cy.get(this.nextButton).click();

    cy.get(this.bannerError).should("be.visible");

    cy.get(this.problemInput).should("have.attr", "aria-invalid", "true");
    cy.get(this.problemInput)
      .should("be.visible")
      .and("not.have.attr", "disabled");

    // Still on step 1: back button stays disabled.
    cy.get(this.backButton).should("be.disabled");
  }

  /**
   * Passing state: fills every required input across the four steps,
   * advances through the wizard and submits. The POST /api/v1/projects
   * request must be issued with the expected payload and the success
   * banner must appear.
   */
  fillAndSubmitSuccessfully(): void {
    cy.intercept("POST", "**/api/v1/projects", {
      statusCode: 201,
      body: { id: "e2e-project-id" },
    }).as("createProject");

    // Step 1 — problem
    cy.get(this.problemInput).type("Usuarios perdem tempo reformatando documentos manualmente.");
    cy.get(this.affectedUsersInput).type("Escritorios de pequeno porte que emitem notas fiscais.");
    cy.get(this.northQuestionInput).type("Como podemos automatizar a emissao de notas fiscais?");
    cy.get(this.hypothesisInput).type("Um gerador baseado em templates reduz o tempo de emissao em 80%.");
    cy.get(this.nextButton).click();

    // Step 2 — audience
    cy.get(this.audiencePainPointsInput).type("Perdem horas conferindo dados fiscais e corrigindo erros manuais.");
    cy.get(this.audienceAssumptionsInput).type("Acreditamos que ja usam planilhas e querem menos trabalho manual.");
    cy.get(this.notAudienceInput).type("Grandes empresas com sistemas fiscais integrados.");
    cy.get(this.nextButton).click();

    // Step 3 — solution
    cy.get(this.requirementsInput).type("Importar planilha, preencher dados faltantes e emitir a nota em PDF.");
    cy.get(this.successCriteriaInput).type("Emissao de uma nota fiscal em menos de um minuto.");
    cy.get(this.valuePropositionInput).type("Economia de tempo e eliminacao de erros de digitacao.");
    cy.get(this.differentiationInput).type("Templates prontos para pequenos negocios brasileiros.");
    this.checkPlatform("Web");
    cy.get(this.nextButton).click();

    // Step 4 — details
    cy.get(this.titleInput).type("Emissor de notas fiscais automatizado");
    cy.get(this.descriptionInput).type("Ferramenta que gera notas fiscais a partir de planilhas de vendas.");
    cy.get(this.categorySelect).then(($select) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        "value",
      )?.set;
      nativeSetter?.call($select[0], "test");
      $select[0].dispatchEvent(new Event("change", { bubbles: true }));
    });
    cy.get(this.subCategoryInput).type("automacao");
    cy.get(this.minBudgetInput).type("1000");
    cy.get(this.maxBudgetInput).type("5000");
    cy.get(this.deadlineInput).then(($el) => this.setNativeValue($el, "2026-12-31", "input"));
    cy.get(this.nextButton).click();

    cy.wait("@createProject")
      .its("request.body")
      .should((body: Record<string, unknown>) => {
        expect(body.title).to.eq("Emissor de notas fiscais automatizado");
        expect(body.platforms).to.deep.eq(["WEB"]);
        expect(body.audience).to.eq("CLIENTS");
        expect(body.primaryLanguage).to.eq("TYPESCRIPT");
        expect(body.minBudget).to.eq(1000);
        expect(body.maxBudget).to.eq(5000);
      });

    cy.get('[data-testid="banner-success"]').should("be.visible");
  }

  /** Checks the platform checkbox with the given visible label. */
  private checkPlatform(label: string): void {
    // The input and its label span are siblings; .prev() targets exactly
    // one checkbox, while .parent().find() would match all of them.
    cy.contains("span", ` ${label}`)
      .prev('input[type="checkbox"]')
      .check();
  }

  /**
   * Sets a form control's value through the native prototype setter and
   * dispatches the matching events: keystroke typing into
   * `<input type="date">` is segment/locale dependent, and `.select()`
   * on a controlled select can be suppressed by React's value tracker.
   * The native setter bypasses the tracker so React registers the change.
   */
  private setNativeValue($el: JQuery<HTMLElement>, value: string, tag: "input" | "select"): void {
    const proto = tag === "select" ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;

    nativeSetter?.call($el[0], value);
    $el[0].dispatchEvent(new Event("input", { bubbles: true }));
    $el[0].dispatchEvent(new Event("change", { bubbles: true }));
  }
}
