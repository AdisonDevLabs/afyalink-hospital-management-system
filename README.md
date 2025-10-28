# AfyaLink Hospital Management System
**AfyaLink** is a **full-stack Hospital Management System** built with **React (Vite)** for frontend, **Node.js (Express)** for backend, and **PostgreSQL** for relational database, containerized using **Docker Compose** for seamless deployment.
It provides hospitals with a robust, modern platform for managing patients, doctors, appointments, and administrative operations.

## Tech Stack
### Frontend:
* React 19
* Vite (for ultra-fast builds and hot-reloads)
* Tailwind CSS (modern, responsive UI)
* Chart.js & React Chart.js 2 (data visualization)
* Axios (API communication)
* Framer Motion (animations)
* React Router DOM (routing)
* Lucid React (icons)
* React Hot Toast & React Modal (notifications, dialogs)
* Moment.js & React Datepicker (date handling)

### Backend:
* Node.js & Express.js
* PostgreSQL (relational database)
* bcryptjs (password hashing)
* jsonwebtoken (JWT authentication)
* multer (file uploads)
* ws (WebSocket for real-time-updates)
* dotenv (environment configurations)
* cors (cross-origin resource sharing)

### DevOps && Tooling:
* Docker & Docker Compose
* ESLint
* pnpm package manager


## Features
* Secure **JWT-based authentication**
* **Role-based access control** (admin, doctor, nurse, receptionist)
* **Patient Management** (registration, history, billing)
* **Appointment scheduling** and tracking
* **Doctor availability** and profile management
* **Data visualization** dashboards using Chart.js
* **Responsive, mobile-friendly UI**
* **Dockerized deployment** for simplicity and scalability


## Installation & Setup

### Prerequisites
* Docker Desktop
* Docker Compose (included with Docker Desktop)
* Git

### Clone the Repository
  ```bash
  git clone https://github.com/AdisonDevLabs/afyalink-hospital-management-system.git
  cd afyalink-hospital-management-system
  ```

### Environment Setup
Create a `.env` file in the project root (same folder as `docker-compose.yml`):
  ```properties
  PORT=5007

  DB_USER=afyalink_user
  DB_HOST=localhost
  DB_DATABASE=afyalink_db
  DB_PASSWORD=afyalink_password
  DB_PORT=5432

  JWT_SECRET=your_jwt_secret_key_here
  ```

### Run with Docker Compose
  ```bash
  docker-compose up --build
  ```
This will:
* Build the client and server Docker images
* Set up a PostgreSQL database container
* Launch all services together

#### Access:
* **Frontend:** http://localhost:8080
* **Backend API:** http://localhost:5000


## Manual Setup (Without Docker)

### Run the Client
  ```bash
  cd client
  pnpm install
  pnpm dev
  ```

### Run the server
  ```bash
  cd server
  pnpm install
  pnpm start
  ```
Ensure you have a running PostgreSQL instance configured via `.env`


## Project Structure

  ```bash
  afyalink-hospital-management-system/
  |
  |--- client/
  |--- server/
  |--- docker-compose.yml
  |--- .env.example
  |--- README.md
  ```

## Screenshots


## Live Demo

Deployed on **Render** and can be accessed via this link:
`https://afyalink-hms-frontend.onrender.com/`


## Contributions $ Support
Contributions are welcome
if you'd like to improve AfyaLink Hospital Management System or extend its functionality:
  1. Fork the repo
  2. Create a feature branch
  3. Submit a pull request


## License
This project is licensed under the MIT License, free to use, modify and distribute.

## Author
**Adison Dev Labs**
Inovating healthcare through modern web technology
**https://github.com/AdisonDevLabs**
**adisondevlabs@gmail.com**

## Keywords
`Hospital Management System`, `React Node PostgreSQL`, `Full Stack`, `Docker`, `Vite`, `Tailwind CSS`, `AfyaLink`, `HealthTech`, `Web App`