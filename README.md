# 📇 nodejs-hw-mongodb

**A full-featured backend API for managing personal contacts with support for authentication, image upload, email-based password reset, filtering, sorting, and pagination.**

This project is built with Express and connected to a MongoDB database, allowing you to retrieve contact information via REST API.

> 🧪 Source code is on branch: `hw7-swagger`

---

## 📦 Tech Stack

- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[Express 5](https://expressjs.com/)** - Web framework for building APIs
- **[MongoDB + Mongoose](https://mongoosejs.com/)** - NoSQL database with ODM
- **[JWT](https://github.com/auth0/node-jsonwebtoken)** - JSON Web Token
- **[Multer](https://github.com/expressjs/multer)** - File upload middleware
- **[Cloudinary](https://cloudinary.com/)** - Image hosting service
- **[Nodemailer](https://nodemailer.com/about/)** - Email-based password reset
- **[Handlebars](https://handlebarsjs.com/)** - Template engine for rendering HTML
- **[Joi](https://joi.dev/)** - Validation library for JSON schemas
- **[pino-http](https://github.com/pinojs/pino-http)** - HTTP logging middleware
- **[cors](https://www.npmjs.com/package/cors)** - Enables CORS for cross-origin requests
- **[dotenv](https://www.npmjs.com/package/dotenv)** - Loads environment variables

## 🗂️ Project Structure

```
nodejs-hw-mongodb/
├── src/                           # Project source code
│   ├── constants/                 # Constants and configuration keys
│   │   ├── envVars.js             # Environment variable names used in the project
│   │   ├── index.js               # Export index for constants
│   │   └── paths.js               # Constants for paths (e.g., upload directories)
│   ├── controllers/               # Route controller functions
│   │   ├── auth.js                # Handlers for authentication-related routes
│   │   └── contacts.js            # Handlers for contact-related routes
│   ├── db/                        # Database configuration and schemas
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── contacts.js        # Schema for contact documents
│   │   │   ├── sessions.js        # Schema for session tokens (refresh)
│   │   │   └── users.js           # Schema for user accounts
│   │   └── initMongoConnection.js # Function to initialize MongoDB connection
│   ├── middlewares/              # Custom Express middlewares
│   │   ├── authenticate.js        # JWT authentication middleware
│   │   ├── errorHandler.js        # Centralized error handling middleware
│   │   ├── isValidId.js           # Middleware to validate MongoDB ObjectId
│   │   ├── multer.js              # Multer configuration for file uploads
│   │   ├── notFoundHandler.js     # 404 Not Found handler middleware
│   │   └── validateBody.js        # Middleware for validating request bodies with Joi
│   ├── routers/                  # Express route modules
│   │   ├── auth.js                # Routes related to authentication
│   │   ├── contacts.js            # Routes related to contacts
│   │   └── index.js               # Entry point to combine and export all routers
│   ├── services/                 # Business logic layer (used by controllers)
│   │   ├── auth.js                # Services for auth-related operations
│   │   └── contacts.js            # Services for contact-related operations
│   ├── templates/                # HTML templates for emails
│   │   └── reset-password-email-template.html # Email template for password reset
│   ├── temp/                     # Temporary upload directory (before processing)
│   │   └── .gitkeep              # Keeps the folder in version control
│   ├── uploads/                  # Final processed uploads (used when Cloudinary is disabled)
│   │   └── .gitkeep              # Keeps the folder in version control
│   ├── utils/                    # Reusable utility/helper functions
│   │   ├── calculatePaginationData.js # Calculates pagination metadata
│   │   ├── createDirIfNotExists.js    # Ensures directories exist at startup
│   │   ├── getEnvVar.js               # Reads and validates env variables
│   │   ├── parseFilterParams.js      # Parses query filters from request
│   │   ├── parsePaginationParams.js  # Parses pagination query params
│   │   ├── parseSortParams.js        # Parses sorting parameters
│   │   ├── saveFileToCloudinary.js   # Uploads file to Cloudinary
│   │   ├── saveFileToUploadDir.js    # Moves file from temp to final upload directory
│   │   └── send-email.js             # Sends emails via configured SMTP provider
│   ├── validation/               # Joi schemas for validating request data
│   │   ├── auth.js                # Validation for auth-related routes
│   │   └── contacts.js            # Validation for contact-related routes
│   ├── index.js                  # Application entry point
│   └── server.js                 # Express app initialization and route mounting
├── .env                          # Actual environment configuration (not tracked)
├── .env.example                  # Sample environment config (template for .env)
├── .editorconfig                 # Editor settings for consistent formatting
├── .gitignore                    # Files and directories to exclude from Git
├── .prettierrc                   # Code formatting rules for Prettier
├── eslint.config.mjs             # Linting rules configuration for ESLint
├── package.json                  # NPM package metadata, dependencies, and scripts
└── README.md                     # Project documentation
```

---

## 🌱 Environment Configuration

Create a `.env` file in the root based on `.env.example`:

```
PORT=3000
MONGODB_USER=your_username
MONGODB_PASSWORD=your_password
MONGODB_URL=your_mongodb_cluster
MONGODB_DB=your_database_name

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=your_smtp_from_address

JWT_SECRET=
APP_DOMAIN=
BACKEND_URL=

CLOUD_NAME=
API_KEY=
API_SECRET=
ENABLE_CLOUDINARY=true
```

✅ If ENABLE_CLOUDINARY=false, photos will be stored locally in /uploads.

The full MongoDB URI will be composed in code using these variables.

## 🚀 Available Endpoints

### `GET /`

Health check:

```json
{ "message": "Hello World!" }
```

### `GET /contacts`

Returns all contacts.

### `GET /contacts/:contactId`

Returns a contact by ID.
Responds with `404` if the contact is not found or the ID is invalid.

## ⚙️ Usage

```bash
# Clone the project
git clone https://github.com/PushEaxVK/nodejs-hw-mongodb.git
cd nodejs-hw-mongodb

# Checkout correct branch
git checkout hw2-mongodb

# Install dependencies
npm install

# Create environment config
cp .env.example .env
# Edit .env with your MongoDB credentials

# Run the app in development mode
npm run dev

# Run the app in production mode
npm start
```

## 🧪 Scripts

| Script         | Description                               |
| -------------- | ----------------------------------------- |
| `npm run dev`  | Start app with auto-reloading (`nodemon`) |
| `npm start`    | Start app normally with Node.js           |
| `npm run lint` | Run ESLint checks                         |

## 🧑‍💻 Author

Created by [PushEax](https://github.com/PushEaxVK)

## 📝 License

Licensed under the ISC License.
