require('dotenv').config();

module.exports = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  BOX_ID: (process.env.BOX_ID || '').trim(),
  BOX_NAME: (process.env.BOX_NAME || '').trim(),
  NODE_ENV: process.env.NODE_ENV || 'production',
};
