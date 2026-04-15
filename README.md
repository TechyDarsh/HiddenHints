# Smart Product Intelligence System (SPIS)

A full-stack MERN application for managing product data and providing instant product intelligence through QR/barcode scanning with text-to-speech feedback.

## Features

### Admin Dashboard
- JWT-based authentication with role-based access
- Full CRUD operations for products
- Auto-generated QR codes with PNG export
- Bulk CSV product upload
- Smart search across name, brand, code, category

### Product Scanner
- Camera-based QR/barcode scanning (html5-qrcode)
- External scanner support (USB/Bluetooth keyboard mode)
- Offline product caching
- Scan history tracking

### Voice Output (Text-to-Speech)
- Automatic product readout on scan
- Multi-language: English + Tamil
- Play/Pause/Stop controls
- Speed & voice selection
- Smart formatting for human-friendly sentences

### Smart Alerts
- Expired product detection with visual + voice warnings
- Allergen highlighting
- Harmful ingredient analysis (AI)
- Expiring-soon notifications

### Analytics
- Total products & scan counts
- Most scanned products leaderboard
- Category distribution
- Expired/expiring product tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v7 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Scanner | html5-qrcode |
| QR Gen | qrcode |
| TTS | Web Speech API |
| Icons | react-icons |
| Dates | date-fns |

## Project Structure

```
QR-Based(System)/
├── server/             # Backend API
│   ├── config/         # DB configuration
│   ├── middleware/      # Auth middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── server.js       # Entry point
│   └── seed.js         # Database seeder
│
├── client/             # React frontend
│   ├── public/
│   └── src/
│       ├── api/        # Axios instance
│       ├── components/ # Reusable components
│       │   ├── Layout/
│       │   ├── Product/
│       │   ├── Scanner/
│       │   └── Voice/
│       ├── context/    # Auth context
│       ├── pages/      # Page components
│       └── utils/      # Speech, cache utilities
│
└── README.md
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spis
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

### 3. Seed Database

```bash
cd server
npm run seed
```

This creates:
- Admin user: `admin@spis.com` / `admin123`
- 6 sample products (including an expired one for testing)

### 4. Run Development

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/auth/me | Current user | Token |
| GET | /api/products | List all products | Public |
| GET | /api/products/scan/:code | Scan lookup | Public |
| GET | /api/products/:id | Get by ID | Public |
| POST | /api/products | Create product | Admin |
| PUT | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Delete product | Admin |
| POST | /api/products/bulk | CSV upload | Admin |
| GET | /api/analytics/overview | Analytics data | Admin |

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
```

### Backend (Render/Railway)
Deploy the `server/` directory with:
- Start command: `npm start`
- Environment variables from `.env`

### Database
Use MongoDB Atlas for production.

## License

MIT
