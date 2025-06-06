# BERCERITA - English Learning Platform for Indonesian Students

![Bercerita Logo](/bercerita_logo.jpeg)

BERCERITA is a Duolingo-inspired English learning platform specifically designed for Indonesian students. The name "Bercerita" means "storytelling" in Indonesian, reflecting the platform's approach to teaching English through engaging stories and interactive activities.

## Features

- **Interactive Learning**: Learn English through fun, game-like activities
- **Daily Challenges**: Build language learning habits with daily streaks and challenges
- **Learning Path**: Progressive learning journey from basics to advanced English
- **User Authentication**: Secure login and registration system powered by Kira API
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Backend API**: Kira API (https://kira-api.com)
- **Authentication**: OAuth2 with JWT tokens
- **Styling**: TailwindCSS 4
- **Language**: TypeScript
- **Build Tool**: Turbopack

## API Integration

This frontend is integrated with the Kira API backend. The following endpoints are used:

- **Login**: `POST https://kira-api.com/auth/login` (OAuth2PasswordRequestForm)
- **Register**: `POST https://kira-api.com/auth/register` (JSON)
- **Get Users**: `GET https://kira-api.com/auth/db` (Returns list of users)

### Environment Configuration

Create a `.env.local` file in the project root to configure the API URL:

```bash
NEXT_PUBLIC_API_URL=https://kira-api.com
```

If not set, the default API URL will be used.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BERCERITA_Frontend.git
cd BERCERITA_Frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables (optional):
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

## Authentication Flow

The application uses a JWT-based authentication system:

1. Users log in with email/password using OAuth2PasswordRequestForm
2. Upon successful login, a JWT token is stored in cookies
3. The token is included in subsequent API requests
4. User information is retrieved from the users list endpoint

Note: Due to the Kira API structure, the application stores the user's email in cookies to identify the current user from the users list, as there is no dedicated `/auth/me` endpoint.

## Project Structure

```
BERCERITA_Frontend/
├── app/                # Next.js app directory
│   ├── components/     # Reusable UI components
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Home page
├── public/             # Static assets
│   └── bercerita_logo.jpeg  # Logo image
└── ...config files
```

## Design Philosophy

BERCERITA's design is inspired by Duolingo's effective learning approach, but tailored specifically for Indonesian students learning English. The UI features:

- Bright, engaging colors similar to Duolingo's palette
- Gamified elements to keep users motivated
- Clear learning progression paths
- English language interface with consideration for Indonesian learners

## License

This project is proprietary and not licensed for public use.

## Acknowledgements

- Duolingo for inspiration on effective language learning platforms
- The Indonesian educational community for feedback and insights
