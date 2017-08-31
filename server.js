var express = require('express')
var app = express()
var https = require('https')
var bodyParser = require('body-parser') 
var cookieParser = require('cookie-parser')
var session = require('express-session')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
require('dotenv').config()




passport.use(new LocalStrategy(
  function(username, password, done) {

    if (username != process.env.USERNAME || password != process.env.PASSWORD) { 
      return done(null, false);
    }

    return done(null, {username : password});
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.authenticationMiddleware = function () {  
	  return function (req, res, next) {
	    if (req.isAuthenticated()) {
	      return next()
	    }
	    res.redirect('/')
	  }
	}


// CONFIGURATION
app.set('port', (process.env.PORT || 5000))

app.use('/public', express.static(__dirname + '/public')); // place static files inside /public directory

app.use(cookieParser());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(session({ 
	secret: 'SUPER SECRET COOKIE',
	resave: false,
  	saveUninitialized: true,
  	cookie: { secure: false }
  	 }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // eventually only allow from IDEO domains???
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(passport.initialize());
app.use(passport.session());


/* ------------- if you want to implement a view with this server ------------- */
    app.get('/', function(request, response) {
      response.sendFile(__dirname + '/index.html')
    });

	app.post('/login', passport.authenticate('local', { 
		failureRedirect: '/?login=error',
		successRedirect: '/view'
	}));

	app.get('/view', passport.authenticationMiddleware(),
	  function(req, res){
	  	 res.sendFile(__dirname + '/view.html')
	  });

/* ---------------------------------------------------------------------------- */

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
