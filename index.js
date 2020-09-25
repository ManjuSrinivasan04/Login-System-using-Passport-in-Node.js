if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
  const express = require('express')
  const app = express()
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  const session = require('express-session')
  const methodOverride = require('method-override')
  
  const initializePassport = require('./passport-config')
  initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )
  
  //storing data in local variables
  const users = []
  
  app.set('view-engine', 'ejs')
  app.use(express.urlencoded({ extended: false }))
  app.use(flash()) //to give handy messages when email pswd is wrong
  app.use(session({
    secret: process.env.SESSION_SECRET, //this is a key which encrypt all our informations 
    resave: false, //if nothing has changed we no need to resave
    saveUninitialized: false  //no need to save empty values
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method')) //to go with the delete -- for logout operation 
  
  //rendering home page -- route//after login gives username
  app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
  })
  
  //login page route
  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
  })
  
  //login authentication with passport
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/', //onSuccess home page
    failureRedirect: '/login', //onFailure loginPage
    failureFlash: true  //flash msg in passport-config 
  }))
  
  //register page route
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
  })
  
  //password encrypting and produce the hash using bcrypt
  app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      //adding the users
      users.push({
        id: Date.now().toString(), //id will be current timestamp
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
    //console.log(users);//users everytime it will be reloading 
  })
  
  //logout route
  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })
  
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }

//port
app.listen(3000, () => {
    console.log("Listening at :3000...");
});