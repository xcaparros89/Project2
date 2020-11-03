
let manaCost = document.querySelectorAll('.mana-cost');
manaCost.forEach(card=>{
    let innerHTML = '';
    let newCard = card.innerHTML.split(''); newCard.splice(0,1); newCard.splice(-1,1);
    newCard = newCard.join('').split('}{');
    newCard.forEach(simbol=>{
        if(simbol){
            simbol = simbol.split('/').join('');
            innerHTML += `<img class='symbol' src='/img/mana-cost/${simbol}.png' alt=${simbol} >`;
            }
        });
    card.innerHTML = innerHTML;
    });