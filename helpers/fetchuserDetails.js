const axios = require('axios');
require('dotenv').config();

// ─────────────────────────────────────────────
// Fetches logged-in user details from main backend
// Call this anywhere in FMS with the Bearer token
// ─────────────────────────────────────────────
async function fetchuserDetails(token) {
  console.log("entering into fetchuserDetails");
  console.log("token", token);

  try {
    const url = process.env.MAIN_BE_URL
    const response = await axios.get(url, {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    console.log("Data received successfully:", response.data);
    return response.data; // { status: 'success', result: { emp_id, emp_name, emp_email, designation, role_id } }

  } catch (error) {
    console.error(
      "Error fetching user details:",
      error?.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { fetchuserDetails };