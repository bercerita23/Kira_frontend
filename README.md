# KIRA Frontend - English Learning Platform for Indonesian Students

<div align="center">
  <img src="/bercerita_logo.jpeg" alt="Bercerita Logo" width="300" />
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-TypeScript-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Framework-Next.js-black?logo=next.js&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AWS-Amplify-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Maintained-Yes-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Website-Up-blue?style=for-the-badge" />
</p>

KIRA is a comprehensive English learning platform designed specifically for Indonesian students, featuring an interactive quiz system and gamified learning experience. The platform provides a structured learning path through various quizzes and activities to help students master English language skills.

## Features

- **Interactive Quizzes**: Learn English through engaging multiple-choice questions and fill-in-the-blank exercises
- **Visual Learning**: Image-based questions with S3-integrated content delivery
- **Real-time Feedback**: Instant answer validation with celebratory confetti animations
- **Progress Tracking**: Visual progress indicators and quiz completion tracking
- **Gamified Experience**: Point system, streaks, achievements, and badges
- **User Management**: Comprehensive authentication system with student, admin, and super-admin roles
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Content Management**: Admin dashboard for uploading and managing educational content

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Backend API**: KIRA API (https://api.kiraclassroom.com)
- **Authentication**: JWT-based authentication with secure cookie storage
- **Styling**: TailwindCSS with custom UI components
- **Language**: TypeScript
- **Image Storage**: AWS S3 integration for educational content
- **Deployment**: AWS Amplify (frontend hosting)

## Architecture

The frontend uses a proxy architecture where API routes under `/api` act as intermediaries between the client and the actual KIRA API backend. This approach provides:

- **Security**: Sensitive API tokens are kept server-side
- **CORS Management**: Eliminates cross-origin request issues
- **Request/Response Transformation**: Standardizes data formats between frontend and backend
- **Error Handling**: Centralized error management and logging

### API Integration

The application integrates with the KIRA API through proxy routes:

#### Authentication Routes

- **Student Login**: `POST /api/auth/login-stu`
- **Admin Login**: `POST /api/auth/login-ada`
- **Password Reset**: `POST /api/auth/reset-pw`
- **School Registration**: `POST /api/auth/school`

#### User Routes

- **Get Quizzes**: `GET /api/users/quizzes`
- **Get Questions**: `GET /api/users/questions/[quiz_id]`
- **Submit Quiz**: `POST /api/users/submit-quiz`
- **User Progress**: `GET /api/users/points`, `/api/users/streaks`
- **Achievements**: `GET /api/users/achievements`, `/api/users/badges`

#### Admin Routes

- **Content Management**: `POST /api/admin/content-upload`, `POST /api/admin/upload-content-lite`
- **Student Management**: `GET /api/admin/students`, `POST /api/admin/reset-pw`
- **Content Operations**: `DELETE /api/admin/remove-content`, `POST /api/admin/contents/content-reupload`

### Environment Configuration

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_API_URL=https://api.kiraclassroom.com
NEXT_PUBLIC_WEBSITE_URL=https://kiraclassroom.com
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Kira_frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Configure environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to http://localhost:3000

## User Roles & Features

### Students

- Take interactive quizzes with immediate feedback
- Track learning progress and streaks
- Earn achievements and badges
- View personalized dashboard with statistics

### Admins

- Upload and manage educational content
- Monitor student progress and performance
- Manage quiz questions and content
- Reset student passwords and manage accounts

### Super Admins

- Invite new admins to the platform
- Manage admin accounts and permissions
- System-wide configuration and oversight

## Project Structure

```
Kira_frontend/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── lesson/[slug]/   # Quiz taking interface
│   │   ├── progress/        # Progress tracking
│   │   ├── admin/          # Admin management
│   │   └── super-admin/    # Super admin features
│   ├── api/                # Proxy API routes
│   │   ├── auth/           # Authentication proxies
│   │   ├── users/          # User-related proxies
│   │   ├── admin/          # Admin-related proxies
│   │   └── super_admin/    # Super admin proxies
│   ├── components/         # Reusable UI components
│   ├── lib/               # Utilities and contexts
│   └── globals.css        # Global styles
├── public/
│   ├── bercerita_logo.jpeg # Application logo
│   └── assets/            # Static assets
└── ...config files
```

## Key Features Implementation

### Quiz System

- **Dynamic Question Loading**: Questions fetched from API with image support
- **Answer Validation**: Real-time checking with visual feedback
- **Progress Tracking**: Visual indicators showing quiz completion
- **Result Submission**: Automatic submission of quiz results to backend

### Authentication System

- **Multi-role Support**: Student, Admin, and Super Admin authentication
- **Secure Token Management**: JWT tokens stored in HTTP-only cookies
- **Protected Routes**: Role-based access control for different sections

### Content Management

- **S3 Integration**: Secure image upload and retrieval for quiz content
- **Admin Dashboard**: Comprehensive content management interface
- **Content Validation**: Hash-based content integrity checking

## Design Philosophy

KIRA's design focuses on creating an engaging and effective learning environment:

- **Clean, Modern Interface**: Inspired by successful educational platforms
- **Gamification Elements**: Points, streaks, and achievements to motivate learning
- **Visual Learning**: Image-based questions to enhance comprehension
- **Responsive Design**: Consistent experience across all device types
- **Indonesian Context**: Tailored specifically for Indonesian English learners

## Performance & Optimization

- **Image Optimization**: S3-based content delivery with optimized loading
- **Code Splitting**: Route-based code splitting for faster initial loads
- **Caching Strategy**: Efficient API response caching
- **Progressive Enhancement**: Core functionality works without JavaScript

## Website

Visit the live application at: [https://kiraclassroom.com](https://kiraclassroom.com)

## License

This project is proprietary and not licensed for public use.

## Acknowledgements

- Indonesian educational community for feedback and insights
- Modern educational platforms for UX/UI inspiration
- AWS services for reliable infrastructure support
