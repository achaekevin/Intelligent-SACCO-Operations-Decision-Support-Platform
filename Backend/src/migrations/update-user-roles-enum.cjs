'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change the role ENUM to only include the 5 core roles
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('sacco_admin', 'loan_officer', 'cashier', 'auditor', 'member') 
      NOT NULL;
    `);

    // Update organizationId to be NOT NULL (except for any existing null values)
    // First, set any null organizationIds to a valid one (optional, only if needed)
    // await queryInterface.sequelize.query(`
    //   UPDATE users SET organizationId = (SELECT id FROM organizations LIMIT 1) WHERE organizationId IS NULL AND role != 'super_admin';
    // `);

    console.log('✅ User roles ENUM updated successfully');
  },

  async down(queryInterface, Sequelize) {
    // Revert back to the old ENUM with all roles
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('super_admin', 'sacco_admin', 'branch_manager', 'loan_officer', 'accountant', 'cashier', 'auditor', 'member') 
      NOT NULL;
    `);

    console.log('✅ User roles ENUM reverted successfully');
  }
};
