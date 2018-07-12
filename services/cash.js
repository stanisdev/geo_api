const config = require(process.env.CONFIG_PATH);

module.exports = {
  сalculatePaidAccountExpiration(amount) {
    const cost = config.cost_paid_account_per_day;
    const daysCount = Math.floor(amount / cost);
    
    return 86400000 * daysCount;
  }
};