const Score = require('../models/Score');
const Player = require('../models/Player');

// @desc    Submit a new score
// @route   POST /api/scores
// @access  Public
exports.submitScore = async (req, res, next) => {
  try {
    const { playerId, score, blocksCleared, level, gameDuration } = req.body;
    
    // Check if player exists
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    // Create score record
    const newScore = await Score.create({
      player: playerId,
      score,
      blocksCleared,
      level,
      gameDuration
    });
    
    // Update player statistics
    player.gamesPlayed += 1;
    player.totalScore += score;
    player.lastPlayed = new Date();
    
    // Update high score if necessary
    if (score > player.highScore) {
      player.highScore = score;
    }
    
    await player.save();
    
    res.status(201).json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        score: newScore,
        player: {
          id: player._id,
          name: player.name,
          highScore: player.highScore,
          gamesPlayed: player.gamesPlayed
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all scores for a player
// @route   GET /api/scores/player/:playerId
// @access  Public
exports.getPlayerScores = async (req, res, next) => {
  try {
    const scores = await Score.find({ player: req.params.playerId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get player's recent scores
// @route   GET /api/scores/player/:playerId/recent
// @access  Public
exports.getRecentScores = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const scores = await Score.find({ player: req.params.playerId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get player's best scores
// @route   GET /api/scores/player/:playerId/best
// @access  Public
exports.getBestScores = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const scores = await Score.find({ player: req.params.playerId })
      .sort({ score: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all scores (admin)
// @route   GET /api/scores
// @access  Public
exports.getAllScores = async (req, res, next) => {
  try {
    const scores = await Score.find()
      .populate('player', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.status(200).json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    next(error);
  }
};
