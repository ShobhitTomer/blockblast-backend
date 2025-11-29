# Block Blast API Integration Guide

This guide will help you integrate the Block Blast backend API into your game client (web, mobile, or desktop).

## 🚀 Quick Start

### Base URL

```
Development:
Production: https://blockblast-backend.vercel.app/
```

### Headers

All requests should include:

```javascript
{
  'Content-Type': 'application/json'
}
```

---

## 📱 Integration Flow

### 1. Player Registration/Login Flow

Since authentication is not yet implemented, you'll use a simple flow:

```javascript
// Step 1: Check if player exists by email
async function getOrCreatePlayer(name, email, profilePicture = null) {
  try {
    // Try to get existing player
    const response = await fetch(
      `https://blockblast-backend.vercel.app/api/players/email/${encodeURIComponent(
        email
      )}`
    );

    if (response.ok) {
      const data = await response.json();
      return data.data; // Player exists
    }

    // Player doesn't exist, create new one
    if (response.status === 404) {
      const createResponse = await fetch(
        "https://blockblast-backend.vercel.app/api/players",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            profilePicture,
          }),
        }
      );

      const createData = await createResponse.json();
      return createData.data;
    }

    throw new Error("Failed to get or create player");
  } catch (error) {
    console.error("Error in getOrCreatePlayer:", error);
    throw error;
  }
}

// Usage
const player = await getOrCreatePlayer("John Doe", "john@example.com");
console.log("Player ID:", player._id);
// Store player._id in localStorage or session storage
localStorage.setItem("playerId", player._id);
```

---

## 🎮 Game Integration

### 2. Starting a Game Session

When a player starts playing:

```javascript
async function startGame() {
  const playerId = localStorage.getItem("playerId");

  if (!playerId) {
    console.error("No player found. Please create/login first.");
    return;
  }

  // Optional: Fetch current player stats to show on game start
  const stats = await getPlayerStats(playerId);
  console.log("Current High Score:", stats.highScore);
  console.log("Games Played:", stats.gamesPlayed);

  // Initialize game with player data
  return {
    playerId,
    currentHighScore: stats.highScore,
  };
}

async function getPlayerStats(playerId) {
  const response = await fetch(
    `http://localhost:5000/api/players/${playerId}/stats`
  );
  const data = await response.json();
  return data.data;
}
```

### 3. Submitting Score After Game Ends

When a game session ends:

```javascript
async function submitGameScore(scoreData) {
  const playerId = localStorage.getItem("playerId");

  if (!playerId) {
    throw new Error("No player ID found");
  }

  try {
    const response = await fetch("http://localhost:5000/api/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerId: playerId,
        score: scoreData.finalScore,
        blocksCleared: scoreData.blocksCleared || 0,
        level: scoreData.level || 1,
        gameDuration: scoreData.duration || 0, // in seconds
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("Score submitted successfully!");
      console.log("New High Score:", result.data.player.highScore);
      console.log("Total Games Played:", result.data.player.gamesPlayed);

      // Check if it's a new high score
      if (result.data.score.score === result.data.player.highScore) {
        showNewHighScoreAnimation();
      }

      return result.data;
    }
  } catch (error) {
    console.error("Error submitting score:", error);
    throw error;
  }
}

// Usage example - called when game ends
const gameResult = {
  finalScore: 15000,
  blocksCleared: 150,
  level: 10,
  duration: 300, // 5 minutes
};

const scoreResult = await submitGameScore(gameResult);
```

### 4. Displaying Leaderboard

Show the top players:

```javascript
async function getTopPlayers(limit = 5) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/leaderboard/top?limit=${limit}`
    );
    const data = await response.json();

    return data.data; // Array of top players with rank
  } catch (error) {
    console.error("Error fetching top players:", error);
    return [];
  }
}

// Display leaderboard in your UI
async function displayLeaderboard() {
  const topPlayers = await getTopPlayers(5);

  topPlayers.forEach((player, index) => {
    console.log(`${player.rank}. ${player.name} - ${player.highScore} points`);
  });

  return topPlayers;
}
```

### 5. Getting Player's Rank

Show where the current player ranks:

```javascript
async function getMyRank() {
  const playerId = localStorage.getItem("playerId");

  if (!playerId) {
    return null;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/leaderboard/rank/${playerId}`
    );
    const data = await response.json();

    const rankInfo = data.data;

    console.log("Your Rank:", rankInfo.rank);
    console.log("Total Players:", rankInfo.totalPlayers);
    console.log("Percentile:", rankInfo.percentile + "%");
    console.log("Players Above:", rankInfo.nearbyPlayers.above);
    console.log("Players Below:", rankInfo.nearbyPlayers.below);

    return rankInfo;
  } catch (error) {
    console.error("Error fetching rank:", error);
    return null;
  }
}
```

### 6. Getting Player's Game History

Show recent or best scores:

```javascript
async function getRecentGames(limit = 10) {
  const playerId = localStorage.getItem("playerId");

  const response = await fetch(
    `http://localhost:5000/api/scores/player/${playerId}/recent?limit=${limit}`
  );
  const data = await response.json();

  return data.data;
}

async function getBestGames(limit = 10) {
  const playerId = localStorage.getItem("playerId");

  const response = await fetch(
    `http://localhost:5000/api/scores/player/${playerId}/best?limit=${limit}`
  );
  const data = await response.json();

  return data.data;
}
```

---

## 🎯 Complete Game Integration Example

Here's a complete example integrating all features:

```javascript
// ==========================================
// Block Blast API Client
// ==========================================

class BlockBlastAPI {
  constructor(baseURL = "http://localhost:5000") {
    this.baseURL = baseURL;
    this.playerId = localStorage.getItem("playerId");
  }

  // Helper method for API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // ========== Player Management ==========

  async getOrCreatePlayer(name, email, profilePicture = null) {
    try {
      // Try to get existing player
      const data = await this.request(
        `/api/players/email/${encodeURIComponent(email)}`
      );
      this.playerId = data.data._id;
      localStorage.setItem("playerId", this.playerId);
      return data.data;
    } catch (error) {
      // Player doesn't exist, create new one
      const data = await this.request("/api/players", {
        method: "POST",
        body: JSON.stringify({ name, email, profilePicture }),
      });
      this.playerId = data.data._id;
      localStorage.setItem("playerId", this.playerId);
      return data.data;
    }
  }

  async getPlayerStats() {
    if (!this.playerId) throw new Error("No player ID");
    const data = await this.request(`/api/players/${this.playerId}/stats`);
    return data.data;
  }

  async updatePlayer(updates) {
    if (!this.playerId) throw new Error("No player ID");
    const data = await this.request(`/api/players/${this.playerId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return data.data;
  }

  // ========== Score Management ==========

  async submitScore(score, blocksCleared = 0, level = 1, gameDuration = 0) {
    if (!this.playerId) throw new Error("No player ID");

    const data = await this.request("/api/scores", {
      method: "POST",
      body: JSON.stringify({
        playerId: this.playerId,
        score,
        blocksCleared,
        level,
        gameDuration,
      }),
    });

    return data.data;
  }

  async getRecentScores(limit = 10) {
    if (!this.playerId) throw new Error("No player ID");
    const data = await this.request(
      `/api/scores/player/${this.playerId}/recent?limit=${limit}`
    );
    return data.data;
  }

  async getBestScores(limit = 10) {
    if (!this.playerId) throw new Error("No player ID");
    const data = await this.request(
      `/api/scores/player/${this.playerId}/best?limit=${limit}`
    );
    return data.data;
  }

  // ========== Leaderboard ==========

  async getTopPlayers(limit = 5) {
    const data = await this.request(`/api/leaderboard/top?limit=${limit}`);
    return data.data;
  }

  async getMyRank() {
    if (!this.playerId) throw new Error("No player ID");
    const data = await this.request(`/api/leaderboard/rank/${this.playerId}`);
    return data.data;
  }

  async getLeaderboard(page = 1, limit = 10) {
    const data = await this.request(
      `/api/leaderboard?page=${page}&limit=${limit}`
    );
    return data.data;
  }

  async getLeaderboardStats() {
    const data = await this.request("/api/leaderboard/stats");
    return data.data;
  }
}

// ==========================================
// Usage in Your Game
// ==========================================

// Initialize the API client
const api = new BlockBlastAPI();

// On app start or login
async function initializePlayer() {
  try {
    const player = await api.getOrCreatePlayer(
      "John Doe",
      "john@example.com",
      "https://example.com/avatar.jpg"
    );

    console.log("Player initialized:", player);
    return player;
  } catch (error) {
    console.error("Failed to initialize player:", error);
  }
}

// When game starts
async function onGameStart() {
  try {
    const stats = await api.getPlayerStats();

    // Update UI with player stats
    document.getElementById("highScore").textContent = stats.highScore;
    document.getElementById("gamesPlayed").textContent = stats.gamesPlayed;

    return stats;
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
}

// When game ends
async function onGameEnd(finalScore, blocksCleared, level, duration) {
  try {
    const result = await api.submitScore(
      finalScore,
      blocksCleared,
      level,
      duration
    );

    // Check if new high score
    if (finalScore === result.player.highScore) {
      showNewHighScoreNotification(finalScore);
    }

    // Update UI with new stats
    updateStatsUI(result.player);

    // Optionally load and display leaderboard
    await loadLeaderboard();

    return result;
  } catch (error) {
    console.error("Failed to submit score:", error);
  }
}

// Display leaderboard
async function loadLeaderboard() {
  try {
    // Get top 5 players
    const topPlayers = await api.getTopPlayers(5);

    // Get current player's rank
    const myRank = await api.getMyRank();

    // Update leaderboard UI
    displayLeaderboardUI(topPlayers, myRank);

    return { topPlayers, myRank };
  } catch (error) {
    console.error("Failed to load leaderboard:", error);
  }
}

// Display player profile
async function loadPlayerProfile() {
  try {
    const stats = await api.getPlayerStats();
    const recentGames = await api.getRecentScores(5);
    const bestGames = await api.getBestScores(5);
    const rank = await api.getMyRank();

    displayProfileUI({
      stats,
      recentGames,
      bestGames,
      rank,
    });
  } catch (error) {
    console.error("Failed to load profile:", error);
  }
}

// Update player profile picture
async function updateProfilePicture(newPictureUrl) {
  try {
    const updatedPlayer = await api.updatePlayer({
      profilePicture: newPictureUrl,
    });

    console.log("Profile updated:", updatedPlayer);
    return updatedPlayer;
  } catch (error) {
    console.error("Failed to update profile:", error);
  }
}
```

---

## 🎨 UI Integration Examples

### Example: Leaderboard Component (HTML/JS)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Block Blast Leaderboard</title>
    <style>
      .leaderboard {
        max-width: 600px;
        margin: 20px auto;
        font-family: Arial, sans-serif;
      }
      .player-row {
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #ddd;
      }
      .rank {
        font-weight: bold;
        margin-right: 15px;
        font-size: 1.2em;
      }
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 15px;
      }
      .player-info {
        flex: 1;
      }
      .score {
        font-weight: bold;
        color: #4caf50;
      }
      .current-player {
        background-color: #fff9c4;
      }
    </style>
  </head>
  <body>
    <div class="leaderboard">
      <h2>🏆 Top Players</h2>
      <div id="leaderboard-container"></div>

      <h3>Your Rank</h3>
      <div id="my-rank-container"></div>
    </div>

    <script src="blockblast-api.js"></script>
    <script>
      const api = new BlockBlastAPI();

      async function displayLeaderboard() {
        const container = document.getElementById("leaderboard-container");
        const myRankContainer = document.getElementById("my-rank-container");

        try {
          // Get top players
          const topPlayers = await api.getTopPlayers(5);

          container.innerHTML = topPlayers
            .map(
              (player) => `
          <div class="player-row">
            <div class="rank">${player.rank}</div>
            <img class="avatar" src="${player.profilePicture}" alt="${
                player.name
              }">
            <div class="player-info">
              <div class="name">${player.name}</div>
              <div class="games">Games: ${player.gamesPlayed}</div>
            </div>
            <div class="score">${player.highScore.toLocaleString()}</div>
          </div>
        `
            )
            .join("");

          // Get and display current player's rank
          const myRank = await api.getMyRank();

          myRankContainer.innerHTML = `
          <div class="player-row current-player">
            <div class="rank">#${myRank.rank}</div>
            <img class="avatar" src="${myRank.player.profilePicture}" alt="${
            myRank.player.name
          }">
            <div class="player-info">
              <div class="name">${myRank.player.name} (You)</div>
              <div class="games">Games: ${myRank.player.gamesPlayed}</div>
              <div>Top ${myRank.percentile}% of all players</div>
            </div>
            <div class="score">${myRank.player.highScore.toLocaleString()}</div>
          </div>
        `;
        } catch (error) {
          console.error("Error displaying leaderboard:", error);
        }
      }

      // Load on page load
      displayLeaderboard();
    </script>
  </body>
</html>
```

---

## 📊 Response Examples

### Player Object

```json
{
  "success": true,
  "data": {
    "_id": "6478a5b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "profilePicture": "https://example.com/avatar.jpg",
    "gamesPlayed": 25,
    "highScore": 15000,
    "totalScore": 250000,
    "averageScore": 10000,
    "lastPlayed": "2025-11-29T10:30:00.000Z",
    "createdAt": "2025-11-20T08:00:00.000Z",
    "updatedAt": "2025-11-29T10:30:00.000Z"
  }
}
```

### Score Submission Response

```json
{
  "success": true,
  "message": "Score submitted successfully",
  "data": {
    "score": {
      "_id": "647xyz123",
      "player": "6478a5b2c3d4e5f6g7h8i9j0",
      "score": 15000,
      "blocksCleared": 150,
      "level": 10,
      "gameDuration": 300,
      "createdAt": "2025-11-29T10:30:00.000Z"
    },
    "player": {
      "id": "6478a5b2c3d4e5f6g7h8i9j0",
      "name": "John Doe",
      "highScore": 15000,
      "gamesPlayed": 26
    }
  }
}
```

### Leaderboard Response

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "rank": 1,
      "_id": "647abc",
      "name": "Alice",
      "email": "alice@example.com",
      "profilePicture": "https://example.com/alice.jpg",
      "highScore": 25000,
      "gamesPlayed": 50,
      "totalScore": 500000
    },
    {
      "rank": 2,
      "name": "Bob",
      "highScore": 22000,
      "gamesPlayed": 45
    }
  ]
}
```

### Player Rank Response

```json
{
  "success": true,
  "data": {
    "player": {
      "id": "6478a5b2c3d4e5f6g7h8i9j0",
      "name": "John Doe",
      "email": "john@example.com",
      "highScore": 15000,
      "gamesPlayed": 26
    },
    "rank": 15,
    "totalPlayers": 100,
    "percentile": 86,
    "nearbyPlayers": {
      "above": [
        { "name": "Player13", "highScore": 15500 },
        { "name": "Player14", "highScore": 15200 }
      ],
      "below": [
        { "name": "Player16", "highScore": 14800 },
        { "name": "Player17", "highScore": 14500 }
      ]
    }
  }
}
```

---

## 🔧 Error Handling

Always wrap API calls in try-catch blocks:

```javascript
async function safeAPICall() {
  try {
    const result = await api.submitScore(1000, 10, 1, 60);
    return result;
  } catch (error) {
    // Handle different error types
    if (error.message.includes("Player not found")) {
      // Redirect to registration
      console.log("Please create a player first");
    } else if (error.message.includes("Validation error")) {
      // Show validation errors
      console.log("Invalid data provided");
    } else {
      // Generic error
      console.log("Something went wrong. Please try again.");
    }

    // Optionally show user-friendly error message
    showErrorNotification(error.message);
  }
}
```

---

## 🎮 Platform-Specific Integration

### Web (Browser)

Use the JavaScript API client above with `fetch` or `axios`.

### Unity (C#)

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class BlockBlastAPI : MonoBehaviour
{
    private string baseURL = "http://localhost:5000";

    public IEnumerator SubmitScore(string playerId, int score)
    {
        string json = JsonUtility.ToJson(new ScoreData {
            playerId = playerId,
            score = score
        });

        using (UnityWebRequest request = UnityWebRequest.Post(baseURL + "/api/scores", json, "application/json"))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Score submitted: " + request.downloadHandler.text);
            }
        }
    }
}

[System.Serializable]
public class ScoreData
{
    public string playerId;
    public int score;
}
```

### React Native

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = new BlockBlastAPI();

async function submitScore(score) {
  const playerId = await AsyncStorage.getItem("playerId");
  return api.submitScore(score, 0, 1, 0);
}
```

---

## 🚀 Next Steps

1. **Start the backend**: Run `npm run dev`
2. **Test with Postman or curl**: Verify endpoints work
3. **Integrate into your game**: Use the API client class
4. **Add authentication**: When ready, we'll add JWT tokens
5. **Deploy**: Move to production with environment variables

---

## 📞 Support

If you encounter any issues:

1. Check server is running (`npm run dev`)
2. Check MongoDB is running
3. Verify API endpoint URLs
4. Check browser console for errors
5. Check server logs for error messages

Happy coding! 🎮✨
