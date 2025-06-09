const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lorRequestSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  university: {
    type: String,
    required: true,
    trim: true
  },
  program: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  templateUsed: {
    type: Schema.Types.ObjectId,
    ref: 'LORTemplate'
  },
  generatedContent: {
    type: String,
    required: true
  },
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiRecommendations: [{
    type: String
  }],
  metadata: {
    letterFormat: String,
    wordCount: Number,
    toneScore: Number
  }
}, { timestamps: true });

// Pre-save middleware to calculate word count
lorRequestSchema.pre('save', function(next) {
  if (this.isModified('generatedContent')) {
    // Calculate word count
    const wordCount = this.generatedContent.split(/\s+/).length;
    
    if (!this.metadata) {
      this.metadata = {};
    }
    
    this.metadata.wordCount = wordCount;
  }
  next();
});

module.exports = mongoose.model('LORRequest', lorRequestSchema);