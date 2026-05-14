# Hometown Hub

Hometown Hub is a full-stack web application designed to connect local communities, manage events, and facilitate interactions with local service providers. It features a modern, responsive user interface and a robust backend.

## 🚀 Tech Stack

### Frontend (`frontendv3`)
- **Framework:** React 19 with Vite
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Email:** EmailJS

### Backend (`backendv5`)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Caching:** Redis
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **File Uploads:** Multer
- **Email:** Nodemailer

## 🌟 Features

- **Authentication:** Secure user registration, login, and protected routes.
- **Communities:** Create and explore local communities.
- **Events:** Organize, discover, and participate in local events.
- **Service Providers:** 
  - Discover local service providers.
  - Apply to become a service provider.
  - Contact providers directly through the platform.
- **Admin Dashboard:** Manage users, communities, and content.

## 📁 Project Structure

The project is divided into two main directories:

- `/frontendv3`: Contains the React application.
- `/backendv5`: Contains the Node.js/Express REST API.

## ⚙️ Local Development

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI
- Redis server running locally

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backendv5
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backendv5` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   COOKIE_SECRET=your_cookie_secret
   # Add any other required secrets (e.g., JWT secret, Email credentials)
   ```
4. Start the development server:
   ```bash
   npm run start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontendv3
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 📜 Scripts

### Backend
- `npm run dev`: Runs the server using standard node (runs `src/server.js`)
- `npm run start`: Runs the server with `nodemon` for hot reloading.

### Frontend
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint to check for code quality.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
