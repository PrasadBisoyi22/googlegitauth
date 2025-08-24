# Google & GitHub OAuth Login System

A full-stack authentication system that allows users to sign up and log in using Google or GitHub OAuth, built with React frontend and Node.js backend.

## 🚀 Features

- **OAuth Authentication**: Sign up/login with Google and GitHub accounts
- **JWT Token Authentication**: Secure token-based authentication
- **User Dashboard**: Personalized dashboard after successful login
- **Environment Configuration**: Easy setup with environment variables

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js**
- **npm**
- **Google OAuth Credentials** (from Google Cloud Console)
- **GitHub OAuth App** (from GitHub Developer Settings)

## 🛠️ Installation & Setup


### 1. Backend Setup

#### Navigate to backend directory:
```bash
cd backend
```

#### Install dependencies:
```bash
npm install
```

#### Configure environment variables:
```bash
cp .env.example .env
```

#### Edit `.env` file with your configuration:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/google-auth-db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Start the backend server:
```bash
npm start
```

### 2. Frontend Setup

#### Navigate to frontend directory:
```bash
cd frontend
```

#### Install dependencies:
```bash
npm install
```

#### Configure environment variables:
```bash
cp .env.example .env
```

#### Edit `.env` file with your configuration:
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GITHUB_CLIENT_ID=your-github-client-id
```

#### Start the frontend development server:
```bash
cd src
npm start
```

## 🔧 OAuth Setup Guide

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Client Secret to your `.env` files

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App:
   - Application name: Your app name
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
3. Copy Client ID and Client Secret to your `.env` files

## 🏃‍♂️ Running the Application

2. **Start Backend** (in backend directory):
   ```bash
   npm start
   ```
   Backend will run on: http://localhost:5000

3. **Start Frontend** (in frontend directory):
   ```bash
   cd src
   npm start
   ```
   Frontend will run on: http://localhost:3000

## 📁 Project Structure

```
googlegitlogin/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── passport.js
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   └── authRoutes.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── SignupPage.js
│   │   │   └── Dashboard.js
│   │   └── App.js
│   ├── .env.example
│   └── package.json
├── README.md
└── .gitignore
```

2. **OAuth Redirect Mismatch**:
   - Verify OAuth redirect URLs match exactly in OAuth provider settings
   - Ensure URLs in `.env` files match OAuth app settings

3. **CORS Issues**:
   - Check `FRONTEND_URL` in backend `.env` matches frontend origin
   - Ensure CORS is properly configured

4. **JWT Token Issues**:
   - Verify `JWT_SECRET` is set and consistent
   - Check token expiration settings


