const express = require("express");
const axios = require('axios');



async function getUserDetails(token) {

  try {
    const url = process.env.MAIN_BE_URL || "http://localhost:5000/api/auth/user-details";

    const response = await axios.get(url, {
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    console.log("Data received successfully:", response.data);
    return response.data;

  } catch (error) {
    console.error("Error fetching user details:", error?.response?.data || error.message);
    throw error;
  }
}

module.exports = { getUserDetails };