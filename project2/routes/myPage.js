var express = require("express");
const Card = require("../models/Card");
const User = require("../models/User");
const Deck = require("../models/Deck");

const colors = require('colors');

var router = express.Router();

router.use((req, res, next) => { // Todo lo que esta dentro del Array es protected.
    // if hay un usuario en sesión (si está logged in)
    if (req.session.currentUser) {
      next();
    } else {
      res.redirect("/login");
    }
  });
  
  //Profile
  router.get("/profile", function (req, res, next) {
    res.render("myPage/profile", {user:req.session.currentUser});
  })

  router.get("/modifyProfile", function (req, res, next) {
    res.render("myPage/modifyProfile", {user:req.session.currentUser});
  })

  router.post("/modifyProfile", async function (req, res, next) {
    newuser = await Deck.findByIdAndUpdate({_id: req.session.currentUser}, {username: req.body.username, email:req.body.email, password:req.body.password});
    req.session.currentUser = newuser;
    res.render("myPage/profile", {user:req.session.currentUser});
  })

  //My cards
  router.get("/myCollection", async function (req, res, next) {
    try {
      let userPopulated = await User.findById(req.session.currentUser._id).populate('userCards._id');
      let userCards = userPopulated.userCards;
      res.render("myPage/myCollection", {userCards});
    } catch (error) {console.log(error);}
  });

//Make deck
let newDeck = {};
let currentDeck; //used when modifiying decks
router.post('/makeDeck', function (req,res,next){
  newDeck='';
  console.log(newDeck);
  newDeck.title = req.body.title; newDeck.description = req.body.description;
  res.render('myPage/makeDeck', {newDeck});
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
      res.render("myPage/makeDeck", { newDeck });
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
    res.render("myPage/makeDeck", { newDeck });
});

router.post('/makeDeck/modify/main/:id', (req,res,next)=>{
  console.log('before', newDeck.cards.main)
  newDeck.cards.main = newDeck.cards.main.map(cardObj=> cardObj.card._id == req.params.id? {...cardObj, count:req.body.count} : cardObj);
  console.log('after', newDeck.cards.main)
  res.render("myPage/makeDeck", { newDeck });
});

router.post('/makeDeck/modify/side/:id', (req,res,next)=>{
  console.log('before', newDeck.cards.side)
  newDeck.cards.side= newDeck.cards.side.map(cardObj=> cardObj.card._id == req.params.id? {...cardObj, count:req.body.count} : cardObj);
  console.log('after', newDeck.cards.side)
  res.render("myPage/makeDeck", { newDeck });
});

router.post('/makeDeck/modify/undecided/:id', (req,res,next)=>{
  newDeck.cards.undecided = newDeck.cards.undecided.map(cardObj=>cardObj.card._id == req.params.id? {...cardObj, count:req.body.count} : cardObj);
  res.render("myPage/makeDeck", { newDeck });
});

router.post('/makeDeck/move/main/:id', (req,res,next)=>{
  let movedCard = newDeck.cards.main.find(cardObj=> cardObj.card._id == req.params.id);
  newDeck.cards.main = newDeck.cards.main.filter(cardObj=> cardObj.card._id != req.params.id);
  newDeck.cards[req.body.place] = [...newDeck.cards[req.body.place], movedCard];
  res.render("myPage/makeDeck", { newDeck });
});

router.post('/makeDeck/move/side/:id', (req,res,next)=>{
  let movedCard = newDeck.cards.side.find(cardObj=> cardObj.card._id == req.params.id);
  newDeck.cards.side = newDeck.cards.side.filter(cardObj=> cardObj.card._id != req.params.id);
  newDeck.cards[req.body.place] = [...newDeck.cards[req.body.place], movedCard];
  res.render("myPage/makeDeck", { newDeck });
});

router.post('/makeDeck/move/undecided/:id', (req,res,next)=>{
  let movedCard = newDeck.cards.undecided.find(cardObj=> cardObj.card._id == req.params.id);
  newDeck.cards.undecided = newDeck.cards.undecided.filter(cardObj=> cardObj.card._id != req.params.id);
  newDeck.cards[req.body.place] = [...newDeck.cards[req.body.place], movedCard];
  res.render("myPage/makeDeck", { newDeck });
});

router.get('/makeDeck/delete/main/:id', (req,res,next)=>{
  newDeck.cards.main = newDeck.cards.main.filter(cardObj=> cardObj.card._id != req.params.id);
  res.render("myPage/makeDeck", { newDeck });
});

router.get('/makeDeck/delete/side/:id', (req,res,next)=>{
  newDeck.cards.side = newDeck.cards.side.filter(cardObj=> cardObj.card._id != req.params.id);
  res.render("myPage/makeDeck", { newDeck });
});

router.get('/makeDeck/delete/undecided/:id', (req,res,next)=>{
  newDeck.cards.undecided = newDeck.cards.undecided.filter(cardObj=> cardObj.card._id != req.params.id);
  res.render("myPage/makeDeck", { newDeck });
});

router.get('/makeDeck/save',async (req,res,next)=>{
  console.log('save', newDeck.cards);
  console.log('save,main', newDeck.cards.main);
  console.log('save,main,card', newDeck.cards.main.card);
    newDeck.cards.main = newDeck.cards.main.map(cardObj=>{return {card: cardObj.card._id, count: cardObj.count};});
    newDeck.cards.side = newDeck.cards.side.map(cardObj=>{return {card: cardObj.card._id, count: cardObj.count};});
    console.log('save', newDeck.cards.main)
    console.log('user', req.session.currentUser)
    console.log(currentDeck)
    if(currentDeck){
      console.log(await Deck.findById(currentDeck));
      await Deck.findByIdAndUpdate({_id: currentDeck}, {mainCards: newDeck.cards.main, sideboard: newDeck.cards.side});
    }else{
      await Deck.create({ 
          title: newDeck.title,
          description: newDeck.description,
          authorId: req.session.currentUser._id,
          mainCards: newDeck.cards.main,
          sideboard: newDeck.cards.side,
          likes: []
        });
    }
    currentDeck='';
    newDeck = ''; 
    res.redirect("/myDecks");
})

//My decks
router.get("/myDecks", async function (req, res, next) {
    try {
        let myDecks = await Deck.find({authorId:req.session.currentUser._id});
      res.render("myPage/myDecks", {myDecks});
    } catch (error) {console.log(error);}
  });

router.post('/myDecks/modify/:id', async function (req,res,next){
  currentDeck = req.params.id;
  let myDeck = await Deck.findById(req.params.id).populate('mainCards.card').populate('sideboard.card');
 let mainCards = []; 
 let sideboard = [];
  myDeck.mainCards.forEach(cardObj=>{mainCards.push({card:cardObj.card, count:cardObj.count})});
  myDeck.sideboard.forEach(cardObj=>{sideboard.push({card:cardObj.card, count:cardObj.count})});
  newDeck = {title:myDeck.title, description:myDeck.description, cards: {main:mainCards, side:sideboard, undecided:[]}};
  console.log(newDeck.cards.main)
  res.render('myPage/makeDeck', {newDeck});
});

  router.post('/myDecks/delete/:id', async function (req,res,next){
    await Deck.findOneAndRemove({_id:req.params.id});
    res.redirect('/myDecks');
  });

module.exports = router;