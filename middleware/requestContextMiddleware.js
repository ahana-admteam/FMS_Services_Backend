const { setRequestContext } = require("../utils/requestContext");
const { fetchuserDetails } = require("../helpers/fetchuserDetails");
const jwt = require('jsonwebtoken');

const requestContextMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || null;
  let token = null;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  if (token) {
    const decoded = jwt.decode(token);
    console.log("===== TOKEN DEBUG =====");
    console.log("Raw token (first 20 chars):", token.slice(0, 20));
    console.log("Decoded payload:", JSON.stringify(decoded, null, 2));
    console.log("=======================");
  }
  // Default context
  const contextData = {
    token,
    userDetails: null,
  };

  if (token) {
    const decoded = jwt.decode(token);
    console.log("Token payload FMS received:", decoded);
    // If you see { sub, email_id } → RBAC token (wrong)
    // If you see { emp_id, emp_email, role_id } → main backend token (correct)
  }

  // If token present, try to fetch user details and store in context
  if (token) {
    try {
      const userDetails = await fetchUserDetails(token);
      contextData.userDetails = userDetails;
    } catch (err) {
      console.warn('requestContextMiddleware: failed to fetch user details:', err.message);
      // continue without blocking request
    }
  }

  console.log('Middleware Stored Data:', { token: token ? `${token.slice(0,8)}...` : null, userDetails: contextData.userDetails });

  setRequestContext(contextData, () => {
    next();
  });
};

module.exports = requestContextMiddleware;