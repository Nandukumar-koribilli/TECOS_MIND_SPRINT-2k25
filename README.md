# Smart Kisan 🌾

> A modern agricultural platform connecting farmers and landowners with intelligent crop yield prediction, pest management tools, and smart land discovery.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ⚡ Quick Start

### Prerequisites
- **Node.js** v16 or higher
- **npm** or **yarn**
- **Git**

### Installation (3 Steps)

#### 1️⃣ Clone & Install Frontend
```bash
git clone <repository-url>
cd main
npm install
```

#### 2️⃣ Setup Backend
```bash
cd backend
npm install
```

#### 3️⃣ Start Both Servers

**Option A - Windows (Recommended)**
```bash
# Terminal 1: Start Frontend
npm run dev

# Terminal 2: Start Backend
./start-backend.bat
```

**Option B - Mac/Linux**
```bash
# Terminal 1: Start Frontend
npm run dev

# Terminal 2: Start Backend
cd backend && npm start
```

**Access the Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

---

## 🎯 Features

### 👨‍🌾 For Farmers
- ✅ Browse available agricultural lands
- ✅ Direct contact with landowners
- ✅ AI-powered crop yield predictions
- ✅ Smart pest control marketplace
- ✅ Weather & soil analysis

### 🏡 For Landowners
- ✅ Create & manage land listings
- ✅ Share contact information securely
- ✅ Update land status & details
- ✅ Track farmer inquiries

### 🛒 Pest Control Store
- ✅ Filter by product category (Organic, Chemical, Botanical, Biological)
- ✅ Shopping cart management
- ✅ Order placement & tracking
- ✅ Detailed product information

### 🌱 Crop Prediction System
- ✅ AI-powered yield forecasting
- ✅ Real-time weather integration
- ✅ Soil condition analysis
- ✅ Farm planning tools

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Express.js, Node.js |
| **Database** | MongoDB, Supabase (PostgreSQL) |
| **Authentication** | JWT, Role-based access control |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
main/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   ├── contexts/                # Auth & global state
│   ├── api/                     # API integration
│   ├── lib/                     # Utilities (Supabase, MongoDB)
│   └── types/                   # TypeScript definitions
├── backend/                     # Express.js backend
│   ├── routes/                  # API routes
│   ├── models/                  # Database models
│   ├── middleware/              # Auth middleware
│   ├── config/                  # Database config
│   └── server.js               # Entry point
├── supabase/                    # Database migrations
└── crop-main/                   # Additional crop module
```

---

## 🔧 Environment Configuration

### Frontend Setup
Create `.env` in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
VITE_API_BASE_URL=http://localhost:8000
```

### Backend Setup
Create `.env` in the `backend/` directory:
```env
MONGODB_URI=your_mongodb_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
PORT=8000
```

---

## 📋 Available Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend
```bash
npm start            # Start server
npm run dev          # Start with nodemon
```

---

## 🚀 Deployment

### Frontend
Deploy to **Vercel** or **Netlify**:
```bash
npm run build
# Upload the dist/ folder
```

### Backend
Deploy to **Railway**, **Render**, or **Heroku**:
- Push code to GitHub
- Connect repository to deployment platform
- Set environment variables
- Deploy

---

## 👥 User Roles

### Farmer Login Flow
1. Select "I'm a Farmer" on welcome page
2. Sign up or login
3. Access farmer dashboard
4. Browse lands, use store, check predictions

### Landowner Login Flow
1. Select "I'm a Landowner" on welcome page
2. Sign up or login
3. Access landowner dashboard
4. Create & manage land listings

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 already in use | Change port: `npm run dev -- --port 3000` |
| Port 8000 already in use | Edit `backend/server.js` PORT variable |
| MongoDB connection error | Check MongoDB URI in `.env` |
| Supabase auth error | Verify API keys in `.env` |
| Dependencies not installing | Delete `node_modules` & run `npm install` again |

---

## 📚 Documentation

- [Frontend Setup Guide](./QUICK_START.md)
- [Backend Configuration](./backend/README.md)
- [Database Migrations](./supabase/)
- [Hackathon Details](./HACKATHON_README.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Issues

- 🐛 [Report a bug](https://github.com/your-repo/issues)
- 💡 [Request a feature](https://github.com/your-repo/issues)
- 💬 [Start a discussion](https://github.com/your-repo/discussions)

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [MongoDB Manual](https://docs.mongodb.com)

---

**Smart Kisan** - Revolutionizing agriculture through technology! 🌾✨

