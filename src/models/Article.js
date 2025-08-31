const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }]
}, {
  timestamps: true
});

// Populate author and tags by default
articleSchema.pre(/^find/, function(next) {
  this.populate('author', 'username email bio avatar')
       .populate('tags', 'name description');
  next();
});

module.exports = mongoose.model('Article', articleSchema);
