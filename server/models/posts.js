const mongoose = require('mongoose')

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

const PostsSchema = mongoose.Schema ({
  dishName: {
    type: String,
    required: true,
  }, 
  ingredients: {
    type: String,
    required: true,
  },
  dishImage: {
    type: String
  },
  status: {
    type: String,
    default: "pending"
  },
  datePosted: {
    type: Date, 
    default: Date.now 
  },
  postOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hearts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [CommentSchema]
})

module.exports = mongoose.model('Posts', PostsSchema)