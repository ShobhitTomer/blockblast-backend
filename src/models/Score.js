const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: [true, 'Player reference is required']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  },
  blocksCleared: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  gameDuration: {
    type: Number, // in seconds
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
scoreSchema.index({ player: 1, createdAt: -1 });
scoreSchema.index({ score: -1 });

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;
