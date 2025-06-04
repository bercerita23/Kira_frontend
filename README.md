# BERCERITA - English Learning Platform for Indonesian Students

![Bercerita Logo](frontend/bercerita_logo.jpeg)

BERCERITA is a Duolingo-inspired English learning platform specifically designed for Indonesian students. The name "Bercerita" means "storytelling" in Indonesian, reflecting the platform's approach to teaching English through engaging stories and interactive activities.

## Features

- 🎯 **Interactive Learning**: Learn English through fun, game-like activities
- 🔥 **Daily Challenges**: Build language learning habits with daily streaks and challenges
- 📚 **Learning Path**: Progressive learning journey from basics to advanced English
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🔐 **User Authentication**: Secure signup and login system with personalized experiences
- 📊 **Progress Tracking**: Monitor your learning progress and achievements

## Technology Stack

### Frontend
- **Framework**: Next.js 13.5.1 with React 18.2.0
- **Styling**: TailwindCSS with Radix UI components
- **Language**: TypeScript
- **State Management**: React Context
- **HTTP Client**: Axios
- **Testing**: Vitest with Testing Library

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT tokens with OAuth2
- **Password Hashing**: Bcrypt
- **Testing**: Python unittest framework

## Prerequisites

- **Node.js**: 18.x or higher
- **Python**: 3.8 or higher
- **npm/yarn**: Latest version
- **pip**: Latest version

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mergedApp
```

### 2. Setup Backend (API Server)

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python -m app.server
```

The backend API will be available at **http://localhost:3001**

### 3. Setup Frontend (Web Application)

Open a new terminal window/tab:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The web application will be available at **http://localhost:3000**

### 4. Access the Application

🚀 **Open your browser and visit**: **http://localhost:3000**

- **API Documentation**: http://localhost:3001/docs (Swagger UI)
- **Alternative API Docs**: http://localhost:3001/redoc (ReDoc)

## Development Workflow

### Running Tests

**Frontend Tests:**
```bash
cd frontend
npm test
```

**Backend Tests:**
```bash
cd backend
python -m pytest tests/
```

### Environment Configuration

The backend uses environment variables configured in `backend/.env.local`:

```env
API_VERSION=1.0
PROJECT_NAME=mergedApp
ENV=local
SERVER_HOST=127.0.0.1
SERVER_PORT=3001
SECRET_KEY=supersecretkey
# ... other configurations
```

### Project Structure

```
mergedApp/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── crud/           # Database operations
│   │   ├── database/       # Database configuration
│   │   ├── model/          # SQLAlchemy models
│   │   ├── router/         # API routes
│   │   ├── schema/         # Pydantic schemas
│   │   ├── config.py       # Configuration settings
│   │   ├── main.py         # FastAPI app instance
│   │   └── server.py       # Server entry point
│   ├── tests/              # Backend tests
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js app directory
│   │   ├── (auth)/         # Authentication pages
│   │   ├── components/     # Reusable components
│   │   └── globals.css     # Global styles
│   ├── components/         # UI components
│   ├── lib/                # Utilities and context
│   ├── tests/              # Frontend tests
│   ├── package.json        # Node.js dependencies
│   └── README.md           # Frontend documentation
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Interactive Documentation
Visit http://localhost:3001/docs for complete API documentation with interactive examples.

## Features in Detail

### 🔐 Authentication System
- Secure JWT-based authentication
- Password hashing with bcrypt
- Detailed error messages for better UX
- Session management with cookies

### 🎨 Modern UI/UX
- Responsive design with TailwindCSS
- Component library with Radix UI
- Dark/light theme support
- Loading states and error handling
- Toast notifications for user feedback

### 🧪 Testing
- Frontend: Component and integration tests with Vitest
- Backend: API endpoint testing
- Automated test suites for authentication flows

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000 or 3001
   lsof -ti:3000 | xargs kill -9
   lsof -ti:3001 | xargs kill -9
   ```

2. **Backend Not Starting**
   - Ensure Python dependencies are installed: `pip install -r backend/requirements.txt`
   - Check if `.env.local` exists in the backend directory

3. **Frontend Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Ensure Node.js version is 18.x or higher

### Getting Help

- Check the individual README files in `backend/` and `frontend/` for component-specific documentation
- Review the API documentation at http://localhost:3001/docs
- Run tests to verify your setup: `npm test` (frontend) and `pytest` (backend)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test` and `pytest`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is proprietary and not licensed for public use.

## Acknowledgements

- Duolingo for inspiration on effective language learning platforms
- The Indonesian educational community for feedback and insights
- FastAPI and Next.js communities for excellent documentation and tools 