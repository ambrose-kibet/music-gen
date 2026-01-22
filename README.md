<div align="center">

  <h3><b>Music Gen - AI Music Generation Platform</b></h3>

</div>

<!-- TABLE OF CONTENTS -->

# 📗 Table of Contents <a name="readme-top"></a>

- [📗 Table of Contents ](#-table-of-contents-)
- [📖 Music Gen - AI Music Generation Platform ](#-music-gen---ai-music-generation-platform-)
  - [🛠 Built With ](#-built-with-)
    - [Tech Stack ](#tech-stack-)
    - [Key Features ](#key-features-)
  - [📁 Project Structure ](#-project-structure-)
  - [💻 Getting Started ](#-getting-started-)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
    - [Deploy the music\_gen\_service to Modal](#deploy-the-music_gen_service-to-modal)
    - [Usage](#usage)
      - [Running with Docker Compose (Recommended)](#running-with-docker-compose-recommended)
      - [Running Services Individually](#running-services-individually)
    - [Run tests](#run-tests)
  - [👥 Authors ](#-authors-)
  - [🔭 Future Features ](#-future-features-)
  - [🤝 Contributing ](#-contributing-)
  - [⭐️ Show your support ](#️-show-your-support-)
  - [🙏 Acknowledgments ](#-acknowledgments-)
  - [❓ FAQ ](#-faq-)
  - [📝 License ](#-license-)
  - [Appendix: YouTube API Integration ](#appendix-youtube-api-integration-)
    - [Prerequisites](#prerequisites-1)
    - [Step 1: Create a Google Cloud Project](#step-1-create-a-google-cloud-project)
    - [Step 2: Enable YouTube Data API v3](#step-2-enable-youtube-data-api-v3)
    - [Step 3: Create OAuth 2.0 Credentials](#step-3-create-oauth-20-credentials)
    - [Step 4: Create OAuth 2.0 Client ID](#step-4-create-oauth-20-client-id)
    - [Step 5: Configure Environment Variables](#step-5-configure-environment-variables)
    - [Step 7: YouTube API Rate Limits](#step-7-youtube-api-rate-limits)
    - [Troubleshooting YouTube Integration](#troubleshooting-youtube-integration)
      - [Issue: "Unauthorized client" error](#issue-unauthorized-client-error)
      - [Issue: "Scope not allowed" error](#issue-scope-not-allowed-error)
      - [Issue: Video upload fails](#issue-video-upload-fails)
    - [Issue: "Invalid\_grant" error during upload](#issue-invalid_grant-error-during-upload)
  - [Appendix: Facebook API Integration ](#appendix-facebook-api-integration-)
    - [Prerequisites](#prerequisites-2)
    - [Step 1: Register Facebook App](#step-1-register-facebook-app)
    - [Step 2: Add Facebook Login Product](#step-2-add-facebook-login-product)
    - [Step 3: Set Up Facebook Graph API](#step-3-set-up-facebook-graph-api)
    - [Step 4: Create Facebook Business Account](#step-4-create-facebook-business-account)
    - [Step 5: Configure Environment Variables](#step-5-configure-environment-variables-1)
    - [Step 6: Facebook API Rate Limits](#step-6-facebook-api-rate-limits)
    - [Troubleshooting Facebook Integration](#troubleshooting-facebook-integration)
      - [Issue: "Invalid OAuth redirect URI"](#issue-invalid-oauth-redirect-uri)
      - [Issue: "Invalid access token"](#issue-invalid-access-token)
      - [Issue: "Insufficient permissions"](#issue-insufficient-permissions)
      - [Issue: "Page not found" when posting](#issue-page-not-found-when-posting)
    - [References](#references)

<!-- PROJECT DESCRIPTION -->

# 📖 Music Gen - AI Music Generation Platform <a name="about-project"></a>

> AI-powered music generation platform with serverless music processing.

**Music Gen** is a full-stack application that enables users to create AI-generated music, and integrate with the Audius, Youtube and Facebook platform to distribute music to a wide audience. Built with a modern tech stack featuring React, NestJS, and Python/FastAPI services, it provides a seamless experience for creating music powered by AI.

## 🛠 Built With <a name="built-with"></a>

### Tech Stack <a name="tech-stack"></a>

<details>
  <summary>Client (Frontend)</summary>
  <ul>
    <li><a href="https://reactjs.org/">React.js 19</a></li>
    <li><a href="https://vitejs.dev/">Vite</a> - Build tool</li>
    <li><a href="https://www.typescriptlang.org/">TypeScript</a></li>
    <li><a href="https://tanstack.com/query/latest">React Query</a> - Data fetching & caching</li>
    <li><a href="https://zustand-demo.pmnd.rs/">Zustand</a> - State management</li>
    <li><a href="https://react-hook-form.com/">React Hook Form</a> - Form management</li>
    <li><a href="https://zod.dev/">Zod</a> - Schema validation</li>
    <li><a href="https://www.radix-ui.com/">Shadcn UI</a> - Component primitives</li>
    <li><a href="https://tailwindcss.com/">Tailwind CSS</a> - Styling</li>
    <li><a href="https://react-router.dev/">React Router v7</a> - Routing</li>

  </ul>
</details>

<details>
  <summary>Server (Backend)</summary>
  <ul>
    <li><a href="https://nestjs.com/">NestJS </a> - Framework</li>
    <li><a href="https://orm.drizzle.team/">Drizzle ORM</a> - Database ORM</li>
    <li><a href="https://www.postgresql.org/">PostgreSQL 16</a> - Database</li>
    <li><a href="https://redis.io/">Redis</a> - Job queue</li>
    <li><a href="https://docs.bullmq.io/">BullMQ</a> - Job queue</li>
    <li><a href="https://developers.facebook.com/docs/graph-api">Facebook Graph API</a> - Social media integration</li>
    <li><a href="https://developers.google.com/youtube/v3">YouTube Data API</a> - Video platform integration</li>
    <li><a href="https://www.ffmpeg.org/">FFmpeg</a> - Audio processing</li>
    <li><a href="https://www.passportjs.org/">Passport</a> - Authentication</li>
    <li><a href="https://aws.amazon.com/s3/">AWS S3</a> - File storage</li>
    <li><a href="https://nodemailer.com/">Nodemailer</a> - Email service</li>
    <li><a href="https://swagger.io/">Swagger</a> - API documentation</li>
  </ul>
</details>

<details>
  <summary>Music Generation Service (Serverless)</summary>
  <ul>
    <li><a href="https://modal.com/">Modal</a> - Serverless platform</li>
    <li><a href="https://github.com/langchain-ai/langgraph">LanGraph</a> - AI workflows orchestration</li>
    <li><a href="https://huggingface.co/">HuggingFace</a> - ML models</li>
    <li><a href="https://www.ffmpeg.org/">FFmpeg</a> - Audio/Video processing</li>
    <li><a href="https://pydub.simpleaudiosystem.com/">pydub</a> - Audio manipulation</li>
    <li><a href="https://boto3.amazonaws.com/">Boto3</a> - AWS S3 integration</li>
  </ul>
</details>

<details>
  <summary>Infrastructure</summary>
  <ul>
    <li><a href="https://www.docker.com/">Docker</a> - Containerization</li>
    <li><a href="https://docs.docker.com/compose/">Docker Compose</a> - Service orchestration</li>
  </ul>
</details>

<!-- Features -->

### Key Features <a name="key-features"></a>

- **AI Music Generation**: Generate original music tracks using AI models
- **Bot Management**: Create, customize, and manage multiple AI music generation bots
- **Song Library**: Manage your generated songs with metadata, cover art
- **Audius Integration**: Share and distribute music directly to the Audius platform
- **Youtube Integration**: Share generated music videos directly to Youtube
- **Facebook Integration**: Share generated music videos directly to Facebook
- **User Authentication**: Secure JWT-based authentication with refresh token rotation
- **Email Notifications**: Password resets and account notifications via email
- **AWS S3 Integration**: Secure file storage and presigned URLs for uploads
- **Responsive UI**: Mobile-friendly interface built with Radix UI and Tailwind CSS

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- PROJECT STRUCTURE -->

## 📁 Project Structure <a name="project-structure"></a>

```
music-gen/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Radix UI primitives (buttons, dialogs, inputs)
│   │   │   ├── agents/              # Bot-related components
│   │   │   ├── auth/                # Authentication components (login, register)
│   │   │   ├── integration/         # Audius integration components
│   │   │   ├── songs/               # Song display and management components
│   │   │   ├── form-error.tsx       # Form error display component
│   │   │   ├── form-success.tsx     # Form success message component
│   │   │   ├── media-player.tsx     # Audio player component
│   │   │   ├── navbar.tsx           # Navigation bar component
│   │   │   ├── pagination.tsx       # Pagination component
│   │   │   └── search-form.tsx      # Search functionality component
│   │   ├── routes/                  # Page-level components
│   │   │   ├── auth-page.tsx        # Login/register page
│   │   │   ├── home-page.tsx        # Home/dashboard page
│   │   │   ├── my-songs-page.tsx    # User's songs listing
│   │   │   ├── my-agents-page.tsx   # User's Bots listing
│   │   │   ├── create-agent.tsx     # Create new Bot form
│   │   │   ├── my-agent-page.tsx    # Bot detail page
│   │   │   ├── profile-page.tsx     # User profile page
│   │   │   ├── integrations-page.tsx # Integrations hub
│   │   │   └── audius-integration-page.tsx # Audius setup
│   │   ├── store/                   # Zustand state management
│   │   │   ├── user-store.tsx       # User authentication state
│   │   │   └── current-song-store.tsx # Current playing song state
│   │   ├── lib/                     # Utilities and helpers
│   │   │   ├── axios-config.ts      # API client with 401 retry logic
│   │   │   ├── style-items.ts       # Shared style constants
│   │   │   └── utils.ts             # General utility functions
│   │   ├── utils/                   # Type definitions and helpers
│   │   │   ├── types.ts             # TypeScript type definitions
│   │   │   ├── local-storage.ts     # Local storage helpers
│   │   │   └── audiusSdk.ts         # Audius SDK configuration
│   │   ├── schemas/                 # Zod validation schemas
│   │   │   └── index.ts             # Form validation schemas
│   │   ├── assets/                  # Static assets
│   │   ├── App.tsx                  # Main app component with routing
│   │   ├── main.tsx                 # React DOM entry point
│   │   ├── providers.tsx            # Global providers (themes, query client)
│   │   └── index.css                # Global styles
│   ├── public/                      # Public static files
│   ├── vite.config.ts               # Vite build configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── eslint.config.js             # ESLint configuration
│   ├── package.json                 # Dependencies and scripts
│   └── dockerfile.local             # Development Docker image
│
├── server/                          # NestJS backend application
│   ├── src/
│   │   ├── auth/                    # Authentication module
│   │   │   ├── auth.controller.ts   # Login/register/refresh endpoints
│   │   │   ├── auth.service.ts      # Auth business logic
│   │   │   ├── jwt.strategy.ts      # JWT Passport strategy
│   │   │   ├── auth.module.ts       # Module definition
│   │   │   └── schema.ts            # Users table schema (Drizzle)
│   │   ├── bot/                     # Bot module
│   │   │   ├── bot.controller.ts    # Bot CRUD endpoints
│   │   │   ├── bot.service.ts       # Bot business logic
│   │   │   ├── schema.ts            # Bots table schema
│   │   │   └── bot.module.ts        # Module definition
│   │   ├── song/                    # Song module
│   │   │   ├── song.controller.ts   # Song endpoints
│   │   │   ├── song.service.ts      # Song business logic
│   │   │   ├── schema.ts            # Songs table schema
│   │   │   └── song.module.ts       # Module definition
│   │   ├── integration/             # Audius integration module
│   │   │   ├── integration.controller.ts # Integration endpoints
│   │   │   ├── integration.service.ts    # Integration logic
│   │   │   ├── schema.ts            # Integration tables schema
│   │   │   └── integration.module.ts # Module definition
│   │   ├── mail/                    # Email service module
│   │   │   ├── mail.service.ts      # Email sending logic
│   │   │   ├── mail.module.ts       # Module definition
│   │   │   └── templates/           # Email templates
│   │   ├── db/                      # Database configuration
│   │   │   ├── db.module.ts         # Drizzle setup (imports all schemas)
│   │   │   ├── db-connection.ts     # Database connection token
│   │   │   └── redis/               # Redis service for caching
│   │   ├── config/                  # Configuration
│   │   │   └── env.schema.ts        # Environment variables validation
│   │   ├── utils/                   # Shared utilities
│   │   ├── app.module.ts            # Root module with global setup
│   │   └── main.ts                  # NestJS bootstrap
│   ├── drizzle/                     # Database migrations
│   │   ├── 0000_*.sql              # Migration files (auto-generated)
│   │   ├── 0001_*.sql
│   │   └── meta/                    # Migration metadata
│   ├── test/                        # E2E tests
│   │   ├── app.e2e-spec.ts          # End-to-end test suite
│   │   └── jest-e2e.json            # Jest E2E configuration
│   ├── drizzle.config.ts            # Drizzle Kit configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── nest-cli.json                # NestJS CLI configuration
│   ├── package.json                 # Dependencies and scripts
│   ├── dockerfile.local             # Development Docker image
│   └── README.md                    # Server-specific documentation
│
├── music_gen_service/               # Python serverless music generation
│   ├── main.py                      # Modal FastAPI endpoint entry
│   ├── app_instance.py              # Modal app instance setup
│   ├── ai_service.py                # AI music generation logic
│   ├── ace_step_service.py          # AI workflow orchestration
│   ├── video_ai_service.py          # Video processing logic
│   ├── schemas.py                   # Pydantic request/response schemas
│   ├── utils.py                     # Helper functions
│   ├── prompts.py                   # AI prompt templates
│   ├── samples.txt                  # Sample data for testing
│   ├── requirements.txt             # Python dependencies
│   └── README.md                    # Service-specific documentation
│
├── docker-compose.yml               # Service orchestration configuration
├── LICENSE                          # MIT License
└── README.md                        # This file

```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## 💻 Getting Started <a name="getting-started"></a>

To get a local copy up and running, follow these steps.

### Prerequisites

You need to have the following installed:

- [**Node.js** (v22 or higher)](https://nodejs.org/) - JavaScript runtime
- [**npm** or **yarn**](https://www.npmjs.com/) - Package managers
- [**Docker** and **Docker Compose**](https://docs.docker.com/compose/) - Containerization
- [**Python** 3.9+ (for music generation service)](https://www.python.org/downloads/) - music-gen-service runtime
- [**Git**](https://git-scm.com/) - Version control

### Setup

Clone this repository to your desired folder:

```sh
git clone https://github.com/ambrose-kibet/music-gen.git
cd music-gen
```

### Deploy the music_gen_service to Modal

Follow the instructions in <a href="music_gen_service/README.md">music_gen_service/README.md</a> to deploy the service to Modal.

### Usage

#### Running with Docker Compose (Recommended)

```sh
# Copy environment template and configure variables
cp .env.example .env

# Start all services (client, server, PostgreSQL, Redis)
docker-compose up
```

Services will be available at:

- **Client**: http://localhost:4000
- **Server API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs

#### Running Services Individually

**Server (watch mode with auto-migration)**:

```sh
cd server
npm run start:dev
```

**Client**:

```sh
cd client
npm run dev
```

**Database migrations**:

```sh
cd server

# Generate new migration from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# View database in GUI
npm run db:studio
```

### Run tests

**Server unit tests**:

```sh
cd server
npm test
```

**Server E2E tests**:

```sh
cd server
npm run test:e2e
```

**Client linting**:

```sh
cd client
npm run lint
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AUTHORS -->

## 👥 Authors <a name="authors"></a>

👤 **Ambrose**

- GitHub: [@ambrose-kibet](https://github.com/ambrose-kibet)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FUTURE FEATURES -->

## 🔭 Future Features <a name="future-features"></a>

- [ ] **Instagram and TikTok integration**: Direct sharing to more social platforms
- [ ] **Optimized distribution pipeline**: Faster uploads to Audius, Youtube, Facebook
- [ ] **Support for shorts remixes and reels**: Create short-form content
- [ ] **Advanced Audius Integration**: Direct publishing with metadata management

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## 🤝 Contributing <a name="contributing"></a>

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](../../issues/).

**Development Workflow**:

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit your changes: `git commit -m 'Add amazing feature'`
3. Push to the branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

Please follow the project's code style before submitting a PR.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SUPPORT -->

## ⭐️ Show your support <a name="support"></a>

If you like this project, please give it a star ⭐! Your support helps us improve and grow the platform.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGEMENTS -->

## 🙏 Acknowledgments <a name="acknowledgements"></a>

- [@Andreaswt](https://github.com/andreaswt) - For inspiration on project structure
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [React](https://react.dev/) - UI library
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [LangChain && Langgraph](https://www.langchain.com/) - AI orchestration
- [Modal](https://modal.com/) - Serverless compute platform
- [Audius](https://audius.co/) - Decentralized music platform

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FAQ -->

## ❓ FAQ <a name="faq"></a>

- **Why am I getting 401 errors when making API calls?**

  Check that your JWT token is valid and not expired. The client automatically refreshes tokens on 401, but if you're using the API directly, ensure you're including the Authorization header with a valid Bearer token.

- **How do I configure AWS S3 for file uploads?**

  Set `AWS_ACCESS_KEY`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `AWS_BUCKET_NAME` in your `.env` file. The server will generate presigned URLs for secure uploads.

- **Can I run the music generation service locally?**

  The music generation service is designed to run on Modal (serverless). To test locally, you'll need to modify the Modal decorators and ensure all Python dependencies are installed.

- **What is the rate limit for API requests?**

  Global rate limit is 10 requests per 60 seconds per IP address. This can be customized per endpoint using NestJS decorators.

- **How do I deploy this to production?**

  Build Docker images for client and server, push to a registry, and deploy using Kubernetes or your preferred orchestration platform. For the Python service, deploy directly to Modal.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## 📝 License <a name="license"></a>

This project is [MIT](./LICENSE) licensed.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Appendix: YouTube API Integration <a name="appendix-youtube-api-integration"></a>

This appendix provides step-by-step instructions for integrating YouTube API with Music Gen to enable uploading and managing music videos on YouTube.

### Prerequisites

- Google Account (personal or business)
- Access to Google Cloud Console
- YouTube channel (create one if needed)

### Step 1: Create a Google Cloud Project

1. **Visit Google Cloud Console**
   - Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account
   - If prompted, accept the terms of service

2. **Create a New Project**
   - Click on the project dropdown at the top-left
   - Click **NEW PROJECT**
   - Enter project name: `Music-Gen-YouTube`
   - Select organization (if applicable)
   - Click **CREATE**

3. **Wait for Project Creation**
   - Project creation takes 30-60 seconds
   - You'll see a notification when complete

### Step 2: Enable YouTube Data API v3

1. **Navigate to APIs & Services**
   - In the sidebar, click **APIs & Services**
   - Click **Library**

2. **Search for YouTube API**
   - In the search box, type `YouTube Data API v3`
   - Click on **YouTube Data API v3** from results

3. **Enable the API**
   - Click **ENABLE** button
   - Wait for the API to be enabled
   - You'll see "API enabled" confirmation

### Step 3: Create OAuth 2.0 Credentials

1. **Go to Credentials Page**
   - Click **APIs & Services** in sidebar
   - Click **Credentials**

2. **Create Consent Screen**
   - Click **CONFIGURE CONSENT SCREEN** (if you see it)
   - Or click **Create Credentials** → **OAuth client ID**
   - If prompted, first set up the OAuth consent screen

3. **Configure OAuth Consent Screen**

   **User Type:**
   - Select **External** (for public use)
   - Click **CREATE**

   **App Information:**
   - App name: `Music Gen`
   - User support email: [your-email@gmail.com]
   - App logo (optional): Upload Music Gen logo if available

   **Developer Contact Information:**
   - Email addresses: [your-email@gmail.com]
   - Click **SAVE AND CONTINUE**

4. **Add Scopes**
   - Click **ADD OR REMOVE SCOPES**
   - Search and add the following scopes:
     - `youtube.upload` - Upload videos
     - `youtube.readonly` - Read videos
     - `youtube.force-ssl` - Use HTTPS
   - Click **UPDATE** and then **SAVE AND CONTINUE**

5. **Add Test Users**
   - Click **ADD USERS**
   - Add email addresses of test accounts:
     - Your main email
     - Any team member emails
   - Click **SAVE AND CONTINUE**

6. **Review and Finish**
   - Review all information
   - Click **BACK TO DASHBOARD**

### Step 4: Create OAuth 2.0 Client ID

1. **Go to Credentials Page**
   - Click **Credentials** in the sidebar

2. **Create New Credential**
   - Click **+ CREATE CREDENTIALS**
   - Select **OAuth client ID**

3. **Choose Application Type**
   - Select **Web application**

4. **Configure OAuth Client**

   **Name:**
   - Name: `Music Gen Server`

   **Authorized JavaScript origins:**
   - Add: `http://localhost:3000`
   - Add: `https://yourdomain.com` (your production domain)

   **Authorized redirect URIs:**
   - Add: `=http://localhost:3000/integrations/youtube/callback`
   - Add: `https://yourdomain.com/integrations/youtube/callback`

   - Click **CREATE**

5. **Save Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret**
   - Click **DOWNLOAD JSON** to save credentials file
   - **IMPORTANT:** Store these securely - never commit to Git

### Step 5: Configure Environment Variables

Create or update `.env` file in the root directory:

```bash
# YouTube API Configuration
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI==http://localhost:3000/integrations/youtube/callback
```

**Replace:**

- `YOUR_CLIENT_ID` with your OAuth Client ID
- `YOUR_CLIENT_SECRET` with your OAuth Client Secret

### Step 7: YouTube API Rate Limits

**Free Quota:**

- 10,000 credits per day
- Uploading videos: 1,600 credits per request = 6 per day

**Optimize API Usage:**

- Cache video metadata locally
- Batch requests when possible
- Implement retry logic with exponential backoff

### Troubleshooting YouTube Integration

#### Issue: "Unauthorized client" error

**Solution:**

1. Verify OAuth client ID and secret in `.env`
2. Check redirect URIs are registered in Google Cloud Console
3. Ensure redirect URIs match exactly (including protocol and trailing slashes)

#### Issue: "Scope not allowed" error

**Solution:**

1. Go to Google Cloud Console
2. Check OAuth consent screen has required scopes added
3. Refresh credentials and re-authenticate

#### Issue: Video upload fails

**Solution:**

1. Verify YouTube channel is set up
2. Check video file format is supported
3. Ensure access token is fresh (not expired)

### Issue: "Invalid_grant" error during upload

**Solution:**

1. re-authenticate to get a new access token
2. Ensure the refresh token is valid and not revoked
3. In development, refresh token expires after 7 days.

---

## Appendix: Facebook API Integration <a name="appendix-facebook-api-integration"></a>

This appendix provides step-by-step instructions for integrating Facebook API with Music Gen to enable sharing and managing content on Facebook.

### Prerequisites

- Facebook Account
- Facebook Business Page (create one if needed)
- Access to Facebook Developers Console

### Step 1: Register Facebook App

1. **Visit Facebook Developers**
   - Go to [https://developers.facebook.com/](https://developers.facebook.com/)
   - Click **Log In** and sign in with your Facebook account

2. **Create App**
   - Click **My Apps** in the top menu
   - Click **Create App**

3. **Fill App Details**

   **App Name:**
   - Name: `Music Gen`

   **App Contact Email:**
   - Enter your email

4. **Choose App Details and Type**
   - Select **Other**
   - Click **Next**
   - Type select **Business**
   - Click **Next**
   - click **create app**

### Step 2: Add Facebook Login Product

1. **Go to App Dashboard**
   - You should be in the app dashboard
   - If not, click **My Apps** → Select your app

2. **Add Product**
   - Find the **Products** section on the left
   - Search for **Facebook Login**
   - Click **Set Up**

3. **Choose Platform**
   - Select **Web**
   - Click **Next**

4. **Configure Facebook Login**

   **Valid OAuth Redirect URIs:**
   - Add: `http://localhost:3000/integrations/facebook/callback`

   - Add: `https://yourdomain.com/integrations/facebook/callback`

   - Click **Save**

### Step 3: Set Up Facebook Graph API

1. **Go to Settings → Basic**
   - Copy your **App ID**
   - Copy your **App Secret** (keep this private!)
   - Note your **App Name**

2. **Add Platforms**
   - Click **+ Add Platform**
   - Select **Website**

   **Site URL:**
   - Enter: `http://localhost:3000` (for development)
   - Enter: `https://yourdomain.com` (for production)

   - Click **Save Changes**

### Step 4: Create Facebook Business Account

1. **Create Business Page**
   - Go to [https://www.facebook.com/pages/create/](https://www.facebook.com/pages/create/)
   - Fill in business details:
     - Page name: `Music Gen`
     - Category: Music/Audio
     - Description: AI Music Generation Platform
   - Click **Create Page**

2. **Get Business Page ID**
   - Go to your Page
   - Check the URL: `facebook.com/musicgen` → the ID is in the URL
   - Or in Page Settings → Page Information → Page ID

### Step 5: Configure Environment Variables

Update `.env` file in the root directory:

```bash
# Facebook API Configuration
META_APP_ID=YOUR_APP_ID
META_APP_SECRET=YOUR_APP_SECRET
META_REDIRECT_URI=http://localhost:3000/integrations/facebook/callback

```

**Replace:**

- `YOUR_APP_ID` with your Facebook App ID
- `YOUR_APP_SECRET` with your Facebook App Secret

### Step 6: Facebook API Rate Limits

**Rate Limits:**

- 200 calls per hour (for most endpoints)
- Page feed: 200 calls per hour
- Photo uploads: 100 calls per hour
- Insights: 10 calls per hour

**Best Practices:**

- Implement request queuing
- Cache insights data (minimum 24 hours)
- Batch requests when possible
- Use exponential backoff for retries

### Troubleshooting Facebook Integration

#### Issue: "Invalid OAuth redirect URI"

**Solution:**

1. Go to Facebook App Settings → Facebook Login
2. Add redirect URIs including protocol and trailing slash
3. Exact match required: `http://localhost:3000/auth/facebook/callback`

#### Issue: "Invalid access token"

**Solution:**

1. Verify access token hasn't expired
2. Generate new long-lived token (90 days)
3. Ensure token has correct permissions attached

#### Issue: "Insufficient permissions"

**Solution:**

1. Go to App Roles → Test Users
2. Add permissions to test user account
3. Re-authenticate with new permissions

#### Issue: "Page not found" when posting

**Solution:**

1. Verify Page ID is correct
2. Check access token is for that specific page
3. Ensure page is active and not restricted

### References

**YouTube API:**

- [YouTube API Documentation](https://developers.google.com/youtube/v3)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [googleapis Node.js Library](https://github.com/googleapis/google-api-nodejs-client)

**Facebook API:**

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Webhooks Guide](https://developers.facebook.com/docs/graph-api/webhooks)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
