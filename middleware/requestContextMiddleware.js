const { setRequestContext } = require("../utils/requestContext");
const { fetchUserDetails } = require("../helpers/fetchuserDetails");

const requestContextMiddleware = async (req, res, next) => {
  // Extract token from Authorization header if present
  const authHeader = req.headers.authorization || req.headers.Authorization || null;
  let token = null;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  // Default context
  const contextData = {
    token,
    userDetails: null,
  };

  // If token present, try to fetch user details and store in context
  if (token) {
    try {
      const userDetails = await fetchUserDetails(authHeader, req, res);
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