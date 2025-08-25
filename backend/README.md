# Google/GitHub OAuth Backend - MVC Architecture

A Node.js backend server with Google and GitHub OAuth authentication using MVC pattern, running on port 5000.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/
│   │   └── passport.js          # Passport OAuth strategies
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middlewares/
│   │   └── authMiddleware.js    # JWT authentication middleware
│   ├── models/
│   │   └── User.js              # User model with JSON file storage
│   ├── routes/
│   │   └── authRoutes.js        # Authentication routes
│   └── app.js                   # Main application file
├── data/
│   └── users.json               # User data storage
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your OAuth credentials:
```bash
cp .env.example .env
```

### 3. Configure OAuth Apps

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Add authorization callback URL: `http://localhost:5000/api/auth/github/callback`

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## 🔐 API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback

### User Management
- `GET /api/auth/me` - Get current user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/verify-token` - Verify JWT token
- `GET /api/auth/users` - Get all users (admin only)

### Health Check
- `GET /api/health` - Server health status

## 🔑 JWT Token

The server uses JWT tokens for authentication. After successful OAuth login, the client receives a token that should be included in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 User Schema

```json
{
  "id": "uuid",
  "name": "string",
  "username": "string",
  "email": "string",
  "avatar": "string",
  "gender": "string",
  "role": "user|admin",
  "authProvider": "google|github",
  "providerId": "string",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

## 🛡️ Security Features

- JWT token authentication
- CORS protection
- Input validation
- Error handling
- Environment variable configuration

## 🧪 Testing

You can test the endpoints using tools like Postman or curl:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test Google OAuth
curl http://localhost:5000/api/auth/google
```

## 📝 Development Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm install` - Install dependencies

## 🔄 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `BASE_URL` | Base URL for callbacks | `http://localhost:5000` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `your-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `your-client-secret` |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | `your-client-id` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | `your-client-secret` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
