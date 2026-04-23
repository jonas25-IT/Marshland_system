# Rugezi Marshland Management System

The Digital Eco-Tourism and Biodiversity Management System is a web-based platform for Rugezi Marshland, Rwanda. It manages visitors, tracks biodiversity, supports conservation, and provides reports and dashboards to improve efficiency, awareness, and sustainability.

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | Java 17, Spring Boot 3.2, JPA     |
| Frontend | React 18, Vite 5, Tailwind CSS    |
| Database | MySQL 8                           |
| Auth     | JWT (jjwt)                        |

## Project Structure

```
├── backend/          ← Spring Boot API (Java 17)
├── frontend/         ← React SPA (Vite)
├── docs/             ← Deployment guide, user manual
├── docker-compose.yml
├── render.yaml
└── README.md
```

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0
- Maven (or use the included `mvnw` wrapper)

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
The API will start on `http://localhost:8083`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
The UI will start on `http://localhost:3001`.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full deployment instructions (Render, Docker, etc.).

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [User Manual](docs/USER_MANUAL.md)
