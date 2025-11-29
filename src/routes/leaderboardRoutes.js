const express = require('express');
const router = express.Router();
const {
  getTopPlayers,
  getPlayerRank,
  getLeaderboardStats,
  getLeaderboard
} = require('../controllers/leaderboardController');

// Leaderboard routes
router.get('/', getLeaderboard);
router.get('/top', getTopPlayers);
router.get('/rank/:playerId', getPlayerRank);
router.get('/stats', getLeaderboardStats);

module.exports = router;
