export class CreateProjetoDTO {
  constructor({ title, category, subcategory, problem, audience, platforms, language, 
                internetAccess, adminPanel, authenticationSystem, paymentSystem, userSteps, 
                styling, inspiration, hasLogo, deadline, minBudget, maxBudget 
            }) {
    this.title = title;
    this.category = category;
    this.subcategory = subcategory;
    this.problem = problem;
    this.audience = audience;
    this.platforms = platforms;
    this.language = language;
    this.internetAccess = internetAccess;
    this.adminPanel = adminPanel;
    this.authenticationSystem = authenticationSystem;
    this.paymentSystem = paymentSystem;
    this.userSteps = userSteps;
    this.styling = styling;
    this.inspiration = inspiration;
    this.hasLogo = hasLogo;
    this.deadline = deadline;
    this.minBudget = minBudget;
    this.maxBudget = maxBudget;
  }
}

export class ResponseShortProjetoDTO {
    constructor({ id, title, category, subcategory, problem, audience, platforms, language, userSteps, deadline, minBudget, maxBudget }) {
        this.id          = id;
        this.title       = title;
        this.category    = category;
        this.subcategory = subcategory;
        this.problem     = problem;
        this.audience    = audience;
        this.platforms   = platforms;
        this.language    = language;
        this.userSteps   = userSteps;
        this.deadline    = deadline;
        this.minBudget   = minBudget;
        this.maxBudget   = maxBudget;
    }
}

export class ResponseProjetoDTO {
  constructor({ id, title, category, subcategory, problem, audience, platforms, language, 
                internetAccess, adminPanel, authenticationSystem, paymentSystem, userSteps, 
                styling, inspiration, hasLogo, deadline, minBudget, maxBudget 
            }) {
    this.id                   = id;
    this.title                = title;
    this.category             = category;
    this.subcategory          = subcategory;
    this.problem              = problem;
    this.audience             = audience;
    this.platforms            = platforms;
    this.language             = language;
    this.internetAccess       = internetAccess;
    this.adminPanel           = adminPanel;
    this.authenticationSystem = authenticationSystem;
    this.paymentSystem        = paymentSystem;
    this.userSteps            = userSteps;
    this.styling              = styling;
    this.inspiration          = inspiration;
    this.hasLogo              = hasLogo;
    this.deadline             = deadline;
    this.minBudget            = minBudget;
    this.maxBudget            = maxBudget;
  }
}
