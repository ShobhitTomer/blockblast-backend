const Player = require('../models/Player');

// @desc    Get top 5 players globally by high score
// @route   GET /api/leaderboard/top
// @access  Public
exports.getTopPlayers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const topPlayers = await Player.find()
      .sort({ highScore: -1 })
      .limit(limit)
      .select('name email profilePicture highScore gamesPlayed totalScore');
    
    // Add rank to each player
    const playersWithRank = topPlayers.map((player, index) => ({
      rank: index + 1,
      ...player.toObject()
    }));
    
    res.status(200).json({
      success: true,
      count: playersWithRank.length,
      data: playersWithRank
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's rank and statistics
// @route   GET /api/leaderboard/rank/:playerId
// @access  Public
exports.getPlayerRank = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.playerId);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }
    
    // Count players with higher scores
    const rank = await Player.countDocuments({
      highScore: { $gt: player.highScore }
    }) + 1;
    
    // Get total players
    const totalPlayers = await Player.countDocuments();
    
    // Get players around the current player's rank
    const playersAbove = await Player.find({
      highScore: { $gt: player.highScore }
    })
      .sort({ highScore: -1 })
      .limit(2)
      .select('name profilePicture highScore');
    
    const playersBelow = await Player.find({
      highScore: { $lt: player.highScore }
    })
      .sort({ highScore: -1 })
      .limit(2)
      .select('name profilePicture highScore');
    
    res.status(200).json({
      success: true,
      data: {
        player: {
          id: player._id,
          name: player.name,
          email: player.email,
          profilePicture: player.profilePicture,
          highScore: player.highScore,
          gamesPlayed: player.gamesPlayed,
          totalScore: player.totalScore,
          averageScore: player.averageScore
        },
        rank,
        totalPlayers,
        percentile: totalPlayers > 0 ? Math.round(((totalPlayers - rank + 1) / totalPlayers) * 100) : 100,
        nearbyPlayers: {
          above: playersAbove.reverse(),
          below: playersBelow
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get total player count in the system
// @route   GET /api/leaderboard/stats
// @access  Public
exports.getLeaderboardStats = async (req, res, next) => {
  try {
    const totalPlayers = await Player.countDocuments();
    const totalGamesPlayed = await Player.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$gamesPlayed' }
        }
      }
    ]);
    
    const highestScore = await Player.findOne()
      .sort({ highScore: -1 })
      .select('name profilePicture highScore');
    
    res.status(200).json({
      success: true,
      data: {
        totalPlayers,
        totalGamesPlayed: totalGamesPlayed[0]?.total || 0,
        topPlayer: highestScore
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full leaderboard with pagination
// @route   GET /api/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const players = await Player.find()
      .sort({ highScore: -1 })
      .skip(skip)
      .limit(limit)
      .select('name email profilePicture highScore gamesPlayed totalScore');
    
    const totalPlayers = await Player.countDocuments();
    
    // Add rank to each player
    const playersWithRank = players.map((player, index) => ({
      rank: skip + index + 1,
      ...player.toObject()
    }));
    
    res.status(200).json({
      success: true,
      count: playersWithRank.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalPlayers / limit),
        totalPlayers
      },
      data: playersWithRank
    });
  } catch (error) {
    next(error);
  }
};
