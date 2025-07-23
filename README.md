# 📇 mindflow-backend-api

## Description

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

## ⚙️ Usage

```bash
# Clone the project
git clone https://github.com/PushEaxVK/mindflow-backend.git
cd mindflow-backend

# Checkout correct branch
git checkout init

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
