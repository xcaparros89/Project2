var express = require('express');
const mtg = require('mtgsdk');
var router = express.Router();

router.get('/card', function(req, res, next) {
  const testCards = [
    {
      name: 'Fury Silver',
      img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/0/0/0000579f-7b35-4ed3-b44c-db2a538066fe.png?1562894979',
    },
    {name: 'Black lotus', img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/0/9/0948e6dc-8af7-45d3-91de-a2aebee83e82.png?1559591784'},
    {name: 'Mox Ruby', img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/1/d/1d626bf6-12d0-470d-ae83-b948a60cc3d8.png?1562543309'},
    {name: 'Kor Outfitter', img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/0/0/00006596-1166-4a79-8443-ca9f82e6db4e.png?1562609251'},
    {name: 'Wall of Roots', img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/0/0/000619be-f2b4-407d-a76c-7245d8cab7bd.png?1562164455'},
    {name: 'Fresh Meat', img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/0/0/000ce65b-5347-4a88-81af-be9053e4d3f3.png?1562875106'},
    {name: 'Bronze Horse', img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/0/0/0003b07e-0d6e-4844-93c7-3f1f6a7d8c4d.png?1562894975'},
    {name: 'Whiptongue Hydra', img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/0/0/0005c844-787c-4f0c-8d25-85cec151642b.png?1592710235'},
    {name: 'Mulch', img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/0/0/0005968a-8708-441b-b9a1-9373aeb8114d.png?1562700539'},
    {name: 'Swamp', img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/0/0/000366c8-7a43-49d7-a103-ac5bd7efd9aa.png?1562052318'},
    {name: 'Mystic Skyfish', img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/0/0/0002ab72-834b-4c81-82b1-0d2760ea96b0.png?1596250027'},
    {name: 'Wildcall', img: 'https://c1.scryfall.com/file/scryfall-cards/png/front/0/0/00020b05-ecb9-4603-8cc1-8cfa7a14befc.png?1562633475'}
  ];
  res.render('search/card', {testCards});
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