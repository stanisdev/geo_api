const bcrypt = require('bcrypt');
const randomString = require('randomstring');
const only = require('only');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [1, 50],
      },
    },
    email: {
      type: DataTypes.STRING(60),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
        len: [6, 60],
        async isUnique(email) {
          const user = await User.findOne({
            where: {
              email,
            },
            attributes: ['id'],
          });
          if (user instanceof Object) {
            throw new Error('Email already exists');
          }
          return true;
        },
      },
    },
    state: { // 0 - not activated, 1 - activated
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      validate: {
        isInt: true,
        max: 32767,
        min: -32768,
      },
    },
    tariff: { // 1 - free, 2 - paid
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
        max: 2,
      },
    },
    password: {
      type: DataTypes.CHAR(60),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    salt: {
      type: DataTypes.CHAR(10),
      validate: {
        len: 10,
      },
    },
  }, {});
  /**
   * Associations
   * 
   * @param {Object} models
   */
  User.associate = function(models) {
    User.hasMany(models.UserCash, {
      foreignKey: 'user_id',
    });
  };
  /**
   * Registr user
   * 
   * @param {Object} body 
   */
  User.register = async function(body) {
    const data = only(body, 'name email password tariff');
    let user;
    try {
      user = User.build(data);
      await user.validate();
    } catch (err) {
      return {
        ok: false,
        fields: sequelize.assembleErrorMessages(err),
        type: 'VALIDATION_ERROR',
      };
    }
    try {
      const {hash, salt} = await User.cryptPassword(body.password);
      await user.set({
        password: hash,
        salt,
      }).save();
    } catch (err) {
      return {
        ok: false,
        message: 'Error creating user, try again later',
        type: 'SERVER_ERROR',
      };
    }
    return {ok: true};
  };
  /**
   * Crypt password
   * 
   * @param {string} password 
   */
  User.cryptPassword = async function(password) {
    const salt = randomString.generate(10);
    const hash = await bcrypt.hash(password + salt, 10);
    return {hash, salt};
  };
  /**
   * Check password hash
   * 
   * @param {string} password 
   */
  User.prototype.checkPassword = function(password) {
    const data = password + this.salt;
    return bcrypt.compare(data, this.password);
  };
  /**
   * Determine free account
   */
  User.prototype.isFreeAccount = function() {
    return this.tariff === 1;
  }
  return User;
};