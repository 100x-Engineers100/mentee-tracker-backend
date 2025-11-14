import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ATTENDANCE_START_DATE = new Date("2025-11-06T00:00:00.000Z");

// Function to get the start and end Unix timestamps for a given date
const getDayTimestamps = (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return {
    start: Math.floor(startOfDay.getTime() / 1000),
    end: Math.floor(endOfDay.getTime() / 1000),
  };
};

// Function to calculate the dates for the last two Fridays and Saturdays
const getLastTwoWeekendDates = () => {
  let searchDate = new Date(); // Start with today

  const dayOfWeek = searchDate.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday

  // If today is Friday or Saturday, adjust searchDate to the previous Sunday
  // to ensure we only look at past weeks.
  if (dayOfWeek === 5) {
    // Friday
    searchDate.setDate(searchDate.getDate() - 5); // Go back to last Sunday
  } else if (dayOfWeek === 6) {
    // Saturday
    searchDate.setDate(searchDate.getDate() - 6); // Go back to last Sunday
  }
  // If today is Sunday, Monday, Tuesday, Wednesday, or Thursday,
  // searchDate is already correctly set to look for previous weekends.

  const weekendDates = new Set();
  let daysChecked = 0;

  // We need 4 dates (2 Fridays, 2 Saturdays)
  // We'll check up to 21 days back to ensure we cover at least 3 full weeks
  // (current week + 2 previous weeks).
  while (weekendDates.size < 4 && daysChecked < 21) {
    // Increased daysChecked limit for safety
    const date = new Date(searchDate);
    date.setDate(searchDate.getDate() - daysChecked);
    const currentDayOfWeek = date.getDay();

    if (currentDayOfWeek === 5 || currentDayOfWeek === 6) {
      const dateString = date.toISOString().split("T")[0];
      weekendDates.add(dateString);
    }
    daysChecked++;
  }

  // Convert back to Date objects and sort in ascending order
  const sortedDates = Array.from(weekendDates)
    .map((dateString) => new Date(dateString))
    .sort((a, b) => a.getTime() - b.getTime());

  if (new Date() > ATTENDANCE_START_DATE) {
    return sortedDates.slice(-2); // Return the last two dates (one Friday, one Saturday)
  } else {
    return sortedDates.slice(-4); // Return the last four dates
  }
};

const fetchAttendance = async () => {
  const weekendDates = getLastTwoWeekendDates();
  const allAttendanceData = [];

  for (const date of weekendDates) {
    const { start, end } = getDayTimestamps(date);
    const apiUrl = `${process.env.API_BASE_URL}/report/csv?apikey=${process.env.API_KEY}\u0026response_type=1\u0026ORGID=${process.env.ORG_ID}\u0026report_type=55\u0026organization_id=${process.env.ORG_ID}\u0026start_time=${start}\u0026end_time=${end}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          apikey: process.env.API_KEY,
          ORGID: process.env.ORG_ID,
        },
      });

      if (response.data.code === 200) {
        allAttendanceData.push(...response.data.data);
      } else {
        console.error(
          `Error fetching attendance for ${date.toDateString()}:`,
          response.data.message
        );
      }
    } catch (error) {
      console.error(
        `Failed to fetch attendance for ${date.toDateString()}:`,
        error.message
      );
    }
  }
  return allAttendanceData;
};

// console.log(
//   "Test getLastTwoWeekendDates:",
//   getLastTwoWeekendDates().map((d) => d.toDateString())
// );

export { fetchAttendance };
