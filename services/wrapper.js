/**
 * Перехватывает все ошибки, на случай если не задействуется
 * catch() внутри асинхронной функции
 */
module.exports = (func) => {
  return (req, res, next) => {
    Promise
      .resolve(func(req, res, next))
      .catch(next);
  };
};