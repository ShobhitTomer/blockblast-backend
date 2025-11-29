const Joi = require('joi');

// Player validation schemas
const createPlayerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  profilePicture: Joi.string().uri().optional()
});

const updatePlayerSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  profilePicture: Joi.string().uri().optional()
});

// Score validation schemas
const submitScoreSchema = Joi.object({
  playerId: Joi.string().required(),
  score: Joi.number().min(0).required(),
  blocksCleared: Joi.number().min(0).optional(),
  level: Joi.number().min(1).optional(),
  gameDuration: Joi.number().min(0).optional()
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  createPlayerSchema,
  updatePlayerSchema,
  submitScoreSchema
};
