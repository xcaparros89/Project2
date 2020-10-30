var express = require("express");
const Card = require("../models/Card");
const User = require("../models/User");

const colors = require('colors');

var router = express.Router();
let resultSearch = '';
let addedCards = [];

router.get("/search/card", function (req, res, next) {
  res.render("search/card");
});

router.post("/search/card", async (req, res, next) => {
  if(req.session.currentUser){
    res.locals.isLogged = true;
  }

  const { name, set_name, rarity, legality, type, subtype, colors } = req.body;
  const paramsObj = {};
  if (name) paramsObj.name = new RegExp(name.trim(), "i");
  if (set_name) paramsObj.set_name = new RegExp(set_name.trim(), "i");
  if (rarity) paramsObj.set_name = new RegExp(rarity.trim(), "i");
  if (legality) paramsObj[`legalities.${legality}`] = "legal";
  if (colors) {
    let colorsArr = colors
      .trim()
      .split(",")
      .join("")
      .split(" ")
      .map((color) => {
        if (color === "red" || color === "Red" || color === "RED") return "R";
        if (color === "blue" || color === "Blue" || color === "BLUE")
          return "U";
        if (color === "white" || color === "White" || color === "WHITE")
          return "W";
        if (color === "green" || color === "Green" || color === "GREEN")
          return "G";
        if (color === "black" || color === "Black" || color === "BLACK")
          return "B";
      })
      .sort();
    paramsObj.colors = colorsArr;
  }
  if (type || subtype) {
    let regex = "";
    let totalTypeArr = [];
    if (type) totalTypeArr = [...type.trim().split(",").join("").split(" ")];
    if (subtype)
      totalTypeArr = [
        ...totalTypeArr,
        ...subtype.trim().split(",").join("").split(" "),
      ];
    totalTypeArr.forEach((el) => (regex += `(?=.*\\b${el}\\b)`));
    let regex2 = new RegExp(regex + ".*", "gi");
    paramsObj.type_line = regex2;
  }
    try {
      resultSearch = await Card.find(paramsObj);
      res.render("search/card", { resultSearch });
    } catch (err) {
      console.log(err);
    }
});

router.post("/search/card/:id", async (req, res, next) => {
    try {
      let newCard = true;
      let collection = [...req.session.currentUser.userCards, ...addedCards];
      collection = req.session.currentUser.userCards.map(card=>{
        if(card._id == req.params.id){
          newCard = false;
          return {_id:req.params.id, count: req.body.owned}
        }
        return card
      })
      if(newCard){
        addedCards = [...addedCards, {_id:req.params.id, count: req.body.owned}]
        collection = [...collection, ...addedCards];
      }
      console.log(collection)
      await User.findByIdAndUpdate(req.session.currentUser._id, {userCards: collection});

      const card = await Card.findOne({_id: req.params.id})
      res.locals.addedMessage = req.body.owned + " " + card.name + " has been added to your collection."
      res.locals.cardAdded = true;
      res.render("search/card", { resultSearch });
    } catch (err) {
      console.log(err);
    }
});

router.get("/deck", function (req, res, next) {
  res.render("search/deck");
});

router.post("/deck", async (req, res, next) => {
  // validamos los datos que vienen del formulario
  let searchParams = { types: req.body.params };
  let search = async (searchParams) => {
    try {
      const results = await mtg.card.where(searchParams);
      console.log(results);
    } catch (err) {
      console.log(err);
    }
  };
  search(searchParams);
  res.redirect("/");
});

module.exports = router;