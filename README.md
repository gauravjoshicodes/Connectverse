# 🌐 ConnectVerse — MERN Social Media Application

<div align="center">

![ConnectVerse](https://img.shields.io/badge/ConnectVerse-Social%20Media-6C5CE7?style=for-the-badge&logo=react&logoColor=white)
![MERN](https://img.shields.io/badge/Stack-MERN-00CEC9?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A full-stack social media platform built with the MERN stack featuring real-time messaging, stories, notifications, and a stunning Glassmorphism UI.**

*Developed by **Gaurav Joshi***

</div>

---

## 📸 Screenshots

| Login Page | Home Feed (Light) | Home Feed (Dark) |
|:---:|:---:|:---:|
| ![Login](screenshots/login.png) | ![Home Light](screenshots/home-light.png) | ![Home Dark](screenshots/home-dark.png) |


---

## ✨ Features

### 🔐 Authentication
- JWT-based signup & login
- Google OAuth (Firebase)
- Auto-login on refresh
- Secure password hashing (bcrypt)
- Show/Hide password toggle

### 👤 Profile System
- View & edit profile (name, username, bio, profile picture)
- Image upload via Cloudinary
- Follow / Unfollow users
- Followers & Following lists
- Online status indicators

### 📝 Posts System
- Create posts with text + image/video
- Like / Unlike with real-time notifications
- Comment system
- Delete own posts
- Save / Bookmark posts
- Infinite scroll feed with pagination

### 📖 Stories
- Upload image/video stories
- Auto-delete after 24 hours (MongoDB TTL index)
- Story viewer with progress bar & navigation
- Neon gradient rings on story avatars

### 💬 Real-Time Messaging
- One-to-one chat
- Socket.io integration
- Typing indicator with animated dots
- Online/Offline status
- Chat rooms with message history

### 🔔 Notifications
- Real-time push notifications (Socket.io)
- Like, Comment, Follow notification types
- Unread badge counter
- Mark all as read

### 🎨 UI/UX
- **Glassmorphism + Neon theme**
- Dark / Light mode toggle
- Responsive design (mobile, tablet, desktop)
- Micro-animations & hover effects
- Skeleton loading states
- Modern Inter font typography

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router v7 |
| **Styling** | Vanilla CSS (Glassmorphism Design System) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Authentication** | JWT, bcrypt, Firebase Admin |
| **Real-Time** | Socket.io |
| **File Upload** | Cloudinary, Multer |
| **Icons** | React Icons (Feather + Font Awesome) |
| **Notifications** | React Hot Toast |

---

## 📁 Folder Structure

```
ConnectVerse/
├── client/                     # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/           # Login, Register
│   │   │   ├── Chat/           # ChatBox, ChatList, Message
│   │   │   ├── Feed/           # Feed, Post, CreatePost
│   │   │   ├── Layout/         # Navbar, Sidebar, RightBar
│   │   │   ├── Notification/   # NotificationPanel
│   │   │   ├── Profile/        # ProfileCard
│   │   │   └── Story/          # StoryBar, StoryViewer
│   │   ├── context/            # Auth, Socket, Theme contexts
│   │   ├── config/             # Firebase config
│   │   ├── pages/              # Home, Profile, Chat, EditProfile
│   │   ├── services/           # API service modules
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           # Design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Node.js Backend
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── cloudinary.js       # Cloudinary + Multer setup
│   │   └── firebase-admin.js   # Firebase Admin SDK
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── userController.js
│   │   ├── chatController.js
│   │   ├── messageController.js
│   │   ├── storyController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT middleware
│   │   └── errorHandler.js     # Global error handler
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Chat.js
│   │   ├── Message.js
│   │   ├── Story.js
│   │   └── Notification.js
│   ├── routes/                 # Express routes
│   │   ├── auth.js
│   │   ├── posts.js
│   │   ├── users.js
│   │   ├── chats.js
│   │   ├── messages.js
│   │   ├── stories.js
│   │   └── notifications.js
│   ├── sockets/
│   │   └── socketHandler.js    # Socket.io events
│   ├── server.js               # Entry point
│   └── package.json
│
├── .env.example                # Environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Firebase project (for Google OAuth)

### 1. Clone the Repository
```bash
git clone https://github.com/gauravjoshicodes/Connectverse.git
cd mern-social-media-app
```

### 2. Setup Environment Variables
```bash
# Copy the example env file and fill in your credentials
# For server:
cp .env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secret, Cloudinary & Firebase keys

# For client:
cp .env.example client/.env
# Edit client/.env with your Firebase client keys
```

### 3. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Run the Application
```bash
# Terminal 1 — Start Backend
cd server
npm run dev

# Terminal 2 — Start Frontend
cd client
npm run dev
```

### 5. Open in Browser
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/:id/follow` | Follow/Unfollow user |
| GET | `/api/users/search?q=` | Search users |
| GET | `/api/users/suggestions` | Get suggested users |
| GET | `/api/posts/timeline` | Get feed posts |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/:id/like` | Like/Unlike post |
| POST | `/api/posts/:id/comment` | Comment on post |
| GET | `/api/chats` | Get user chats |
| POST | `/api/messages` | Send message |
| GET | `/api/stories` | Get stories feed |
| POST | `/api/stories` | Create story |
| GET | `/api/notifications` | Get notifications |

---

## 🔮 Future Scope

- 📱 React Native mobile app
- 🎥 Video calling (WebRTC)
- 📊 Admin dashboard with analytics
- 🔍 Advanced search with filters
- 🏷️ Hashtag system
- 📧 Email verification & password reset
- 🌐 Multi-language support (i18n)
- ☁️ Full deployment (Vercel + Render)

---

## 🚀 Deployment Suggestions

| Service | Usage | URL |
|---------|-------|-----|
| **Vercel** | Frontend hosting | [vercel.com](https://vercel.com) |
| **Render** | Backend + Socket.io | [render.com](https://render.com) |
| **MongoDB Atlas** | Database | [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| **Cloudinary** | Media storage | [cloudinary.com](https://cloudinary.com) |

---

## 👨‍💻 Developer

**Gaurav Joshi**

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

⭐ **If you found this project useful, give it a star!** ⭐

</div>
