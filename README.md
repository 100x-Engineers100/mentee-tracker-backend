# Mentee Tracker Backend

This is the backend application for the Mentee Tracker, built with Node.js, Express.js, and Prisma. It provides a RESTful API for managing mentee data, attendance, check-in notes, and alerts.

## Technologies Used

*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
*   **Prisma**: A next-generation ORM for Node.js and TypeScript.
*   **PostgreSQL**: Relational database (used with Prisma).
*   **date-fns**: A modern JavaScript date utility library.
*   **axios**: Promise based HTTP client for the browser and node.js
*   **dotenv**: Loads environment variables from a `.env` file.
*   **cors**: Node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
*   **node-cron**: A tool for scheduling tasks in Node.js.

## Project Structure

*   `cron/`: Contains cron jobs for scheduled tasks.
    *   `attendanceCron.mjs`: Logic for fetching and processing attendance data.
*   `prisma/`: Contains Prisma schema and migrations.
    *   `migrations/`: Database migration files.
    *   `schema.prisma`: Defines the database schema (models, relations, etc.).
*   `.gitignore`: Specifies intentionally untracked files to ignore.
*   `index.mjs`: The main entry point of the backend application, defining API routes and starting the server.
*   `package.json`: Lists project dependencies and scripts.
*   `prisma.config.ts`: Prisma configuration file.

## API Endpoints

### Mentee Routes

*   `POST /mentees`: Create a new mentee.
*   `GET /mentees/count/batch6`: Get the count of mentees in batch 6.
*   `GET /mentees/count/checkins-due/6`: Get the count of mentees in batch 6 with check-ins due.
*   `GET /mentees`: Get a list of all mentees (with optional `limit` and `cohort_batch` query parameters).
*   `GET /mentees/:id`: Get a single mentee by ID.
*   `PUT /mentees/:id`: Update a mentee by ID.
*   `DELETE /mentees/:id`: Delete a mentee by ID.

### Attendance Routes

*   `POST /attendance`: Create a new attendance record.
*   `GET /attendance`: Get all attendance records.
*   `GET /attendance/:id`: Get a single attendance record by ID.
*   `PUT /attendance/:id`: Update an attendance record by ID.
*   `DELETE /attendance/:id`: Delete an attendance record by ID.

### CheckInNote Routes

*   `POST /checkin-notes`: Create a new check-in note. Requires `weekNumber`.
*   `GET /checkin-notes`: Get check-in notes (with optional `menteeId`, `weekNumber`, `cohortBatch` query parameters).
*   `GET /checkin-notes/:id`: Get a single check-in note by ID.
*   `PUT /checkin-notes/:id`: Update a check-in note by ID. Requires `weekNumber`.
*   `DELETE /checkin-notes/:id`: Delete a check-in note by ID.

### Alert Routes

*   `GET /api/alerts`: Get a list of active alerts with mentee details.

### User Routes

*   `POST /users`: Create or update weekly attendance report.
*   `GET /weekly-attendance`: Get all weekly attendance reports.

### CRON Trigger Endpoints

*   `POST /api/run-attendance-cron-manually`: Manually trigger the attendance cron job.
*   `POST /api/run-attendance-cron-from-nov7`: Manually trigger the attendance cron job from November 7th.

## Setup Instructions

To get the backend application running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd mentee-tracker/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or if you use bun
    bun install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the `backend/` directory based on `.env.example`.
    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/mentee_tracker"
    API_KEY="your_api_key"
    ORG_ID="your_org_id"
    VITE_API_BASE_URL="http://localhost:3000/api"
    ```
    *   `DATABASE_URL`: Connection string for your PostgreSQL database.
    *   `API_KEY`: API key for external services (e.g., attendance).
    *   `ORG_ID`: Organization ID for external services.
    *   `VITE_API_BASE_URL`: Base URL for the frontend to connect to this backend.

4.  **Setup Prisma and Database:**
    *   Ensure your PostgreSQL database is running.
    *   Apply Prisma migrations to create the database schema:
        ```bash
        npx prisma migrate dev --name init
        ```

5.  **Run the development server:**
    ```bash
    node index.mjs
    ```
    The backend server will typically run on `http://localhost:3000`.

## Running with Docker (Optional)

If you prefer to run the backend and database using Docker, you can use `docker-compose`.

1.  **Build and run the Docker containers:**
    ```bash
    docker-compose up --build
    ```

2.  **Apply Prisma migrations within the Docker container:**
    ```bash
    docker-compose exec backend npx prisma migrate dev --name init
    ```

## Cron Jobs

The backend includes scheduled tasks (cron jobs) for fetching and processing attendance data. These are configured using `node-cron`.

*   **Attendance Fetch**: Fetches attendance data from an external API at scheduled intervals.
