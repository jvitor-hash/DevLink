import { LoginPage } from '../pom/loginPage';

describe('Teste de autenticacao de usuarios', () => {
  const loginPage = new LoginPage();

  it('Teste de limpar os campos dos formularios', () => {
    cy.visit('/');

    loginPage.clearInputs();
  });

  it('Teste de cadastro de um usuario', () => {
    cy.visit('/');

    loginPage.register("test", "test@example.com", "123456789");
  });

  it('Teste de login de um usuario', () => {
    cy.visit('/');

    loginPage.login("test", "test@example.com", "123456789");
  });
})
