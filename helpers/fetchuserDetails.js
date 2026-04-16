const axios = require("axios");
require("dotenv").config();

async function fetchUserDetails(token) {
  try {
    console.log("Token received in fetchUserDetails:", token); // ✅ log here

    const url = process.env.MAIN_BE_URL;

    const response = await axios.get(url, {
      headers: {
        authorization: `${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    console.log("Response received successfully"); // optional

    return response.data;

  } catch (error) {
    console.error(
      "Error fetching user details:",
      error?.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { fetchUserDetails };