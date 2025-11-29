const Player = require('../models/Player');

// @desc    Get all players
// @route   GET /api/players
// @access  Public
exports.getAllPlayers = async (req, res, next) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single player by ID
// @route   GET /api/players/:id
// @access  Public
exports.getPlayerById = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: player
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get player by email
// @route   GET /api/players/email/:email
// @access  Public
exports.getPlayerByEmail = async (req, res, next) => {
  try {
    const player = await Player.findOne({ email: req.params.email });
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: player
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new player
// @route   POST /api/players
// @access  Public
exports.createPlayer = async (req, res, next) => {
  try {
    const player = await Player.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Player created successfully',
      data: player
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update player
// @route   PUT /api/players/:id
// @access  Public
exports.updatePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Player updated successfully',
      data: player
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Public
exports.deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Player deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get player statistics
// @route   GET /api/players/:id/stats
// @access  Public
exports.getPlayerStats = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    const stats = {
      name: player.name,
      email: player.email,
      profilePicture: player.profilePicture,
      gamesPlayed: player.gamesPlayed,
      highScore: player.highScore,
      totalScore: player.totalScore,
      averageScore: player.averageScore,
      lastPlayed: player.lastPlayed,
      memberSince: player.createdAt
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
