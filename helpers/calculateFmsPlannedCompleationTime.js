const express = require("express");
var MongoClient = require("mongodb").MongoClient;
const axios = require("axios");
//const moment = require('moment-timezone');
const { CurrentIST, addHrs, addDays, addDaysToADate, formatDateFromDateObjectToString, getCurrentDateInIST } = require("./convertGMTtoIST");
const moment = require("moment");
const { infoLogger, errorLogger } = require('../middleware/logger')

const calculateFmsPlannedCompletionTime = async (
  duration,
  durationType,
  working,
  endTime,
  type,
  answer,
  taskStartTime,
  plannedCompletionTime,
  plannedCompletionTimeIST,
  employeeList,
  typeOfShift
) => {
  try {

    console.log("employeeList", employeeList);
    console.log("typeOfShift" , typeOfShift);
    
    //Calculate Fms Planned Completion Time
    if (type == "TAThrs" && durationType == "hrs") {

      infoLogger.log("info", `hits calculateFmsPlannedCompletionTime`);

      if (working == "OUTSIDE") {

        let currentDateTimeFinal = moment
          .tz(taskStartTime, "Asia/Kolkata")
          .add(duration, "hours");

        plannedCompletionTime = currentDateTimeFinal.format(
          "YYYY-MM-DDTHH:mm:ssZ"
        );

        plannedCompletionTimeIST = plannedCompletionTime;

        let employeeId;

        if(typeOfShift === 'Individual'){
          employeeId = await fetchEmployeeShiftOnPlannedDate(
            plannedCompletionTimeIST,
            employeeList
          );

          return { plannedCompletionTimeIST, employeeId };

        }else{

          return plannedCompletionTimeIST ;
        }

      } else {

        try {

          const currentDateTimeFinal = moment
            .tz(taskStartTime, "Asia/Kolkata")
            .add(duration, "hours")
            .toDate();

          const plannedTimeDate = currentDateTimeFinal;

          const instanceWorkingShift = axios.create({ 
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) 
          });

          const response = await instanceWorkingShift.post(
            process.env.MAIN_BE_WORKING_SHIFT_URL_BY_DATE,
            {
              date: plannedTimeDate
            }
          );

          let shiftStartTimeStr = response.data.result[0].shiftStartTime;
          let shiftEndTimeStr = response.data.result[0].shiftEndTime;

          let shiftStartTime = new Date(
            moment.tz(shiftStartTimeStr, "Asia/Kolkata").format()
          );

          let shiftEndTime = new Date(
            moment.tz(shiftEndTimeStr, "Asia/Kolkata").format()
          );

          function calculateBalanceHours(plannedCompletionTime, shiftEndTime) {

            if (plannedCompletionTime > shiftEndTime) {

              let diffMillis =
                plannedCompletionTime.getTime() - shiftEndTime.getTime();

              let hours = Math.floor(diffMillis / (1000 * 60 * 60));
              let minutes = Math.floor(
                (diffMillis % (1000 * 60 * 60)) / (1000 * 60)
              );

              let nextDayCompletionTime = new Date(shiftStartTime);

              nextDayCompletionTime.setDate(
                nextDayCompletionTime.getDate() + 1
              );

              nextDayCompletionTime.setHours(
                nextDayCompletionTime.getHours() + hours
              );

              nextDayCompletionTime.setMinutes(
                nextDayCompletionTime.getMinutes() + minutes
              );

              plannedCompletionTimeIST = moment(nextDayCompletionTime)
                .tz("Asia/Kolkata")
                .format();

              return plannedCompletionTimeIST;

            } else {

              plannedCompletionTimeIST = moment(plannedCompletionTime)
                .tz("Asia/Kolkata")
                .format();

              return plannedCompletionTimeIST;
            }
          }

          let balanceTime = calculateBalanceHours(
            plannedTimeDate,
            shiftEndTime
          );

          plannedCompletionTimeIST = await validateHolidayforHRS(
            balanceTime
          );

        } catch (error) {

          errorLogger.log("error", error.message)
          return null;

        }
      }

    }

    return plannedCompletionTimeIST;

  } catch (error) {

    errorLogger.log("error", error.message)
    return null;
  }
};




async function validateHolidayforHRS(
  plannedCompletionTimeIST
) {

  try {

    const instanceHoliday = axios.create({ 
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) 
    });

    const responseHoliday = await instanceHoliday.post(
      process.env.MAIN_BE_HOLIDAY_NONWORKINGDAY_URL_STRING_DATE
    );

    return plannedCompletionTimeIST;

  } catch (error) {

    errorLogger.log("error", error.message)
    return plannedCompletionTimeIST;
  }
}


const fetchEmployeeShiftOnPlannedDate = async (
  plannedCompletionTimeIST,
  employeeList
) => {

  const onlyDate = new Date(plannedCompletionTimeIST);

  const plannedDateOnly = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata"
  }).format(onlyDate);

  const [day, month, year] = plannedDateOnly.split("/");

  const formatedDatePayload = `${year}-${month}-${day}`;

  const instanceWorkinShiftByDateUserId = axios.create({ 
    httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) 
  });

  const shiftResponse = await instanceWorkinShiftByDateUserId.post(
    process.env.MAIN_BE_WORKING_SHIFT_DATE_USERID,
    {
      date: formatedDatePayload,
      employeeids: employeeList
    }
  );

  const findEmployeeForPlannedTime = (plannedCompletionTimeIST, shiftResponse) => {

    const plannedTime = moment(plannedCompletionTimeIST);

    for (const shift of shiftResponse.data.result) {

      const shiftStart = moment(shift.shiftStartTime);
      const shiftEnd = moment(shift.shiftEndTime);

      if (plannedTime.isBetween(shiftStart, shiftEnd, null, "[)")) {

        return shift.employeeId;
      }
    }

    return null;
  };

  const employeeId = findEmployeeForPlannedTime(
    plannedCompletionTimeIST,
    shiftResponse
  );

  return employeeId;
}

module.exports = { calculateFmsPlannedCompletionTime };