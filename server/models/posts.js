const mongoose = require('mongoose')

// Comment schema
const CommentSchema = mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  }
})

// Posts schema with indexes
const PostsSchema = mongoose.Schema({
  dishName: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    required: true,
  },
  dishImage: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
  },
  datePosted: {
    type: Date,
    default: Date.now,
    index: true, // Index on datePosted
  },
  postOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index on postOwner
  },
  hearts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [CommentSchema]
})

// Additional index on hearts (array field)
PostsSchema.index({ hearts: 1 })

module.exports = mongoose.model('Posts', PostsSchema)
