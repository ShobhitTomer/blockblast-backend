const express = require('express');
const router = express.Router();
const {
  submitScore,
  getPlayerScores,
  getRecentScores,
  getBestScores,
  getAllScores
} = require('../controllers/scoreController');
const { validate, submitScoreSchema } = require('../middleware/validation');

// Score routes
router.post('/', validate(submitScoreSchema), submitScore);
router.get('/', getAllScores);
router.get('/player/:playerId', getPlayerScores);
router.get('/player/:playerId/recent', getRecentScores);
router.get('/player/:playerId/best', getBestScores);

module.exports = router;
