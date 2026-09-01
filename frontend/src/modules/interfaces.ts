// Usuario

export interface Usuario {
    id?: number
    name?: string
    email?: string
    platforms?: string[]
    description?: string
    userType?: string
}

export interface CreateUsuario {
    name: string
    email: string
    password: string
    platforms: string[]
    userType: string
}

export interface UpdateUsuario {
    name: string
    email: string
    password: string
    platforms: string[]
    userType: string
}

// Projetos

export enum SelectableOptions {
  YES   = 'sim',
  NO    = 'nao',
  MAYBE = 'talvez',
}

export interface Projeto {
  id: number
  title: string
  category: string
  subcategory: string
  problem: string
  audience: string
  platforms: string[]
  language: string
  internetAccess: boolean
  adminPanel: string
  authenticationSystem: SelectableOptions
  paymentSystem: SelectableOptions
  userSteps: string
  styling: string
  inspiration: string
  hasLogo: boolean
  deadline: Date
  minBudget: float
  maxBudget: float
}

export interface ProjetoShort {
  id: number
  title: string
  category: string
  subcategory: string
  problem: string
  audience: string
  platforms: string[]
  language: string
  userSteps: string
  deadline: Date
  minBudget: float
  maxBudget: float
}
