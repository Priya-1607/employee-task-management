# Employee Task Management System

A full-stack MERN application where **Admins** manage employees and assign tasks, and **Employees** view and update their assigned tasks.

## Live Demo

| Service  | URL |
|----------|-----|
| Local Frontend | http://localhost:5173 |
| Local Backend API | http://localhost:5001/api |
| Docker Frontend | http://localhost:3000 |
| Docker Backend API | http://localhost:5001/api |
| Deployed Frontend | _Add deployed URL here_ |
| Deployed Backend API | _Add deployed URL here_ |

## Test Credentials

| Role     | Email               | Password     |
|----------|---------------------|--------------|
| Admin    | admin@taskflow.com  | admin123     |
| Employee | john@taskflow.com   | employee123  |

> To create the first admin account, register a user via `/register`.

## Tech Stack

- **Frontend:** React, Vite, React Router, Zustand, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Auth:** JWT + bcrypt
- **DevOps:** Docker, Docker Compose

## Features

- Register and login with role-based access
- Admin user management: create, update, delete employees
- Admin task management: create, assign, update, delete tasks
- Employee dashboard: view and update assigned tasks
- Task status tracking: Todo, In Progress, Completed

## Repository Structure

```
employee-task-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── server.js
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
├── postman/
│   └── Employee-Task-Management.postman_collection.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB (local or Atlas)

### Option 1: Run with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd employee-task-management
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Build and start all services:
   ```bash
   docker-compose up --build
   ```
4. Open the app:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5001/api`
   - Health check: `http://localhost:5001/api/health`

### Option 2: Run Locally Without Docker

#### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

- Frontend runs at: `http://localhost:5173`
- Backend runs at: `http://localhost:5001`

## Docker Configuration

- `backend/Dockerfile` builds the backend API image
- `frontend/Dockerfile` builds the frontend and serves it with Nginx
- `docker-compose.yml` orchestrates MongoDB, backend, and frontend

## Environment Variables

### Root `.env.example`

Copy this file to `.env` in the repository root for Docker Compose or local startup.

### Backend (`backend/.env.example`)

Copy to `backend/.env` for local backend development.

### Frontend (`frontend/.env.example`)

Copy to `frontend/.env` for local frontend development.

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST   | `/api/auth/register` | Public | Register user (first user becomes admin) |
| POST   | `/api/auth/login` | Public | Login |
| GET    | `/api/auth/me` | Auth | Get current user |
| GET    | `/api/employees` | Admin | List employees |
| POST   | `/api/employees` | Admin | Create employee |
| GET    | `/api/employees/:id` | Admin | Get employee |
| PUT    | `/api/employees/:id` | Admin | Update employee |
| DELETE | `/api/employees/:id` | Admin | Delete employee |
| GET    | `/api/tasks` | Admin | List all tasks |
| POST   | `/api/tasks` | Admin | Create task |
| GET    | `/api/tasks/:id` | Admin | Get task |
| PUT    | `/api/tasks/:id` | Admin | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET    | `/api/tasks/dashboard/stats` | Admin | Dashboard statistics |
| GET    | `/api/tasks/my` | Employee | Get assigned tasks |
| PATCH  | `/api/tasks/my/:id/status` | Employee | Update task status |

## Postman Collection

Import `postman/Employee-Task-Management.postman_collection.json` into Postman.

Suggested flow:
1. Register Admin
2. Create Employee
3. Create Task
4. Login as Employee
5. Get My Tasks
6. Update My Task Status

## Deployment

### Public Deployment

After deployment, replace the local URLs above with your hosted application links.

#### Backend Deployment

- Use Render, Railway, Heroku, or another Node.js host
- Set the root directory to `backend`
- Configure environment variables from `backend/.env.example`
- Use MongoDB Atlas for `MONGODB_URI`
- Add `CORS_ORIGIN` to allow your deployed frontend origin

Render-specific setup:
- Add `render.yaml` to the repo
- Create a Node web service on Render
- Set `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CORS_ORIGIN`

#### Frontend Deployment

- Use Vercel, Netlify, or similar
- Set the root directory to `frontend`
- Set build command: `npm run build`
- Set publish directory: `dist`
- Add env var: `VITE_API_URL=https://your-backend-url/api`
- Add `frontend/vercel.json` to support client-side routing on Vercel

## License

MIT
