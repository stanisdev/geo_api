const app = require(process.env.APP_FILE_PATH);

module.exports = () => {
  /**
   * 404
   */
  app.use((req, res, next) => {
    res.json({
      success: false,
      message: 'Not found',
    });
  });

  /**
   * Server error handler
   */
  app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(err.status || 500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  });
};