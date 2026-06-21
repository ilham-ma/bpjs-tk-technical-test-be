# BPJS TK Technical Test - Backend

Backend service for the BPJS Ketenagakerjaan Technical Test. This project provides a REST API for managing user data (job application profile).

## Tech Stack

| Category   | Technology                      |
| ---------- | ------------------------------- |
| Runtime    | Node.js (ESM)                   |
| Language   | TypeScript                      |
| Framework  | Express.js 5                    |
| Database   | MySQL                           |
| ORM        | Prisma 7 (with MariaDB adapter) |
| Validation | express-validator               |
| Security   | Helmet, CORS                    |
| Logging    | Morgan                          |
| Testing    | Vitest                          |
| Dev Runner | tsx                             |

## Architecture

The project follows a **Domain-Driven Design (DDD)** approach with a **Module-First** organization — each layer is grouped by its domain module.

```
src/
├── domain/<module>/          # Entities & repository interfaces (pure, no dependencies)
├── application/<module>/     # DTOs & services (business logic)
├── infrastructure/
│   ├── database/prisma/      # Prisma client
│   ├── middlewares/          # Shared middleware (error handler, etc.)
│   └── modules/<module>/     # Controllers, repository impls, routes, validators
├── shared/errors/            # AppError, ValidationError
├── config/                   # App & database config (loaded from .env)
└── main.ts                   # Express entry point
```

## Prerequisites

- Node.js >= 20
- MySQL / MariaDB up and running
- npm

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd Backend
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env`, then fill it with your local configuration:

```bash
cp .env.example .env
```

`.env` contents:

```env
DATABASE_URL="mysql://{username}:{password}@{host}:{port}/{database}"
PORT=3000
NODE_ENV=development
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=
```

### 3. Setup Database (Prisma)

Generate the Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

(Optional) Open Prisma Studio to inspect the data:

```bash
npm run prisma:studio
```

### 4. Run the Server

**Development (auto-reload via tsx):**

```bash
npm run dev
```

**Production build & run:**

```bash
npm run build
npm start
```

The server will run at `http://localhost:3000` (or the port defined in `.env`).

## Available Scripts

| Script                        | Description                        |
| ----------------------------- | ---------------------------------- |
| `npm run dev`                 | Run the server in development mode |
| `npm run build`               | Compile TypeScript into `dist/`    |
| `npm start`                   | Run the compiled build             |
| `npm test`                    | Run Vitest (watch mode)            |
| `npm run test:run`            | Run Vitest once                    |
| `npm run test:coverage`       | Run Vitest with coverage report    |
| `npm run prisma:generate`     | Generate Prisma client             |
| `npm run prisma:migrate`      | Run migrations (dev)               |
| `npm run prisma:migrate:prod` | Apply migrations (production)      |
| `npm run prisma:studio`       | Open Prisma Studio                 |

## API Endpoints

Base URL: `/api`

### User

| Method | Endpoint        | Description         |
| ------ | --------------- | ------------------- |
| POST   | `/api/user`     | Create a new user   |
| GET    | `/api/user/:id` | Get a user by id    |
| PUT    | `/api/user/:id` | Update a user by id |

## Developer Notes

- Always run `npm run prisma:generate` after changing `prisma/schema.prisma`.
- Test files must mirror the `src/` folder structure (see the `test/` folder).
- Validation messages are written in English and include explicit character limits where applicable.
- To add a new module (e.g. `job`, `company`), follow the same module-first pattern: create the module folder in each layer (`domain/`, `application/`, `infrastructure/modules/`) and mount its routes in `src/main.ts`.
