const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Connect to the database with mongoose
const mongoose = require('mongoose');

// To serve static files like CSS and JS from the 'public' directory
app.use(express.static('public'));

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to override HTTP methods like PUT and DELETE
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Import routes from the 'routes' folder
const router = require('./routes/routes');


// package to get the jwt from the browser
var cookieParser = require('cookie-parser')
// use cookieparser
app.use(cookieParser())

// send data to fronend 
app.use(express.json())
// protect private info
require('dotenv').config()
// Live reload configuration
const path = require('path');
const livereload = require('livereload');
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

const connectLivereload = require('connect-livereload');
app.use(connectLivereload());

liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

// Connect to the database
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}/`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

// Mount the router
app.use(router);
