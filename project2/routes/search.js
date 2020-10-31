var express = require("express");
const Card = require("../models/Card");
const User = require("../models/User");

const colors = require('colors');
const Deck = require("../models/Deck");

var router = express.Router();

//Search cards
let resultSearch = '';
let addedCards = [];

router.get("/search/card", function (req, res, next) {
  res.render("search/card");
});

router.post("/search/card", async (req, res, next) => {

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
      if(req.session.currentUser) {
        res.locals.isLogged = true;
      }

      resultSearch.forEach(card => {
        card.logged = res.locals.isLogged;
      });

      res.render("search/card", { resultSearch });
    } catch (err) {
      console.log(err);
    }
});

router.post("/search/card/:id", async (req, res, next) => {
  if(req.session.currentUser) {
    res.locals.isLogged = true;
  }
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

//Make new deck
let newDeck = {};

router.post('/makeDeck', function (req,res,next){
  newDeck.title = req.body.title; newDeck.description = req.body.description;
  res.render('makeDeck', {newDeck});
});

router.post('/makeDeck/search', async (req,res,next)=>{
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
      newDeck.results = await Card.find(paramsObj);
      res.render("makeDeck", { newDeck });
    } catch (err) {
      console.log(err);
    }
});

router.post("/search/cardForDeck/:id", (req, res, next) => {
  if(!newDeck.cards)newDeck.cards={main:[], side:[], undecided:[]};
  let newCard = newDeck.results.find(card=> card._id == req.params.id)
  console.log(req.params.id)
  console.log(newDeck.cards);
  newDeck.cards[req.body.place] = [...newDeck.cards[req.body.place], {card:newCard, count:req.body.count}];
    res.render("makeDeck", { newDeck });
});

router.post('/makeDeck/modify/main/:id', (req,res,next)=>{
  newDeck.cards.main = newDeck.cards.main.map(cardObj=> cardObj.card._id == req.params.id? {...cardObj, count:req.body.count} : cardObj);
  res.render("makeDeck", { newDeck });
});

router.post('/makeDeck/modify/side/:id', (req,res,next)=>{
  newDeck.cards.side= newDeck.cards.side.map(cardObj=> cardObj.card._id == req.params.id? {...cardObj, count:req.body.count} : cardObj);
  res.render("makeDeck", { newDeck });
});

router.post('/makeDeck/modify/undecided/:id', (req,res,next)=>{
  newDeck.cards.undecided = newDeck.cards.undecided.map(cardObj=>cardObj.card._id == req.params.id? {...cardObj, count:req.body.count} : cardObj);
  res.render("makeDeck", { newDeck });
});

router.post('/makeDeck/move/main/:id', (req,res,next)=>{
  let movedCard = newDeck.cards.main.find(cardObj=> cardObj.card._id == req.params.id);
  newDeck.cards.main = newDeck.cards.main.filter(cardObj=> cardObj.card._id != req.params.id);
  newDeck.cards[req.body.place] = [...newDeck.cards[req.body.place], movedCard];
  res.render("makeDeck", { newDeck });
});

router.post('/makeDeck/move/side/:id', (req,res,next)=>{
  let movedCard = newDeck.cards.side.find(cardObj=> cardObj.card._id == req.params.id);
  newDeck.cards.side = newDeck.cards.side.filter(cardObj=> cardObj.card._id != req.params.id);
  newDeck.cards[req.body.place] = [...newDeck.cards[req.body.place], movedCard];
  res.render("makeDeck", { newDeck });
});

router.post('/makeDeck/move/undecided/:id', (req,res,next)=>{
  let movedCard = newDeck.cards.undecided.find(cardObj=> cardObj.card._id == req.params.id);
  newDeck.cards.undecided = newDeck.cards.undecided.filter(cardObj=> cardObj.card._id != req.params.id);
  newDeck.cards[req.body.place] = [...newDeck.cards[req.body.place], movedCard];
  res.render("makeDeck", { newDeck });
});

router.get('/makeDeck/delete/main/:id', (req,res,next)=>{
  newDeck.cards.main = newDeck.cards.main.filter(cardObj=> cardObj.card._id != req.params.id);
  res.render("makeDeck", { newDeck });
});

router.get('/makeDeck/delete/side/:id', (req,res,next)=>{
  newDeck.cards.side = newDeck.cards.side.filter(cardObj=> cardObj.card._id != req.params.id);
  res.render("makeDeck", { newDeck });
});

router.get('/makeDeck/delete/undecided/:id', (req,res,next)=>{
  newDeck.cards.undecided = newDeck.cards.undecided.filter(cardObj=> cardObj.card._id != req.params.id);
  res.render("makeDeck", { newDeck });
});


router.get('/makeDeck/save',async (req,res,next)=>{
  //user.findandUpdate els mazos
  //sha de guardar com a deck i a user com a string
  // Deck.find()
  // await User.findByIdAndUpdate(req.session.currentUser._id, {deck: collection});
  await Deck.create({ 
    title: newDeck.title,
    description: newDeck.description,
    authorId: req.session.currentUser._id,
    mainCards: newDeck.cards.main,
    sideboard: newDeck.cards.side,
    likes: []
  });
  res.redirect("/");
})



router.get("/deck", function (req, res, next) {res.render("search/deck");});

router.post("/deck", async (req, res, next) => {
  // validamos los datos que vienen del formulario
  let searchParams = { types: req.body.params };
  let search = async (searchParams) => {
    try {
      const results = await mtg.card.where(searchParams);
    } catch (err) {
      console.log(err);
    }
  };
  search(searchParams);
  res.redirect("/");
});

module.exports = router;