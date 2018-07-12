module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'tariff', {
        type: Sequelize.SMALLINT,
        allowNull: false,
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'tariff');
  },
};