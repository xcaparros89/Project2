var express = require("express");
const Filter = require('bad-words');
const Card = require("../models/Card");
const User = require("../models/User");
const Deck = require("../models/Deck");        
const colors = require('colors');
var router = express.Router();
var filter = new Filter();
let resultSearch = '';

//search cards
router.get("/search/card", function (req, res, next) {
  if(req.session.currentUser) {
    res.locals.isLogged = true;
  }
  res.render("search/card");
});

router.post("/search/card", async (req, res, next) => {
  if(req.session.currentUser) {
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
  console.log(req.params.id)
  if(req.session.currentUser) {
    res.locals.isLogged = true;
  }
    try {
      req.session.currentUser = await User.findById(req.session.currentUser._id);
      collection = [...req.session.currentUser.userCards.filter(card=>card._id != req.params.id), {_id:req.params.id, count: req.body.owned}];
      await User.findByIdAndUpdate(req.session.currentUser._id, {userCards: collection});
      const card = await Card.findOne({_id: req.params.id})
      res.locals.addedMessage = req.body.owned + " " + card.name + " has been added to your collection."
      res.locals.cardAdded = true;
      res.render("search/card", { resultSearch });
    } catch (err) {
      console.log(err);
    }
  });

// explore decks
router.get('/search/deck', async (req, res, next)=>{
  console.log(req.session.currentUser);
  res.locals.userId = req.session.currentUser._id;
  let decks = await Deck.find();
  res.render('search/deck', {decks});
});

let deck;
router.get('/search/deck/:id', async (req, res, next)=>{
  deck = await Deck.findById(req.params.id).populate('mainCards.card').populate('sideboard.card');
  author = await User.findById(deck.authorId);
  console.log(deck)
  res.locals.isUserAuthor = deck.authorId === req.session.currentUser._id? true : false;
  let deckOrg={legalities:deck.legalities, colors:deck.colors, likes: deck.likes, dislikes:deck.dislikes, id:deck._id, title: deck.title, description:deck.description, author: author.username, replies: deck.replies, 
    mainCards:{lands:[], artifacts:[], enchantments:[], instants:[], sorceries:[], planeswalkers:[],creatures:[], others:[]}, sideboard:{lands:[], artifacts:[], enchantments:[], instants:[], sorceries:[], planeswalkers:[],creatures:[], others:[]}};
  console.log('ci', deckOrg);
  deck.mainCards.forEach(cardObj=>{
      if (/Land/.test(cardObj.card.type_line)){deckOrg.mainCards.lands.push(cardObj);}
      else if (/Instant/.test(cardObj.card.type_line)){deckOrg.mainCards.instants.push(cardObj);}
      else if (/Enchantment/.test(cardObj.card.type_line)){deckOrg.mainCards.enchantments.push(cardObj);}
      else if (/Sorcery/.test(cardObj.card.type_line)){deckOrg.mainCards.sorceries.push(cardObj);}
      else if (/Planeswalker/.test(cardObj.card.type_line)){deckOrg.mainCards.planeswalkers.push(cardObj);}
      else if (/Creature/.test(cardObj.card.type_line)){deckOrg.mainCards.creatures.push(cardObj);}
      else if (/Artifact/.test(cardObj.card.type_line)){deckOrg.mainCards.artifacts.push(cardObj);}
      else {deckOrg.mainCards.others.push(cardObj);}
  });
  deck.sideboard.forEach(cardObj=>{
    if (/Land/.test(cardObj.card.type_line)){deckOrg.sideboard.lands.push(cardObj);}
    else if (/Instant/.test(cardObj.card.type_line)){deckOrg.sideboard.instants.push(cardObj);}
    else if (/Enchantment/.test(cardObj.card.type_line)){deckOrg.sideboard.lands.push(cardObj);}
    else if (/Sorcery/.test(cardObj.card.type_line)){deckOrg.sideboard.sorceries.push(cardObj);}
    else if (/Planeswalker/.test(cardObj.card.type_line)){deckOrg.sideboard.planeswalkers.push(cardObj);}
    else if (/Creature/.test(cardObj.card.type_line)){deckOrg.sideboard.creatures.push(cardObj);}
    else if (/Artifact/.test(cardObj.card.type_line)){deckOrg.sideboard.artifacts.push(cardObj);}
    else {deckOrg.sideboard.others.push(cardObj);}
});
  console.log('deci', deckOrg);
  res.locals.likes = deck.likes.length;
  res.locals.dislikes = deck.dislikes.length;
  res.render('search/deckInfo', {deckOrg});
});

router.post('/deckInfo/reply', async (req,res,next)=>{
  let filterReply = filter.clean(req.body.reply)
  let newReplies = [...deck.replies, {message: filterReply, author:req.session.currentUser.username}];
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