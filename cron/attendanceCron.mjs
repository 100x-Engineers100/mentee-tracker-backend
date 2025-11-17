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
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  let lastSunday = new Date(today);
  if (dayOfWeek === 0) {
    // If today is Sunday
    lastSunday.setDate(today.getDate());
  } else {
    lastSunday.setDate(today.getDate() - dayOfWeek); // Go back to the most recent past Sunday
  }

  // Calculate Friday and Saturday of the last full week
  const lastWeekFriday = new Date(lastSunday);
  lastWeekFriday.setDate(lastSunday.getDate() - 2);

  const lastWeekSaturday = new Date(lastSunday);
  lastWeekSaturday.setDate(lastSunday.getDate() - 1);

  // Calculate the Sunday of the week before the last full week
  const secondLastSunday = new Date(lastSunday);
  secondLastSunday.setDate(lastSunday.getDate() - 7);

  // Calculate Friday and Saturday of the second to last full week
  const secondLastWeekFriday = new Date(secondLastSunday);
  secondLastWeekFriday.setDate(secondLastSunday.getDate() - 2);

  const secondLastWeekSaturday = new Date(secondLastSunday);
  secondLastWeekSaturday.setDate(secondLastSunday.getDate() - 1);

  // Return all four dates in ascending order
  return [
    secondLastWeekFriday,
    secondLastWeekSaturday,
    lastWeekFriday,
    lastWeekSaturday,
  ].sort((a, b) => a.getTime() - b.getTime());
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
        const filteredData = response.data.data.filter(record => 
          record.batchName && record.batchName.includes("Cohort 6")
        );
        allAttendanceData.push(...filteredData);
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

console.log(
  "Test getLastTwoWeekendDates:",
  getLastTwoWeekendDates().map((d) => d.toDateString())
);

export { fetchAttendance };
