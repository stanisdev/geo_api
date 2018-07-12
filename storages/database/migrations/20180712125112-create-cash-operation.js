module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('СashOperations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cash_account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'UserCashes',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      is_increased: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('СashOperations');
  }
};