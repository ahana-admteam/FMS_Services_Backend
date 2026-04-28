const jwt = require("jsonwebtoken");
require("dotenv").config();

async function fetchUserDetails(token) {
  try {
    console.log("Token received in fetchUserDetails:", token);

    // ✅ Remove axios entirely — decode JWT locally
    const cleanToken = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;

    const decoded = jwt.decode(cleanToken);

    if (!decoded) {
      throw new Error("Invalid token — could not decode");
    }

    console.log("Locally decoded token:", decoded);

    return {
      result: {
        emp_id: decoded.emp_id,
        email_id: decoded.email_id,
        user_id: decoded.sub
      }
    };

  } catch (error) {
    console.error("Error in fetchUserDetails:", error.message);
    throw error;
  }
}

module.exports = { fetchUserDetails };