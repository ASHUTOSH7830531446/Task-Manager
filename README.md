# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT
- **Frontend:** React, TypeScript, Vite, Vanilla CSS

## Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL database running

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables:
   - Rename `.env` (already created) and update `DATABASE_URL` with your PostgreSQL credentials.
4. Run Prisma migrations to set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Key Features
- **Authentication:** Secure signup and login with JWT.
- **Roles:** Admin and Member roles (Admins/Owners can create projects and tasks).
- **Project Management:** Create projects and add team members.
- **Task Tracking:** Create tasks, assign them to members, and update their status (TODO, IN_PROGRESS, DONE).
- **Responsive UI:** Modern design using Vanilla CSS.
