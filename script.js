// let firstcard = getRandomCard(); //prompt("Enter you 1st card")
// firstcard = Number.parseInt(firstcard)

// let secondcard = getRandomCard(); //prompt("Enter you 2nd card")
// secondcard = Number.parseInt(secondcard)
let cards = [];

let sum = 0;

let hasBlackJack = false;
let isAlive = false;
let message = "";
let messageEL = document.getElementById("message-el");

let sumEL = document.getElementById("sum-el");
// let sumEL = document.querySelector("#sum-el")//we can use this also
let cardsEL = document.getElementById("cards-el");

let playerEl = document.getElementById("player-el");
let player = {
  name: "peter",
  chips: 165,
};

function getRandomCard() {
  let randomNumber = Math.floor(Math.random() * 13) + 1;
  // return randomNumber;
  if (randomNumber > 10) {
    return 10;
  } else if (randomNumber === 1) {
    return 11;
  } else {
    return randomNumber;
  }
}
function startGame() {
  isAlive = true;
  let firstcard = getRandomCard();
  let secondcard = getRandomCard();
  cards = [firstcard, secondcard];
  sum = firstcard + secondcard;
  renderGame();
  playerEl.textContent = player.name + ": $" + player.chips;
}

function renderGame() {
  sumEL.textContent = "Sum : " + sum;
  cardsEL.textContent = "Cards :";
  for (i = 0; i < cards.length; i++) {
    cardsEL.textContent += cards[i] + "-";
  }
  if (sum <= 20) {
    message = "Do you want to draw a new card ";
  } else if (sum === 21) {
    message = "Woooo ! you got blackjack 👏";
    hasBlackJack = true;
  } else {
    message = "you are out of game ! 😧 ";
    isAlive = false;
  }
  messageEL.textContent = message;
}

function newcard() {
  if (isAlive === true && hasBlackJack === false) {
    // console.log("draw a new card");
    let card = getRandomCard();
    cards.push(card);
    console.log(cards);
    sum = sum + card;
    renderGame();
  }
}
