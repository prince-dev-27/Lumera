const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a given user ID and role
 * @param {string} id - User ID
 * @param {string} role - User Role (customer/admin)
 * @returns {string} - JWT Token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'lumera_jwt_secret_dev_key_12345',
    {
      expiresIn: '30d'
    }
  );
};

module.exports = generateToken;
