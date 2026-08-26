import { Op } from "sequelize";

export async function up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("Projetos", [
        {
            title: "Sistema de Gestão de Tarefas",
            category: "Produtividade",
            subCategory: "Gestão de projetos",
            problem:
                "Pequenas equipes têm dificuldade para organizar tarefas, acompanhar prazos e visualizar o progresso dos projetos em um único lugar.",
            audience: "Pequenas equipes e profissionais autônomos",
            platforms: ["Web", "Desktop"],
            language: "Python",
            internetAccess: true,
            adminPanel: "sim",
            authenticationSystem: "sim",
            paymentSystem: "nao",
            userSteps:
                "1. Criar uma conta; 2. Fazer login; 3. Criar um projeto; 4. Adicionar tarefas; 5. Definir responsáveis e prazos; 6. Acompanhar o progresso; 7. Concluir tarefas.",
            styling: "Interface moderna, limpa e responsiva, com tons de azul e branco.",
            inspiration: "Trello e Notion",
            hasLogo: false,
            deadline: new Date("2026-10-30T23:59:59"),
            minBudget: 3000.0,
            maxBudget: 7000.0,
            createdAt: now,
            updatedAt: now
        },
        {
            title: "Controle Financeiro Pessoal",
            category: "Finanças",
            subCategory: "Organização financeira",
            problem:
                "Muitas pessoas não conseguem acompanhar seus gastos mensais e identificar onde estão gastando mais dinheiro.",
            audience: "Pessoas que desejam organizar suas finanças pessoais",
            platforms: ["Web", "Mobile"],
            language: "Python",
            internetAccess: true,
            adminPanel: "sim",
            authenticationSystem: "sim",
            paymentSystem: "talvez",
            userSteps:
                "1. Criar uma conta; 2. Fazer login; 3. Cadastrar receitas; 4. Cadastrar despesas; 5. Categorizar transações; 6. Visualizar gráficos; 7. Acompanhar saldo e metas.",
            styling: "Visual minimalista, profissional e amigável, com verde como cor principal.",
            inspiration: "Mobills e Organizze",
            hasLogo: false,
            deadline: new Date("2026-11-15T23:59:59"),
            minBudget: 4000.0,
            maxBudget: 9000.0,
            createdAt: now,
            updatedAt: now
        },
        {
            title: "Plataforma de Agendamento para Profissionais",
            category: "Serviços",
            subCategory: "Agendamento",
            problem:
                "Profissionais autônomos perdem tempo organizando horários manualmente e podem acabar com conflitos de agenda.",
            audience: "Barbeiros, manicures, psicólogos, personal trainers e outros profissionais autônomos",
            platforms: ["Web", "Mobile"],
            language: "Python",
            internetAccess: true,
            adminPanel: "sim",
            authenticationSystem: "sim",
            paymentSystem: "sim",
            userSteps:
                "1. Criar uma conta profissional; 2. Configurar serviços e horários; 3. Compartilhar página de agendamento; 4. Cliente escolhe um serviço; 5. Cliente seleciona data e horário; 6. Confirmar agendamento; 7. Profissional acompanha sua agenda.",
            styling: "Interface elegante e responsiva, com bastante espaço em branco e cores suaves.",
            inspiration: "Calendly e Trinks",
            hasLogo: true,
            deadline: new Date("2026-12-01T23:59:59"),
            minBudget: 6000.0,
            maxBudget: 12000.0,
            createdAt: now,
            updatedAt: now
        },
        {
            title: "Catálogo Digital para Pequenos Negócios",
            category: "Comércio",
            subCategory: "Catálogo online",
            problem:
                "Pequenos comerciantes dependem de redes sociais e mensagens para apresentar seus produtos, dificultando a organização do catálogo e dos pedidos.",
            audience: "Pequenos comerciantes e empreendedores",
            platforms: ["Web", "Mobile"],
            language: "JavaScript",
            internetAccess: true,
            adminPanel: "sim",
            authenticationSystem: "sim",
            paymentSystem: "talvez",
            userSteps:
                "1. Criar uma conta; 2. Configurar a loja; 3. Cadastrar produtos; 4. Adicionar imagens e preços; 5. Publicar catálogo; 6. Cliente visualiza produtos; 7. Cliente entra em contato para realizar o pedido.",
            styling: "Design moderno, colorido e otimizado para dispositivos móveis.",
            inspiration: "Instagram Shopping e WhatsApp Business",
            hasLogo: false,
            deadline: new Date("2026-09-30T23:59:59"),
            minBudget: 2500.0,
            maxBudget: 6000.0,
            createdAt: now,
            updatedAt: now
        }
    ]);
}

export async function down(queryInterface) {
    await queryInterface.bulkDelete("Projetos", {
        title: {
            [Op.in]: [
                "Sistema de Gestão de Tarefas",
                "Controle Financeiro Pessoal",
                "Plataforma de Agendamento para Profissionais",
                "Catálogo Digital para Pequenos Negócios"
            ]
        }
    });
}