const express = require('express');
const router = express.Router();
const {
  getAllPlayers,
  getPlayerById,
  getPlayerByEmail,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayerStats
} = require('../controllers/playerController');
const { validate, createPlayerSchema, updatePlayerSchema } = require('../middleware/validation');

// Player CRUD routes
router.get('/', getAllPlayers);
router.get('/:id', getPlayerById);
router.get('/email/:email', getPlayerByEmail);
router.post('/', validate(createPlayerSchema), createPlayer);
router.put('/:id', validate(updatePlayerSchema), updatePlayer);
router.delete('/:id', deletePlayer);

// Player stats route
router.get('/:id/stats', getPlayerStats);

module.exports = router;
