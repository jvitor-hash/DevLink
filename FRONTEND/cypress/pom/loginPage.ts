export class LoginPage {
  private loginBtn = '[data-testid="login-btn"]';
  private nameInput = '[data-testid="name-input"]';
  private emailInput = '[data-testid="email-input"]';
  private passwordInput = '[data-testid="password-input"]';
  private registerLink = '[data-testid="register-link"]';
  private submitBtn = '[data-testid="submit-btn"]';
  private clearBtn = '[data-testid="reset-btn"]';

  clearInputs(): void {
    this.openModal();

    cy.get(this.clearBtn)
      .should('be.visible');

    // For testing clearing both login and register pages.
    // Order: 1. Login, 2. Register

    // 1. Login
    this.email.type("test@example.com");
    this.password.type("123456789");

    this.clear.click();

    this.email.should("have.value", '');
    this.password.should('have.value', '');

    // 2. Register
    cy.get(this.registerLink)
      .should('be.visible')
      .click();

    this.name.type("Test");
    this.email.type("test@example.com");
    this.password.type("123456789");

    this.clear.click();

    this.name.should("have.value", '');
    this.email.should("have.value", '');
    this.password.should('have.value', '');
  }

  register(user: string, email: string, password: string): void {
    this.openModal();

    cy.get(this.registerLink)
      .should('be.visible')
      .click();

    this.name.type(user);
    this.email.type(email);
    this.password.type(password);
    this.submit.click();

    this.username.should('have.text', user);
  }

  login(user: string, email: string, password: string): void {
    this.openModal();

    this.email.type(email);
    this.password.type(password);
    this.submit.click();

    this.username.should('have.text', user);
  }

  private openModal(): void {
    cy.get(this.loginBtn, { timeout: 15000 })
      .should('be.visible')
      .click();
  }

  private get email() {
    return cy.get(this.emailInput).should('be.visible');
  }

  private get name() {
    return cy.get(this.nameInput).should('be.visible');
  }

  private get password() {
    return cy.get(this.passwordInput).should('be.visible');
  }

  private get username() {
    return cy.get('[data-testid="navbar-username"]', { timeout: 15000 }).should('exists');
  }

  private get clear() {
    return cy.get(this.clearBtn).should('be.visible');
  }

  private get submit() {
    return cy.get(this.submitBtn).should('be.visible');
  }
}
