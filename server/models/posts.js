const mongoose = require('mongoose')

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
  }
})

module.exports = mongoose.model('Posts', PostsSchema)