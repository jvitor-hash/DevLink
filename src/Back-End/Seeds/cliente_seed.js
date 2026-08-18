import { QueryInterface } from "sequelize";

export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Clientes', [
            {
                name: 'João Silva',
                email: 'joao.silva@example.com',
                password: '123456',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Maria Santos',
                email: 'maria.santos@example.com',
                password: '123456',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Carlos Oliveira',
                email: 'carlos.oliveira@example.com',
                password: '123456',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Ana Costa',
                email: 'ana.costa@example.com',
                password: '123456',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Clientes', null, {});
    }
}