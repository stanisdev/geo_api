module.exports = (sequelize, DataTypes) => {
  const СashOperation = sequelize.define('СashOperation', {
    cash_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
    },
    is_increased: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {});
  /**
   * Associations
   * 
   * @param {Object} models
   */
  СashOperation.associate = function(models) {
    СashOperation.belongsTo(models.UserCash, {
      foreignKey: 'cash_account_id',
    });
  };
  return СashOperation;
};