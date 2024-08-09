const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const logger = require('./logger/logger')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
dotenv.config()

// Import the connectDB function to establish a connection with MongoDB
const connectDB = require('./db/connect')

// Import routes
const auth = require('./router/auth')
const user = require('./router/user')
const recipe = require('./router/recipe')
const posts = require('./router/posts')
const token = require('./router/token')

const app = express()

const corsOptions = {
  origin: 'http://localhost:5173', // replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
app.use(cookieParser())

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/auth', auth)
app.use('/user', user)
app.use('/recipe', recipe)
app.use('/posts', posts)
app.use('/token', token)

const port = process.env.PORT || 5000

const start = async() => {
  try {
    await connectDB(process.env.MONGO_URI)

    app.listen(port, () => {
      logger.info(`Server is now listening on ${port}`)
    })
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`)
  }
}

start()