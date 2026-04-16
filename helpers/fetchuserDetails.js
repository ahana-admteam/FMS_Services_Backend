const axios = require("axios");
require("dotenv").config();

async function fetchuserDetails(token) {
  try {
    const url = process.env.MAIN_BE_URL;

    const response = await axios.get(url, {
      headers: {
        authorization: `Bearer ${token}`, // ✅ correct
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    return response.data;

  } catch (error) {
    console.error(
      "Error fetching user details:",
      error?.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { fetchuserDetails };