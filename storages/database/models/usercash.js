const config = require(process.env.CONFIG_PATH);
const services = require(config.services_path);
const cashService = services.cash;

module.exports = (sequelize, DataTypes) => {
  const UserCash = sequelize.define('UserCash', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    cash_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
    expired: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {});
  UserCash.associate = function(models) {
    UserCash.belongsTo(models.User, {
      foreignKey: 'user_id',
    });
    UserCash.hasMany(models.СashOperation, {
      foreignKey: 'cash_account_id',
    });
  };
  UserCash.deposit = async function(userId, amount) {
    const cash = await UserCash.findOne({
      where: {
        user_id: userId,
      },
    });
    const now = Date.now();
    const expired = cashService.сalculatePaidAccountExpiration(amount);
    if (!(cash instanceof Object)) { // Создать в первый раз
      return sequelize.transaction((t) => {
        return UserCash.create({ // Счет
          user_id: userId,
          cash_count: amount,
          expired: new Date(now + expired),
        }, {transaction: t}).then((cashAccount) => {
          return sequelize.models.СashOperation.create({ // Лог
            cash_account_id: cashAccount.get('id'),
            is_increased: true,
            amount,
          }, {transaction: t});
        });
      });
    }
    // Уеличить
    const increased = cash.get('cash_count') + amount;
    const date = new Date(cash.get('expired')).getTime();

    // Если дата истечения пользования аккаунтом больше, чем текущая дата,
    // то прибавить к ней expired. Если меньше, то прибавить expired к текущей. 
    const expiredDate = (date > now ? date : now) + expired; 
    
    return sequelize.transaction((t) => {
      return cash.set({
        cash_count: increased,
        expired: new Date(expiredDate),
      }).save({transaction: t})
        .then(() => {
          return sequelize.models.СashOperation.create({ // Лог
            cash_account_id: cash.get('id'),
            is_increased: true,
            amount,
          }, {transaction: t});
        });
    });
  };
  return UserCash;
};