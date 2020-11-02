var express = require("express");
var router = express.Router();

// User model
const User = require("../models/User");

// Bcrypt para encriptar passwords

const bcrypt = require("bcryptjs");

router.get("/signup", function (req, res, next) {
  res.render("auth/signup");
});

router.post("/signup", async (req, res, next) => {
  // validamos los datos que vienen del formulario
  if (req.body.username === "" || req.body.email === "" || req.body.password === "") {
    res.render("auth/signup", {
      errorMessage: "Indicate a username, email and a password to sign up",
    });
    return;
  }

  // desestructuramos el email y el password de req.body
  const { username, email, password } = req.body;

  // creamos la salt y hacemos hash del password
  const salt = bcrypt.genSaltSync(10);
  const hashPass = bcrypt.hashSync(password, salt);

  try {
    // buscar el usuario por el campo email
    const user = await User.findOne({ email: email });
    // si existiera en la base de datos, renderizamos la vista de auth/signup con un mensaje de error
    if (user !== null) {
      res.render("auth/signup", {
        errorMessage: "The email already exists!",
      });
      return;
    }

    const repeatedUser = await User.findOne({ username: username });
    // si existiera en la base de datos, renderizamos la vista de auth/signup con un mensaje de error
    if (repeatedUser !== null) {
      res.render("auth/signup", {
        errorMessage: "The username already exists!",
      });
      return;
    }
    await User.create({
      username,
      email,
      password: hashPass,
    });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

router.post("/login", async (req, res, next) => {
  // validamos los datos que vienen del formulario
  if (req.body.username === "" || req.body.password === "") {
    res.render("auth/login", {
      errorMessage: "Indicate a username and a password to login",
    });
    return;
  }

  const { username, password } = req.body;

  try {
    // validar si el usuario existe en la BD
    console.log('username', username)
    const user = await User.findOne({ $or: [{username:username }, {email:username}]});
    if (!user) {
      res.render("auth/login", {
        errorMessage: "The username doesn't exist",
      });
      return;
    }

    if (bcrypt.compareSync(password, user.password)) {
      // guardar el usuario en la session
      req.session.currentUser = user;
      console.log(user)
      res.redirect("/");
    } else {
      res.render("auth/login", {
        errorMessage: "Incorrect password",
      });
    }

    // validar si el password es correcto
  } catch (error) {}
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect('/')
  })
})

module.exports = router;
