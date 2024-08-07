const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

// Import the connectDB function to establish a connection with MongoDB
const connectDB = require('./db/connect')

// Import routes
const auth = require('./router/auth')

const app = express()

const corsOptions = {
  origin: 'http://localhost:5173', // replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/auth', auth)

const port = process.env.PORT || 5000

const start = async() => {
  try {
    await connectDB(process.env.MONGO_URI)

    app.listen(port, () => {
      console.log(`Server is now listening on ${port}`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()