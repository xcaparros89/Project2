var express = require("express");
const Card = require("../models/Card");
const User = require("../models/User");
const colors = require('colors');
const Deck = require("../models/Deck");
var router = express.Router();

let resultSearch = '';
let addedCards = [];

router.get("/search/card", (req, res, next) => {
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

router.get('/search/deck', async (req, res, next)=>{
  console.log(req.session.currentUser);
  res.locals.userId = req.session.currentUser._id;
  let decks = await Deck.find();
  res.render('search/deck', {decks});
});

let deck;
router.get('/search/deck/:id', async (req, res, next)=>{
  deck = await Deck.findById(req.params.id).populate('mainCards.card').populate('sideboard.card');
  console.log('deci', deck.likes.length);
  res.locals.likes = deck.likes.length;
  res.locals.dislikes = deck.dislikes.length;
  //res.locals.likes = decks.dislikes.length;
  res.render('search/deckInfo', {deck});
});

router.post('/deckInfo/reply', async (req,res,next)=>{
  let newReplies = [...deck.replies, {message: req.body.reply, author:req.session.currentUser.email}];
  console.log(newReplies);
  await Deck.findByIdAndUpdate({_id:deck._id},{replies:newReplies});
  res.redirect(`/search/deck/${deck._id}`);
});

router.get('/deckInfo/like', async (req,res,next)=>{
  let newLike = false;
  deck.likes.forEach(like=>{if(like == req.session.currentUser._id) newLike = true;});
  if(!newLike){
    let newLikes = [...deck.likes, req.session.currentUser._id];
    await Deck.findByIdAndUpdate({_id:deck._id},{likes:newLikes});
  }
  res.redirect(`/search/deck/${deck._id}`);
})

router.get('/deckInfo/dislike', async (req,res,next)=>{
  let newDislike = false;
  deck.dislikes.forEach(dislike=>{if(dislike == req.session.currentUser._id) newDislike = true;});
  if(!newDislike){
    let newDislikes = [...deck.dislikes, req.session.currentUser._id];
    await Deck.findByIdAndUpdate({_id:deck._id},{dislikes:newDislikes});
  }
  res.redirect(`/search/deck/${deck._id}`);
})

module.exports = router;