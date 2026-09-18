import { QuestionnairePage } from '../pom/questionnairePage';

describe('Teste do questionario de criação de projetos', () => {
  const questionnairePage = new QuestionnairePage();

  beforeEach(() => {
    // Keeps the two tests independent: the draft persistence would
    // otherwise leak filled fields from the success test into the
    // fail-state test.
    cy.clearLocalStorage();
  });

  it('Teste de estado de falha: nao avanca com campos obrigatorios vazios', () => {
    questionnairePage.visit();

    questionnairePage.assertBlockedOnEmptyStep();
  });

  it('Teste de estado de passagem: preenche todas as etapas e publica o projeto', () => {
    questionnairePage.visit();

    questionnairePage.fillAndSubmitSuccessfully();
  });
})
