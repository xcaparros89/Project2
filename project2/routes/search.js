var express = require('express');
const Card = require('../models/Card');
var router = express.Router();

router.get('/search', function(req, res, next) {
  res.render('cardSearch');
});

router.post("/search", async (req, res, next) => {
const {name, set_name, rarity, legality, type, subtype, colors} = req.body;
const paramsObj = {}
if(name)paramsObj.name = new RegExp(name.trim(), 'i');
if(set_name)paramsObj.set_name = new RegExp(set_name.trim(), 'i');
if(rarity)paramsObj.set_name = new RegExp(rarity.trim(), 'i');
if(legality)paramsObj[`legalities.${legality}`] = 'legal';
if(colors){ //searches for the exact colors you put here, if you put red and blue a card with red blue and black would not appear
  let colorsArr = colors.trim().split(',').join('').split(' ').map(color=>{
    if(color === 'red' || color === 'Red' || color === 'RED')return 'R';
    if(color === 'blue' || color === 'Blue' || color === 'BLUE')return 'U';
    if(color === 'white' || color === 'White' || color === 'WHITE')return 'W';
    if(color === 'green' || color === 'Green' || color === 'GREEN')return 'G';
    if(color === 'black' || color === 'Black' || color === 'BLACK')return 'B';
  }).sort();
  paramsObj.colors = colorsArr;
}
if(type || subtype){
  let regex = '';
  let totalTypeArr = [];
  if(type)totalTypeArr = [...type.trim().split(',').join('').split(' ')]; 
  if(subtype)totalTypeArr = [...totalTypeArr, ...subtype.trim().split(',').join('').split(' ')];
  totalTypeArr.forEach(el=>regex +=`(?=.*\\b${el}\\b)`);
  let regex2 = new RegExp(regex+'.*', 'gi');
    paramsObj.type_line = regex2;
  }
let search = async(paramsObj)=>{
        try{
            const results = await Card.find(paramsObj);
            console.log(results);
        }catch(err){
            console.log(err);
        }
    }
search(paramsObj)

res.redirect('/')
  });

module.exports = router;