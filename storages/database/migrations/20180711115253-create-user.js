module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(60),
        unique: true,
        allowNull: false,
      },
      state: {
        type: Sequelize.SMALLINT,
        defaultValue: 1, // 0 - not activated, 1 - free, 2 - paid
        allowNull: false,
      },
      password: {
        type: Sequelize.CHAR(60),
        allowNull: false,
      },
      salt: {
        type: Sequelize.CHAR(10),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};