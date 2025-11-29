const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Player name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  profilePicture: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  gamesPlayed: {
    type: Number,
    default: 0,
    min: 0
  },
  highScore: {
    type: Number,
    default: 0,
    min: 0
  },
  totalScore: {
    type: Number,
    default: 0,
    min: 0
  },
  lastPlayed: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster leaderboard queries
playerSchema.index({ highScore: -1 });
playerSchema.index({ email: 1 });

// Virtual for average score
playerSchema.virtual('averageScore').get(function() {
  return this.gamesPlayed > 0 ? Math.round(this.totalScore / this.gamesPlayed) : 0;
});

// Ensure virtuals are included in JSON
playerSchema.set('toJSON', { virtuals: true });
playerSchema.set('toObject', { virtuals: true });

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
