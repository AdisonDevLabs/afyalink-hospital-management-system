AfyaLink Hospital Management System
This repository contains a full-stack application for a Hospital Management System, composed of a client-side React application and a Node.js backend server. It leverages PostgreSQL for data storage and Docker Compose for easy setup and deployment.

🚀 Features
Client Application
React 19: Utilizes the latest stable version of React for building interactive user interfaces.

Vite: Leverages Vite for a fast development experience and optimized builds.

Tailwind CSS: Provides a utility-first CSS framework for rapid and consistent styling.

Chart.js & React Chart.js 2: Integration for data visualization.

Axios: A promise-based HTTP client for making API requests.

Framer Motion: For declarative animations and gestures.

React Router DOM: For client-side routing.

Lucide React: A set of beautiful and customizable open-source icons.

Moment.js & React Datepicker: For date and time manipulation and selection.

React Hot Toast & React Modal: For notifications and modal dialogs.

JWT Decode: For decoding JSON Web Tokens.

ESLint: For code linting and maintaining code quality.

Server Application
Node.js & Express.js: A robust and scalable backend built with Node.js and the Express.js web framework.

PostgreSQL: Uses a PostgreSQL database for data persistence.

pg: PostgreSQL client for Node.js.

bcryptjs: For hashing passwords securely.

jsonwebtoken: For handling JSON Web Tokens for authentication.

cors: Middleware for enabling Cross-Origin Resource Sharing.

dotenv: For loading environment variables from a .env file.

multer: Middleware for handling multipart/form-data, primarily used for file uploads.

ws: A WebSocket library for Node.js, likely for real-time communication.

nodemon: A tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.

🛠️ Installation
To set up the project locally, you can use Docker Compose for a streamlined setup of all services (PostgreSQL, Server, and Client).

Prerequisites
Docker: Install Docker Desktop

Docker Compose: Usually comes bundled with Docker Desktop.

Setup with Docker Compose (Recommended)
Clone the repository:

git clone https://github.com/your-username/afyalink-hms.git
cd afyalink-hms

Create a .env file:
Create a file named .env in the root directory of the project (where docker-compose.yml is located) and add the following environment variables. Replace the placeholder values with your desired configurations.

PORT=5000
DB_USER=afyalink_user
DB_PASSWORD=afyalink_password
DB_DATABASE=afyalink_db
JWT_SECRET=your_jwt_secret_key_here # Make this a strong, random string

Build and run the services:

docker-compose up --build

This command will:

Build the client and server Docker images based on their respective Dockerfiles.

Set up a postgres database container.

Start all three services, linking them as defined in docker-compose.yml.

Accessing the Applications
Client Application: The client will be accessible at http://localhost:8080.

Server API: The backend API will be running on http://localhost:5000 (or the PORT you configured in your .env file).

🏃 Running Individual Components (Without Docker Compose)
If you prefer to run the client and server separately without Docker Compose, follow these steps:

Client Application (Manual Setup)
Navigate to the client directory:

cd client

Install pnpm (if you don't have it):

npm install -g pnpm

Install dependencies:

pnpm install

Run in development mode:

pnpm dev

This will typically start the development server at http://localhost:5173. Ensure VITE_BACKEND_URL is set correctly in your client's environment (e.g., in a .env.local file for Vite).

Server Application (Manual Setup)
Navigate to the server directory:

cd server

Install pnpm (if you don't have it):

npm install -g pnpm

Install dependencies:

pnpm install

Create a .env file in the server directory:

PORT=5000
DB_USER=your_postgres_user
DB_HOST=localhost # Or your PostgreSQL host if not running locally
DB_DATABASE=your_postgres_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key_here

You will need a running PostgreSQL instance accessible at DB_HOST:DB_PORT for the server to connect.

Run the server:

pnpm start

The server will start on the specified PORT.