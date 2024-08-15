const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const logger = require('./logger/logger')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')
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
  origin: process.env.CLIENT, // replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
app.use(cookieParser())

// Configure Express to parse JSON requests with a maximum size limit of 50mb
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb', parameterLimit: 1000000 }))

// Ensuring security measures 
app.use(mongoSanitize())
app.use(helmet())
app.use(xss())


app.use((req, res, next) => {
  // Skip logging for specific routes
  const skippedRoutes = ['/posts/create-post', '/user/upload-profile-pic'];
  if (skippedRoutes.some(route => req.url.startsWith(route))) {
    return next();
  }

  const start = Date.now()
  const { method, url, body, params } = req
  logger.info(`Incoming request: ${method} ${url} - Params: ${JSON.stringify(params)} - Body: ${JSON.stringify(body)}`)
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info(`Request completed: ${method} ${url} - Status: ${res.statusCode} - Duration: ${duration}ms`)
  })

  next()
})

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