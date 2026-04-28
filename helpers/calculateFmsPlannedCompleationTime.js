const moment = require("moment-timezone");

const calculateFmsPlannedCompletionTime = async (
  duration,
  durationType,
  working,
  endTime,
  type,
  answer,
  taskStartTime
) => {
  try {
    console.log("calculateFmsPlannedCompletionTime called with:", {
      duration, durationType, working, endTime, type, taskStartTime
    });

    const start = moment.tz(taskStartTime, "Asia/Kolkata");

    // ─── TAThrs ───────────────────────────────────────────────────────────────
    if (type === "TAThrs" && durationType === "hrs") {

      const planned = start.clone().add(parseFloat(duration), "hours");

      if (working === "OUTSIDE") {
        // ✅ OUTSIDE working hours — just add hrs straight, no shift check
        return planned.format("YYYY-MM-DDTHH:mm:ssZ");
      } else {
        // ✅ INSIDE working hours — if planned time exceeds shift end (6PM),
        // roll over remaining hours to next day from 9AM
        const shiftEndHour = 18;   // 6:00 PM
        const shiftStartHour = 9;  // 9:00 AM

        if (planned.hours() >= shiftEndHour) {
          const overflow = planned.hours() - shiftEndHour;
          const nextDay = start.clone()
            .add(1, "day")
            .hours(shiftStartHour)
            .minutes(planned.minutes())
            .seconds(0)
            .add(overflow, "hours");

          return nextDay.format("YYYY-MM-DDTHH:mm:ssZ");
        }

        return planned.format("YYYY-MM-DDTHH:mm:ssZ");
      }
    }

    // ─── TATdays ──────────────────────────────────────────────────────────────
    if (type === "TATdays" && durationType === "days") {
      // ✅ Add calendar days to start time
      const planned = start.clone().add(parseFloat(duration), "days");
      return planned.format("YYYY-MM-DDTHH:mm:ssZ");
    }

    // ─── T-X (date-based — answer is the start date from fmsQA) ──────────────
    if (type === "T-X") {
      if (!answer) {
        console.warn("T-X type requires answer (start date) but none provided");
        return null;
      }

      const baseDate = moment.tz(answer, "Asia/Kolkata");

      if (!baseDate.isValid()) {
        console.warn("T-X answer is not a valid date:", answer);
        return null;
      }

      if (durationType === "days") {
        return baseDate.clone().add(parseFloat(duration), "days").format("YYYY-MM-DDTHH:mm:ssZ");
      }

      if (durationType === "hrs") {
        return baseDate.clone().add(parseFloat(duration), "hours").format("YYYY-MM-DDTHH:mm:ssZ");
      }
    }

    // ─── Fallback ─────────────────────────────────────────────────────────────
    console.warn("Unhandled plannedDate type/durationType:", type, durationType);
    return null;

  } catch (error) {
    console.error("Error in calculateFmsPlannedCompletionTime:", error.message);
    return null;
  }
};

module.exports = { calculateFmsPlannedCompletionTime };