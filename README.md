# Block Blast Backend API

A RESTful API backend for the Block Blast game, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Player Management (CRUD)**: Create, read, update, and delete player profiles
- **Score Submission**: Submit and track game scores
- **Leaderboard System**: Global rankings with top players, user rank, and statistics
- **Player Statistics**: Track games played, high scores, average scores, and more
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **Input Validation**: Request validation using Joi
- **Error Handling**: Centralized error handling middleware
- **Security**: Helmet.js for security headers
- **CORS Enabled**: Cross-origin resource sharing support

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

   - Copy `.env.example` to `.env`
   - Update MongoDB URI if needed

3. Start MongoDB locally:

```bash
# Make sure MongoDB is running on localhost:27017
```

4. Start the server:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Players

| Method | Endpoint                    | Description           |
| ------ | --------------------------- | --------------------- |
| GET    | `/api/players`              | Get all players       |
| GET    | `/api/players/:id`          | Get player by ID      |
| GET    | `/api/players/email/:email` | Get player by email   |
| POST   | `/api/players`              | Create new player     |
| PUT    | `/api/players/:id`          | Update player         |
| DELETE | `/api/players/:id`          | Delete player         |
| GET    | `/api/players/:id/stats`    | Get player statistics |

### Scores

| Method | Endpoint                              | Description                 |
| ------ | ------------------------------------- | --------------------------- |
| POST   | `/api/scores`                         | Submit a new score          |
| GET    | `/api/scores`                         | Get all scores              |
| GET    | `/api/scores/player/:playerId`        | Get all scores for a player |
| GET    | `/api/scores/player/:playerId/recent` | Get recent scores           |
| GET    | `/api/scores/player/:playerId/best`   | Get best scores             |

### Leaderboard

| Method | Endpoint                          | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/api/leaderboard`                | Get full leaderboard (paginated)     |
| GET    | `/api/leaderboard/top`            | Get top 5 players                    |
| GET    | `/api/leaderboard/rank/:playerId` | Get player's rank and nearby players |
| GET    | `/api/leaderboard/stats`          | Get global statistics                |

### Health & Info

| Method | Endpoint  | Description     |
| ------ | --------- | --------------- |
| GET    | `/`       | API information |
| GET    | `/health` | Health check    |

## 📝 API Usage Examples

### Create a Player

```bash
POST /api/players
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "profilePicture": "https://example.com/avatar.jpg"
}
```

### Submit a Score

```bash
POST /api/scores
Content-Type: application/json

{
  "playerId": "6478a5b2c3d4e5f6g7h8i9j0",
  "score": 15000,
  "blocksCleared": 150,
  "level": 10,
  "gameDuration": 300
}
```

### Get Top 5 Players

```bash
GET /api/leaderboard/top
```

### Get Player Rank

```bash
GET /api/leaderboard/rank/:playerId
```

## 🗂️ Project Structure

```
blockblast-backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── playerController.js   # Player logic
│   │   ├── scoreController.js    # Score logic
│   │   └── leaderboardController.js # Leaderboard logic
│   ├── middleware/
│   │   ├── errorHandler.js       # Error handling
│   │   └── validation.js         # Request validation
│   ├── models/
│   │   ├── Player.js             # Player schema
│   │   └── Score.js              # Score schema
│   ├── routes/
│   │   ├── playerRoutes.js       # Player endpoints
│   │   ├── scoreRoutes.js        # Score endpoints
│   │   └── leaderboardRoutes.js  # Leaderboard endpoints
│   └── server.js                 # Main application file
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore file
└── package.json                  # Dependencies
```

## 🔒 Data Models

### Player Model

- name (String, required)
- email (String, required, unique)
- profilePicture (String, optional)
- gamesPlayed (Number, default: 0)
- highScore (Number, default: 0)
- totalScore (Number, default: 0)
- lastPlayed (Date)
- createdAt (Date)
- updatedAt (Date)

### Score Model

- player (ObjectId, ref: Player)
- score (Number, required)
- blocksCleared (Number)
- level (Number)
- gameDuration (Number, in seconds)
- createdAt (Date)

## 🚀 Next Steps

- Add authentication system (JWT, OAuth)
- Implement rate limiting
- Add caching with Redis
- Add WebSocket support for real-time leaderboard updates
- Add data analytics endpoints
- Implement friend system and friend leaderboards

## 📄 License

ISC

## 👨‍💻 Author

Block Blast Development Team
