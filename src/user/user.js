const express = require("express");
const axios = require('axios');



// Function to make a POST request
// function getUserDetails(token) {
// console.log("entering into getUserDetails");
// console.log("token",token);

//     const url  = process.env.MAIN_BE_URL
//     console.log("URL",url);
    
    
//  return axios.post(url, {token : token})
//     .then(response => {
//       console.log('Data posted successfully:', response.data);
//       return response.data; // Return the response data
//     })
//     .catch(error => {
//       console.error('Error posting data:', error);
//       throw error; // Rethrow the error to be handled by the caller
//     });
// }

async function getUserDetails(token) {
  console.log("entering into getUserDetails");
  console.log("token", token);

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