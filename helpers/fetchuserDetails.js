// const axios = require('axios');
// const jwtToken = require('jsonwebtoken')
// const { infoLogger, errorLogger } = require("../middleware/logger");
// const getUserDetails = require("../src/user/user");

// async function fetchUserDetails(authHeader , req , res) {

//   // Initialize variables to hold user details
//   let userName = "";
//   let userID = "";
//   let userEmail = "";
//   let roleName = "";

//   // const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer")) {
//     console.log("fetchUserDetails: Authorization header missing or malformed");
//     errorLogger.log("error", `Token ${authHeader || ''} is un-authorized as authorization header missing or malformed for api fetchUserDetails`);
//     if (res && res.status) return res.status(401).json({ error: 'Unauthorized' });
//     throw new Error('Unauthorized');
//   }

//   const token = authHeader.split(" ")[1];
//   console.log('fetchUserDetails: extracted token ->', token);

//   // Prefer fetching user details from MAIN backend profile endpoint if configured
//   if (process.env.MAIN_BE_URL) {
//     try {
//       const userFromMain = await getUserDetails(token, emp_email);
//         console.log('fetchUserDetails: raw response from main backend ->', userFromMain);

//         // Try to unwrap common response wrappers: { success, message, data }, { user }, { result }
//         let unwrapped = userFromMain;
//         if (userFromMain && typeof userFromMain === 'object') {
//           if (userFromMain.data) unwrapped = userFromMain.data;
//           if (unwrapped.user) unwrapped = unwrapped.user;
//           if (unwrapped.result) unwrapped = unwrapped.result;
//           // Some APIs return { user: {...} } nested deeper in 'data'
//           if (unwrapped.data && (unwrapped.data.user || unwrapped.data.result)) {
//             unwrapped = unwrapped.data.user || unwrapped.data.result || unwrapped.data;
//           }
//         }

//         console.log('fetchUserDetails: unwrapped user object ->', unwrapped);

//         // Map known fields if present
//         const mapped = {
//           userName: unwrapped?.emp_name || unwrapped?.name || unwrapped?.empName || unwrapped?.emp_name || unwrapped?.emp_name,
//           userID: unwrapped?.user_id || unwrapped?.id || unwrapped?.userId || unwrapped?.emp_id,
//           userEmail: unwrapped?.email_id || unwrapped?.email || unwrapped?.emailId,
//         };
//         console.log('fetchUserDetails: mapped user ->', mapped);
//         return mapped;
//     } catch (err) {
//       console.log('fetchUserDetails: MAIN_BE profile fetch failed, falling back to JWT verify ->', err.message);
//       errorLogger.log('error', `MAIN_BE profile fetch failed: ${err.message}`);
//       // continue to JWT verify fallback
//     }
//   }

//   let payload;
//   try {
//     payload = jwtToken.verify(token, process.env.ACCESS_SECRET_KEY);
//     console.log("fetchUserDetails: token payload ->", payload);
//   } catch (err) {
//     console.log('fetchUserDetails: token verification failed ->', err.message);
//     errorLogger.log("error", `Token verification failed: ${err.message}`);
//     if (res && res.status) return res.status(401).json({ error: 'Unauthorized' });
//     throw err;
//   }

//  // req.user = { verify_company_url: payload.verify_company_url, user_id: payload.user_id, role_name: payload.role_name, role_id: payload.role_id, email_id: payload.email_id, company_name: payload.company_name, emp_name: payload.emp_name };

//   // const instance = axios.create({httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) });
//   // const response = await instance.post(process.env.MAIN_BE_URL, { token: token })
//   // .then(response => {
//   //console.log('Fetched User Details and Company Details', response.data);
  
//   userName = payload.emp_name;
//   userID = payload.user_id;
//   userEmail = payload.email_id;
//   roleName = payload.role_name;

//   // })
//   // .catch(error => {
//   //  console.error('Error:', error);
//   // });

//   console.log("fetchUserDetails: userName ->", userName)
//   console.log("fetchUserDetails: userID ->", userID)
//   console.log("fetchUserDetails: userEmail ->", userEmail)
//   console.log("fetchUserDetails: roleName ->", roleName);

//   let userDetails = {
//     userName: userName,
//     userID: userID,
//     userEmail: userEmail
//   }

//   return userDetails;
// }

// module.exports = { fetchUserDetails }; 

const axios = require('axios');
const jwtToken = require('jsonwebtoken');
const { infoLogger, errorLogger } = require("../middleware/logger");
const getUserDetails = require("../src/user/user");

async function fetchUserDetails(authHeader, req, res) {

  let userName = "";
  let userID = "";
  let userEmail = "";
  let roleName = "";

  // Check Authorization Header
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    console.log("fetchUserDetails: Authorization header missing or malformed");

    errorLogger.log(
      "error",
      `Token ${authHeader || ''} is un-authorized as authorization header missing`
    );

    if (res && res.status)
      return res.status(401).json({ error: 'Unauthorized' });

    throw new Error('Unauthorized');
  }

  // Extract Token
  const token = authHeader.split(" ")[1];
  console.log('fetchUserDetails: extracted token ->', token);

  // Decode Token to get email
  let decoded;
  try {
    decoded = jwtToken.decode(token);
    console.log("fetchUserDetails: decoded token ->", decoded);
  } catch (error) {
    console.log("fetchUserDetails: token decode failed ->", error.message);
  }

  // Extract email from token
  const emp_email = decoded?.email_id;
  console.log("fetchUserDetails: extracted emp_email ->", emp_email);


  // ===============================
  // Call MAIN Backend
  // ===============================
  if (process.env.MAIN_BE_URL) {
    try {

      const userFromMain = await getUserDetails(token, emp_email);

      console.log('fetchUserDetails: raw response ->', userFromMain);

      // unwrap response
      let unwrapped = userFromMain;

      if (userFromMain && typeof userFromMain === 'object') {

        if (userFromMain.data)
          unwrapped = userFromMain.data;

        if (unwrapped.user)
          unwrapped = unwrapped.user;

        if (unwrapped.result)
          unwrapped = unwrapped.result;

        if (unwrapped.data && (unwrapped.data.user || unwrapped.data.result)) {
          unwrapped =
            unwrapped.data.user ||
            unwrapped.data.result ||
            unwrapped.data;
        }
      }

      console.log('fetchUserDetails: unwrapped ->', unwrapped);

      const mapped = {
        userName:
          unwrapped?.emp_name ||
          unwrapped?.name ||
          unwrapped?.empName,

        userID:
          unwrapped?.user_id ||
          unwrapped?.id ||
          unwrapped?.emp_id,

        userEmail:
          unwrapped?.email_id ||
          unwrapped?.email
      };

      console.log('fetchUserDetails: mapped user ->', mapped);

      return mapped;

    } catch (err) {

      console.log(
        'fetchUserDetails: MAIN_BE failed, fallback JWT ->',
        err.message
      );

      errorLogger.log(
        'error',
        `MAIN_BE profile fetch failed: ${err.message}`
      );
    }
  }


  // ===============================
  // JWT fallback
  // ===============================
  let payload;

  try {

    payload = jwtToken.verify(
      token,
      process.env.ACCESS_SECRET_KEY
    );

    console.log("fetchUserDetails: token payload ->", payload);

  } catch (err) {

    console.log(
      'fetchUserDetails: token verification failed ->',
      err.message
    );

    errorLogger.log(
      "error",
      `Token verification failed: ${err.message}`
    );

    if (res && res.status)
      return res.status(401).json({ error: 'Unauthorized' });

    throw err;
  }

  userName = payload.emp_name;
  userID = payload.user_id;
  userEmail = payload.email_id;
  roleName = payload.role_name;

  console.log("fetchUserDetails: userName ->", userName);
  console.log("fetchUserDetails: userID ->", userID);
  console.log("fetchUserDetails: userEmail ->", userEmail);
  console.log("fetchUserDetails: roleName ->", roleName);

  let userDetails = {
    userName,
    userID,
    userEmail
  };

  return userDetails;
}

module.exports = { fetchUserDetails };