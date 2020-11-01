var express = require('express');
var router = express.Router();
const User = require("../models/User");
const Card = require('../models/Card');

/* GET home page. */
router.get('/', async function(req, res, next) {
  if(req.session.currentUser) {
    res.locals.isLogged = true;
  }
  console.log(res.locals.isLogged);
  res.render('index', { title: 'MTG Organize & Build' });
});

router.use(['/profile'], (req, res, next) => { // Todo lo que esta dentro del Array es protected.
  // if hay un usuario en sesión (si está logged in)
  if (req.session.currentUser) {
    next();
  } else {
    res.redirect("/login");
  }
});

router.get("/profile", async function (req, res, next) {
  try {
    
    let userPopulated = await User.findOne(req.session.currentUser.id).populate('userCards._id');
    let userCards = userPopulated.userCards;
    console.log('cards', userCards);
    res.render("profile", {userCards});

  } catch (error) {
    console.log(error)
  }
});

module.exports = router;
