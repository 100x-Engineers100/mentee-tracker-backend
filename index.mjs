import {
  subWeeks,
  isAfter,
  parseISO,
  getWeek,
  addWeeks,
  startOfWeek,
} from "date-fns";
import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import { fetchAttendance } from "./cron/attendanceCron.mjs";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const corsOptions = {
  origin: [
    "https://mentee-tracker-frontend.vercel.app",
    "http://localhost:8080",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello from Mentee Tracker Backend!");
});

// Mentee Routes
app.post("/mentees", async (req, res) => {
  try {
    const mentee = await prisma.mentee.create({ data: req.body });
    res.status(201).json(mentee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/mentees/count/batch6", async (req, res) => {
  try {
    const totalMenteesBatch6 = await prisma.mentee.count({
      where: {
        cohortBatch: "6",
      },
    });
    res.json({ count: totalMenteesBatch6 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/mentees/count/checkins-due/6", async (req, res) => {
  try {
    const checkInsDueMentees = await prisma.mentee.count({
      where: {
        status: {
          notIn: ["Completed", "Archived"],
        },
        cohortBatch: "6",
      },
    });
    res.json({ count: checkInsDueMentees });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/mentees", async (req, res) => {
  try {
    const { limit, cohort_batch } = req.query;
    const parsedLimit = limit ? parseInt(limit, 10) : 1000;
    const whereClause = cohort_batch
      ? { cohortBatch: String(cohort_batch) }
      : {};
    const mentees = await prisma.mentee.findMany({
      take: parsedLimit,
      where: whereClause,
    });
    res.json(mentees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/mentees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const mentee = await prisma.mentee.findUnique({ where: { id } });
    if (mentee) {
      res.json(mentee);
    } else {
      res.status(404).json({ message: "Mentee not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/mentees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, poc } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (poc) updateData.poc = poc;

    const mentee = await prisma.mentee.update({
      where: { id },
      data: updateData,
    });
    res.json(mentee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/mentees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.mentee.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Attendance Routes
app.post("/attendance", async (req, res) => {
  try {
    const attendance = await prisma.attendance.create({ data: req.body });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/attendance", async (req, res) => {
  try {
    const attendanceRecords = await prisma.attendance.findMany();
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/attendance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await prisma.attendance.findUnique({ where: { id } });
    if (attendance) {
      res.json(attendance);
    } else {
      res.status(404).json({ message: "Attendance record not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/attendance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await prisma.attendance.update({
      where: { id },
      data: req.body,
    });
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/attendance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.attendance.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CheckInNote Routes
app.post("/checkin-notes", async (req, res) => {
  try {
    const checkInNote = await prisma.checkInNote.create({ data: req.body });
    res.status(201).json(checkInNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/checkin-notes", async (req, res) => {
  try {
    const { menteeId } = req.query;
    const checkInNotes = await prisma.checkInNote.findMany({
      where: menteeId ? { menteeId: String(menteeId) } : {},
    });
    res.json(checkInNotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/checkin-notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const checkInNote = await prisma.checkInNote.findUnique({ where: { id } });
    if (checkInNote) {
      res.json(checkInNote);
    } else {
      res.status(404).json({ message: "Check-in note not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/checkin-notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const checkInNote = await prisma.checkInNote.update({
      where: { id },
      data: req.body,
    });
    res.json(checkInNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/checkin-notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.checkInNote.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Routes
app.post("/users", async (req, res) => {
  try {
    const { weekNumber, cohortBatch, totalMentees, totalPresent, totalAbsent } =
      req.body;
    const attendanceReport = await prisma.weeklyAttendanceReport.upsert({
      where: { weekNumber_cohortBatch: { weekNumber, cohortBatch } },
      update: { totalMentees, totalPresent, totalAbsent },
      create: {
        weekNumber,
        cohortBatch,
        totalMentees,
        totalPresent,
        totalAbsent,
      },
    });
    res.status(201).json(attendanceReport);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/weekly-attendance", async (req, res) => {
  try {
    const attendanceReports = await prisma.weeklyAttendanceReport.findMany();
    res.json(attendanceReports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual CRON Trigger Endpoint
app.post("/api/run-attendance-cron-manually", async (req, res) => {
  try {
    const attendanceData = await fetchAttendance();
    const externalMenteeIdsInAttendance = [
      ...new Set(attendanceData.map((record) => String(record.student_Id))),
    ];

    const existingMentees = await prisma.mentee.findMany({
      where: {
        externalId: {
          in: externalMenteeIdsInAttendance,
        },
      },
      select: {
        id: true,
        externalId: true,
      },
    });

    const menteeMap = new Map(
      existingMentees.map((mentee) => [mentee.externalId, mentee.id])
    );

    const formattedAttendanceData = attendanceData
      .filter((record) => menteeMap.has(String(record.student_Id)))
      .map((record) => ({
        menteeId: menteeMap.get(String(record.student_Id)),
        sessionDate: (() => {
          if (record.classDate) {
            const parts = record.classDate.match(
              /(\d{1,2})\s([A-Za-z]{3})\s(\d{4})/
            );
            if (parts) {
              const [_, day, monthStr, year] = parts;
              const monthMap = {
                Jan: 0,
                Feb: 1,
                Mar: 2,
                Apr: 3,
                May: 4,
                Jun: 5,
                Jul: 6,
                Aug: 7,
                Sep: 8,
                Oct: 9,
                Nov: 10,
                Dec: 11,
              };
              const month = monthMap[monthStr];
              if (month !== undefined) {
                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                  return date;
                }
              }
            }
          }
          return null;
        })(),
        sessionType: record.sessionName,
        isPresent: record.studentAttendanceStatus === "P",
      }));

    await prisma.attendance.createMany({
      data: formattedAttendanceData,
      skipDuplicates: true,
    });

    // After creating attendance records, update mentee priorities and last attendance
    for (const menteeId of externalMenteeIdsInAttendance) {
      const mentee = await prisma.mentee.findUnique({
        where: { externalId: menteeId },
        include: { attendances: true },
      });

      if (mentee) {
        const twoWeeksAgo = subWeeks(new Date(), 2);
        const recentAttendances = mentee.attendances.filter((att) =>
          isAfter(att.sessionDate, twoWeeksAgo)
        );

        const lastSessions = recentAttendances
          .sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime())
          .slice(0, 4);

        const presentCount = lastSessions.filter((att) => att.isPresent).length;
        const absentCount = lastSessions.length - presentCount;

        let priority = "P4"; // Default to P4 (present for last 4 sessions)

        if (lastSessions.length >= 4) {
          // If 4 or more sessions are available
          if (absentCount === 4) {
            priority = "P0";
          } else if (absentCount === 3) {
            priority = "P1";
          } else if (absentCount === 2) {
            priority = "P2";
          } else if (absentCount === 1) {
            priority = "P3";
          } else {
            // absentCount === 0
            priority = "P4";
          }
        } else if (lastSessions.length === 2) {
          // If exactly 2 sessions are available
          if (absentCount === 2) {
            // Absent for 2 times from last 2 sessions
            priority = "P0";
          } else if (absentCount === 1) {
            // Absent for 1 time from last 2 sessions
            priority = "P1";
          } else {
            // absentCount === 0, Present for 2 times from last 2 sessions
            priority = "P2";
          }
        } else {
          // For cases with 0, 1, or 3 sessions, or more than 4, we can define a default or more granular logic.
          // The user specified P4 for 0 absences in last 4 sessions, and P2 for 0 absences in last 2 sessions.
          // Let's assume P4 is the general default for "good" attendance if specific rules don't apply.
          if (absentCount === 0) {
            priority = "P4"; // Present for all available sessions
          } else if (absentCount === lastSessions.length) {
            priority = "P0"; // Absent for all available sessions
          } else {
            priority = "P3"; // Default for mixed attendance not covered by specific rules
          }
        }

        const lastAttendance = recentAttendances.reduce((latest, current) => {
          return latest.sessionDate > current.sessionDate ? latest : current;
        }, recentAttendances[0]);

        await prisma.mentee.update({
          where: { id: mentee.id },
          data: {
            priority: priority,
            lastAttendance: lastAttendance ? lastAttendance.sessionDate : null,
            status: "In Progress",
          },
        });
      }
    }
    // console.log("Attendance data saved to database successfully.");

    // Trigger weekly attendance report generation
    await axios.post(`${process.env.BACKEND_URL}/api/weekly-attendance-report`);

    res.status(200).json({
      message: "Manual attendance fetch and save completed successfully.",
    });
  } catch (error) {
    console.error("Manual attendance fetch failed:", error);
    res.status(500).json({ error: "Failed to manually fetch attendance." });
  }
});

// New endpoint for syncing mentees
app.post("/api/sync-mentees", async (req, res) => {
  try {
    // Fetch mentees from external API
    const externalApiResponse = await axios.get(
      `${process.env.API_BASE_URL}/organization/students?per_page=2000`, // Fetch a large number to ensure all are covered
      {
        headers: {
          apikey: process.env.API_KEY,
          ORGID: process.env.ORG_ID,
        },
      }
    );

    if (externalApiResponse.data.code !== 200) {
      throw new Error(
        externalApiResponse.data.message || "Failed to fetch external mentees."
      );
    }

    const externalMentees = externalApiResponse.data.students;
    const externalMenteeIds = externalMentees.map((mentee) =>
      String(mentee.user_id)
    );

    // Find existing mentees in our database
    const existingMentees = await prisma.mentee.findMany({
      where: {
        externalId: {
          in: externalMenteeIds,
        },
      },
      select: {
        externalId: true,
      },
    });

    const existingExternalIds = new Set(
      existingMentees.map((mentee) => mentee.externalId)
    );

    // Identify mentees to create
    const menteesToCreate = externalMentees.filter(
      (mentee) => !existingExternalIds.has(String(mentee.user_id))
    );

    if (menteesToCreate.length > 0) {
      const newMenteesData = menteesToCreate.map((mentee) => ({
        externalId: String(mentee.user_id),
        name: mentee.name || `Mentee ${mentee.user_id}`,
        email: mentee.email || `mentee${mentee.user_id}@example.com`,
        phone: mentee.contact_number || null,
        status: "active", // Default status
      }));

      await prisma.mentee.createMany({
        data: newMenteesData,
        skipDuplicates: true,
      });
    }

    res.status(200).json({
      message: "Mentee synchronization completed successfully.",
      createdCount: menteesToCreate.length,
    });
  } catch (error) {
    console.error("Mentee synchronization failed:", error);
    res.status(500).json({ error: "Failed to synchronize mentees." });
  }
});

app.get("/api/weekly-attendance-report", async (req, res) => {
  try {
    const { batch } = req.query;

    if (!batch) {
      return res.status(400).json({ error: "Cohort batch is required." });
    }

    const reports = await prisma.weeklyAttendanceReport.findMany({
      where: {
        cohortBatch: String(batch),
      },
      orderBy: {
        weekNumber: "asc",
      },
    });

    res.status(200).json({
      message: "Weekly attendance reports fetched successfully.",
      reports: reports,
    });
  } catch (error) {
    console.error("Failed to fetch weekly attendance reports:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch weekly attendance reports." });
  }
});

// New endpoint for generating weekly attendance report
app.post("/api/weekly-attendance-report", async (req, res) => {
  try {
    const cohortBatch = "6"; // For now, hardcode to cohort_batch '6'
    const startDate = new Date("2025-11-06T00:00:00.000Z"); // Start from 7 Nov 2025
    const endDate = new Date(); // Today's date

    let currentWeek = startOfWeek(startDate, { weekStartsOn: 1 }); // Start of the week for startDate (Monday)
    const reports = [];

    while (currentWeek <= endDate) {
      const weekNumber = getWeek(currentWeek);

      // Fetch all mentees for the specified cohort batch
      const menteesInCohort = await prisma.mentee.findMany({
        where: {
          cohortBatch: cohortBatch,
        },
        include: {
          attendances: true, // Include attendance records
        },
      });

      let totalMentees = menteesInCohort.length;
      let totalPresent = 0;
      let totalAbsent = 0;

      for (const mentee of menteesInCohort) {
        // Filter attendance for the current week
        const weeklyAttendances = mentee.attendances.filter(
          (att) =>
            getWeek(att.sessionDate) === weekNumber &&
            new Date(att.sessionDate) >= startDate
        );

        if (weeklyAttendances.length > 0) {
          const isPresent = weeklyAttendances.some((att) => att.isPresent);
          if (isPresent) {
            totalPresent++;
          } else {
            totalAbsent++;
          }
        } else {
          totalAbsent++;
        }
      }

      const reportData = {
        weekNumber: weekNumber,
        cohortBatch: cohortBatch,
        totalMentees: totalMentees,
        totalPresent: totalPresent,
        totalAbsent: totalAbsent,
      };
      reports.push(reportData);

      // Save the report to the database
      await prisma.weeklyAttendanceReport.upsert({
        where: {
          weekNumber_cohortBatch: {
            weekNumber: reportData.weekNumber,
            cohortBatch: reportData.cohortBatch,
          },
        },
        create: reportData,
        update: reportData,
      });

      currentWeek = addWeeks(currentWeek, 1); // Move to the next week
    }
    res.status(200).json({
      message: "Weekly attendance reports generated successfully.",
      reports: reports,
    });
  } catch (error) {
    console.error("Failed to generate weekly attendance reports:", error);
    res
      .status(500)
      .json({ error: "Failed to generate weekly attendance reports." });
  }
});

cron.schedule("0 3 * * 1", async () => {
  console.log("Running attendance fetch CRON job...");
  try {
    const attendanceData = await fetchAttendance();

    const externalMenteeIdsInAttendance = [
      ...new Set(attendanceData.map((record) => String(record.student_Id))),
    ];

    const existingMentees = await prisma.mentee.findMany({
      where: {
        externalId: {
          in: externalMenteeIdsInAttendance,
        },
      },
      select: {
        id: true,
        externalId: true,
      },
    });

    const menteeMap = new Map(
      existingMentees.map((mentee) => [mentee.externalId, mentee.id])
    );

    const formattedAttendanceData = attendanceData
      .filter((record) => menteeMap.has(String(record.student_Id)))
      .map((record) => ({
        menteeId: menteeMap.get(String(record.student_Id)),
        sessionDate: (() => {
          if (record.classDate) {
            const parts = record.classDate.match(
              /(\d{1,2})\s([A-Za-z]{3})\s(\d{4})/
            );
            if (parts) {
              const [_, day, monthStr, year] = parts;
              const monthMap = {
                Jan: 0,
                Feb: 1,
                Mar: 2,
                Apr: 3,
                May: 4,
                Jun: 5,
                Jul: 6,
                Aug: 7,
                Sep: 8,
                Oct: 9,
                Nov: 10,
                Dec: 11,
              };
              const month = monthMap[monthStr];
              if (month !== undefined) {
                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                  return date;
                }
              }
            }
          }
          return null;
        })(),
        sessionType: record.sessionName,
        isPresent: record.studentAttendanceStatus === "P",
      }));

    await prisma.attendance.createMany({
      data: formattedAttendanceData,
      skipDuplicates: true,
    });

    // After creating attendance records, update mentee priorities and last attendance
    for (const menteeId of externalMenteeIdsInAttendance) {
      const mentee = await prisma.mentee.findUnique({
        where: { externalId: menteeId },
        include: { attendances: true },
      });

      if (mentee) {
        const twoWeeksAgo = subWeeks(new Date(), 2);
        const recentAttendances = mentee.attendances.filter((att) =>
          isAfter(att.sessionDate, twoWeeksAgo)
        );

        const lastSessions = recentAttendances
          .sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime())
          .slice(0, 4); // Consider up to the last 4 sessions

        const presentCount = lastSessions.filter((att) => att.isPresent).length;
        const absentCount = lastSessions.length - presentCount;

        let priority = "P4"; // Default to P4 (present for last 4 sessions)

        if (lastSessions.length >= 4) {
          // If 4 or more sessions are available
          if (absentCount === 4) {
            priority = "P0";
          } else if (absentCount === 3) {
            priority = "P1";
          } else if (absentCount === 2) {
            priority = "P2";
          } else if (absentCount === 1) {
            priority = "P3";
          } else {
            // absentCount === 0
            priority = "P4";
          }
        } else if (lastSessions.length === 2) {
          // If exactly 2 sessions are available
          if (absentCount === 2) {
            // Absent for 2 times from last 2 sessions
            priority = "P0";
          } else if (absentCount === 1) {
            // Absent for 1 time from last 2 sessions
            priority = "P1";
          } else {
            // absentCount === 0, Present for 2 times from last 2 sessions
            priority = "P2";
          }
        } else {
          // For cases with 0, 1, or 3 sessions, or more than 4, we can define a default or more granular logic.
          // The user specified P4 for 0 absences in last 4 sessions, and P2 for 0 absences in last 2 sessions.
          // Let's assume P4 is the general default for "good" attendance if specific rules don't apply.
          if (absentCount === 0) {
            priority = "P4"; // Present for all available sessions
          } else if (absentCount === lastSessions.length) {
            priority = "P0"; // Absent for all available sessions
          } else {
            priority = "P3"; // Default for mixed attendance not covered by specific rules
          }
        }

        const lastAttendance = recentAttendances.reduce((latest, current) => {
          return latest.sessionDate > current.sessionDate ? latest : current;
        }, recentAttendances[0]);

        await prisma.mentee.update({
          where: { id: mentee.id },
          data: {
            priority: priority,
            lastAttendance: lastAttendance ? lastAttendance.sessionDate : null,
            status: "In Progress",
          },
        });
      }
    }

    // Trigger weekly attendance report generation
    await axios.post(`${process.env.BACKEND_URL}/api/weekly-attendance-report`);
  } catch (error) {
    console.error("CRON job failed to fetch attendance:", error);
  }
});

app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
});

// External Mentee API Route
app.get("/api/external-mentees", async (req, res) => {
  try {
    const { per_page = 10 } = req.query;
    const response = await axios.get(
      `${process.env.API_BASE_URL}/organization/students?per_page=${per_page}`,
      {
        headers: {
          apikey: process.env.API_KEY,
          ORGID: process.env.ORG_ID,
        },
      }
    );
    if (response.data.code === 200) {
      res.json(response.data.students);
    } else {
      res.status(response.data.code || 500).json(response.data);
    }
  } catch (error) {
    console.error("Error fetching external mentees:", error.message);
    res.status(500).json({ error: "Failed to fetch external mentee data" });
  }
});
