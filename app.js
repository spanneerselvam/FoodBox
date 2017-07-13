const express           = require('express');
const session           = require('cookie-session');
const exphb             = require('express-handlebars');
const expressValidator  = require('express-validator');
const cookieParser      = require('cookie-parser');
const bodyParser        = require('body-parser');
const mongoose          = require('mongoose');
const path              = require('path');

const index             = require('./routes/index');

const app = express();

// Configure mongoose
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/BroncoHack2017');
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

// Setup HTTPS
const requireHTTPS = (req, res, next) => {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.MONGODB_URI) {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
};
app.use(requireHTTPS);

// View Engine
// app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphb({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Initialize a loggedIn session
app.use(session({
  name: 'session',
  secret: '2C44-4D44-WppQ38S',
  resave: true,
  saveUninitialized: true
}));

// Express Validator
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) formParam += '[' + namespace.shift() + ']';

    return { param: formParam, msg, value };
  }
}));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+ app.get('port'));
});

module.exports = app;
