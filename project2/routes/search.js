var express = require('express');
const mtg = require('mtgsdk');
var router = express.Router();

router.get('/card', function(req, res, next) {
  res.render('search/card');
});

router.post("/card", async (req, res, next) => {
    // validamos los datos que vienen del formulario
    let searchParams = {types:req.body.params};
let search = async(searchParams)=>{
        try{
            const results = await mtg.card.where(searchParams);
            console.log(results);
        }catch(err){
            console.log(err);
        }
    }
search(searchParams)
res.redirect('/')
  });


router.get('/deck', function(req, res, next) {
  res.render('search/deck');
});

router.post("/deck", async (req, res, next) => {
    // validamos los datos que vienen del formulario
    let searchParams = {types:req.body.params};
let search = async(searchParams)=>{
        try{
            const results = await mtg.card.where(searchParams);
            console.log(results);
        }catch(err){
            console.log(err);
        }
    }
search(searchParams)
res.redirect('/')
  });



module.exports = router;

//filters:
//name: String, colors: array, types:array(creature, enchantment...), subtypes:array(vampire, elves...), rarity:string, setName:string, legalities[{format:'Comander', legality: 'Legal'},...]

// let searchParams = {types:'Creature', subtypes:'elf,warrior'};