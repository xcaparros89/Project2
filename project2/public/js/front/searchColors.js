function clicked(mana){
    let manaB = document.getElementById(mana);
    if(manaB.classList.contains('color-unchecked')){
        manaB.classList.remove("color-unchecked");
        manaB.classList.add("color-checked");
    }else{
        manaB.classList.remove("color-checked");
        manaB.classList.add("color-unchecked");
    }
    console.log(mana)
}

function showHide(){
    let advParams = document.getElementById('advParams');
    if(advParams.classList.contains('advParams-hide')){
        advParams.classList.remove('advParams-hide');
    } else{
        advParams.classList.add('advParams-hide');
    }
}