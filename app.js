const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require("express-handlebars");
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const app = express();
const db = require('./config/connection');
const session = require('express-session');
const Handlebars = require('handlebars');

// For indexing
Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

Handlebars.SafeString.prototype._checkPropertyAccess = function () { };

Handlebars.registerHelper('currentPageEquals', function (value, options) {
  const currentPage = parseInt(getParameterByName('page', options.hash.url));
  return currentPage === value;
});

Handlebars.registerHelper('getURLWithPage', function (pageNumber, options) {
  const url = new URL(options.hash.url, 'http://localhost:3001/');
  url.searchParams.set('page', pageNumber);
  return url.href;
});

// Function to extract query parameters from the URL
function getParameterByName(name, url) {
  url = url || '';
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Configure Handlebars with the allowProtoPropertiesByDefault option
const hbsInstance = hbs.create({
  extname: "hbs",
  defaultLayout: "user-layout",
  layoutsDir: path.join(__dirname, "views", "layout"),
  partialsDir: path.join(__dirname, "views", "partials"),
  handlebars: Handlebars,
  allowProtoPropertiesByDefault: true
});

app.engine("hbs", hbsInstance.engine);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'key', cookie: { maxAge: 6000000 } }));

db.connect((err) => {
  if (err) {
    console.log("Connection error: " + err);
  } else {
    console.log("Database connected to localhost:27017");
  }
});

app.use(function (req, res, next) {
  res.locals.getParameterByName = function (name) {
    return getParameterByName(name, req.url);
  };
  next();
});

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
