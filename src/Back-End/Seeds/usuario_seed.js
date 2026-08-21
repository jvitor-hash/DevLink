import { QueryInterface } from "sequelize";

export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Usuarios', [
            {
                name: 'João Silva',
                email: 'joao.silva@example.com',
                platforms: Sequelize.literal(`ARRAY[]::VARCHAR[]`), // Funciona somente para arrays vazios.
                password: '$2b$12$QdBS9wX.Obb/yCMh0MJRD.zcBh7iCL2noTraFQyzUR/hYr1/jjd5u',
                userType: 'cliente',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Maria Santos',
                email: 'maria.santos@example.com',
                platforms: Sequelize.literal(`ARRAY[]::VARCHAR[]`),
                password: '$2b$12$vsNbQWtbiHtQi7ndhKSSY.GHuxfM8goFOxUWwUSbRmYAsOg6sL0uW',
                userType: 'cliente',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Carlos Oliveira',
                email: 'carlos.oliveira@example.com',
                platforms: ['web', 'desktop'],
                password: '$2b$12$Bo7mFutPeTBiySqhYJsIueQnvvP3HVDXKPxwg.HpzEwqlkAsbZJWe',
                userType: 'programador',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Ana Costa',
                email: 'ana.costa@example.com',
                platforms: ['desktop', 'mobile'],
                password: '$2b$12$GYYRlO4nLQMCRPKAHEmmLeIR8jXvevRuNKDJ.ULkb3mpyuu3LZeU6',
                userType: 'programador',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Usuarios', null, {});
    }
}
