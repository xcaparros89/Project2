var express = require('express');
var router = express.Router();

const Card = require('../models/Card');

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index', { title: 'Deck generator' });
});

router.use(['/profile'], (req, res, next) => {
  // if hay un usuario en sesión (si está logged in)
  if (req.session.currentUser) {
    next();
  } else {
    res.redirect("/login");
  }
});

router.get("/profile", function (req, res, next) {
  res.render("profile");
});

module.exports = router;
