# Primetrade.ai Backend Assignment

This repository contains the backend and frontend for the Primetrade.ai Backend Developer Intern assignment.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, Prisma (SQLite), JWT, bcryptjs, Swagger.
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, Axios.

## Features
- **User Authentication:** Registration & login with JWT authentication and password hashing.
- **Role-Based Access:** Users can manage their tasks. Admins can view all tasks across the platform.
- **Task Management (CRUD):** Users can create, read, update, and delete their tasks.
- **Validation & Error Handling:** Proper input validation using `express-validator` and custom error responses.
- **API Documentation:** Swagger UI is available at `/api-docs`.

## Getting Started

### 1. Setup the Backend
```bash
cd backend
npm install
npx prisma db push
npx prisma generate
npm run dev
```
The backend will run on `http://localhost:3000`.

### 2. Setup the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Scalability Note
To scale this application for production use:
1. **Database:** Migrate from SQLite to a robust database like PostgreSQL or MongoDB. Implement connection pooling (e.g., using Prisma Accelerate or pgBouncer).
2. **Caching:** Introduce Redis to cache frequently accessed data (like tasks or user profiles) to reduce database load.
3. **Microservices architecture:** As the app grows, modules (e.g., Auth, Tasks, Notifications) can be split into microservices communicating via message brokers (RabbitMQ or Kafka).
4. **Load Balancing & Deployment:** Dockerize the backend and frontend. Use Kubernetes for container orchestration and an API Gateway (like NGINX or AWS API Gateway) to load balance requests across multiple backend instances.
5. **Horizontal Scaling:** Ensure the backend remains stateless (JWT helps with this) so multiple server instances can easily scale horizontally.

## API Documentation
Once the backend is running, visit `http://localhost:3000/api-docs` to view the Swagger API documentation.
