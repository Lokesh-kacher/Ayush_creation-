const enquiriesHandler = require('./enquiries');

module.exports = (req, res) => {
  return enquiriesHandler(req, res);
};
