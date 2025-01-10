// Game state and variables
let dealerSum = 0;
let playerSum = 0;
let dealerCards = [];
let playerCards = [];
let deck = [];
let currentBet = 0;
let gameInProgress = false;
let winStreak = 0;
let gameStats = { wins: 0, losses: 0 };

// Player object
const player = {
    name: "Player",
    chips: 5000
};

// Initialize buttons
const startBtn = document.getElementById("start-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");
const betInput = document.getElementById("bet-amount");
const messageEl = document.getElementById("message");
const playerEl = document.getElementById("player-el");

// Disable game buttons initially
hitBtn.disabled = true;
standBtn.disabled = true;
startBtn.disabled = true;

// Update player stats display
function updateStats() {
    document.getElementById("wins").textContent = `Wins: ${gameStats.wins}`;
    document.getElementById("losses").textContent = `Losses: ${gameStats.losses}`;
    document.getElementById("player-el").textContent = `${player.name}: ${formatCurrency(player.chips)}`;
    document.getElementById("player-balance").textContent = formatCurrency(player.chips);
}

function formatCurrency(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function buildDeck() {
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suits = ["♠", "♣", "♥", "♦"];
    const deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value: value, suit: suit });
        }
    }
    return deck;
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function getValue(card) {
    if (card.value === "A") return 11;
    return ["J", "Q", "K"].includes(card.value) ? 10 : parseInt(card.value);
}

function calculateSum(cards) {
    let sum = 0;
    let aceCount = 0;
    
    for (let card of cards) {
        if (card.value === "A") {
            aceCount++;
            sum += 11;
        } else {
            sum += getValue(card);
        }
    }
    
    while (sum > 21 && aceCount > 0) {
        sum -= 10;
        aceCount--;
    }
    
    return sum;
}

function updateUI() {
    // Update dealer cards display
    const dealerCardsEl = document.getElementById("dealer-cards");
    dealerCardsEl.innerHTML = "";
    for (let i = 0; i < dealerCards.length; i++) {
        const card = dealerCards[i];
        const isRed = card.suit === "♥" || card.suit === "♦";
        const cardDiv = document.createElement("div");
        cardDiv.className = "card" + (isRed ? " red" : "");
        cardDiv.innerHTML = `
            <div class="card-value-top">${card.value}</div>
            <div class="card-suit">${card.suit}</div>
            <div class="card-value-bottom">${card.value}</div>
        `;
        dealerCardsEl.appendChild(cardDiv);
    }

    // Update player cards display
    const playerCardsEl = document.getElementById("player-cards");
    playerCardsEl.innerHTML = "";
    for (let card of playerCards) {
        const isRed = card.suit === "♥" || card.suit === "♦";
        const cardDiv = document.createElement("div");
        cardDiv.className = "card" + (isRed ? " red" : "");
        cardDiv.innerHTML = `
            <div class="card-value-top">${card.value}</div>
            <div class="card-suit">${card.suit}</div>
            <div class="card-value-bottom">${card.value}</div>
        `;
        playerCardsEl.appendChild(cardDiv);
    }

    // Update sums
    document.getElementById("dealer-sum").textContent = `Sum: ${dealerSum}`;
    document.getElementById("player-sum").textContent = `Sum: ${playerSum}`;
}

function placeBet() {
    const betAmount = parseInt(betInput.value);
    
    if (betAmount > player.chips) {
        messageEl.textContent = "You don't have enough chips!";
        return;
    }
    if (betAmount < 100) {
        messageEl.textContent = "Minimum bet is ₹100!";
        return;
    }
    
    currentBet = betAmount;
    player.chips -= betAmount;
    betInput.disabled = true;
    startBtn.disabled = false;
    messageEl.textContent = `Bet placed: ${formatCurrency(betAmount)}`;
    updateStats();
}

function startGame() {
    if (!currentBet) {
        messageEl.textContent = "Place your bet first!";
        return;
    }
    
    gameInProgress = true;
    
    // Reset and shuffle deck
    deck = buildDeck();
    shuffleDeck();
    
    // Deal initial cards
    dealerCards = [deck.pop(), deck.pop()];
    playerCards = [deck.pop(), deck.pop()];
    
    // Calculate initial sums
    dealerSum = calculateSum(dealerCards);
    playerSum = calculateSum(playerCards);
    
    // Enable controls
    hitBtn.disabled = false;
    standBtn.disabled = false;
    startBtn.disabled = true;
    
    updateUI();
    checkForNaturalBlackjack();
    playSound("card");
}

function hit() {
    if (!gameInProgress) return;
    
    // Player hits
    const newCard = deck.pop();
    playerCards.push(newCard);
    playerSum = calculateSum(playerCards);
    playSound("card");
    updateUI();
    
    // Check if player busts
    if (playerSum > 21) {
        endGame();
        return;
    }
    
    // Dealer's turn after a short delay
    setTimeout(() => {
        // Dealer hits if sum is less than 17
        if (dealerSum < 17) {
            const dealerCard = deck.pop();
            dealerCards.push(dealerCard);
            dealerSum = calculateSum(dealerCards);
            playSound("card");
            updateUI();
            
            // Check if dealer busts
            if (dealerSum > 21) {
                endGame();
            }
        }
    }, 500);
}

function stand() {
    if (!gameInProgress) return;
    
    // Disable player controls
    hitBtn.disabled = true;
    standBtn.disabled = true;
    
    // Dealer plays
    while (dealerSum < 17) {
        const newCard = deck.pop();
        dealerCards.push(newCard);
        dealerSum = calculateSum(dealerCards);
        playSound("card");
        updateUI();
    }
    
    endGame();
}

function endGame() {
    gameInProgress = false;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    
    // Determine winner
    if (playerSum > 21) {
        messageEl.textContent = "You bust! Dealer wins!";
        gameStats.losses++;
        playSound("lose");
    } else if (dealerSum > 21) {
        messageEl.textContent = "Dealer busts! You win!";
        player.chips += currentBet * 2;
        gameStats.wins++;
        showCelebration();
    } else if (playerSum > dealerSum) {
        messageEl.textContent = "You win!";
        player.chips += currentBet * 2;
        gameStats.wins++;
        showCelebration();
    } else if (playerSum < dealerSum) {
        messageEl.textContent = "Dealer wins!";
        gameStats.losses++;
        playSound("lose");
    } else {
        messageEl.textContent = "Push! It's a tie!";
        player.chips += currentBet;
        playSound("win");
    }
    
    // Reset for next game
    currentBet = 0;
    betInput.disabled = false;
    betInput.value = "500";
    updateStats();
}

function checkForNaturalBlackjack() {
    if (playerSum === 21) {
        messageEl.textContent = "Blackjack! You win!";
        player.chips += Math.floor(currentBet * 2.5);
        gameStats.wins++;
        showCelebration();
        gameInProgress = false;
        hitBtn.disabled = true;
        standBtn.disabled = true;
        betInput.disabled = false;
        currentBet = 0;
        updateStats();
    }
}

function showCelebration() {
    const overlay = document.getElementById('celebration-overlay');
    overlay.classList.add('show');
    
    // Play celebration sound
    playSound("win");
    
    // Hide celebration after 3 seconds
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 3000);
}

// Sound effects
function playSound(type) {
    try {
        const sound = new Audio(`https://assets.mixkit.co/active_storage/sfx/200${type === "card" ? "1" : type === "win" ? "0" : type === "lose" ? "2" : "3"}/200${type === "card" ? "1" : type === "win" ? "0" : type === "lose" ? "2" : "3"}-preview.mp3`);
        sound.play().catch(error => console.log("Error playing sound:", error));
    } catch (error) {
        console.log("Error playing sound:", error);
    }
}

// Modal functions
function toggleRulesModal() {
    const modal = document.getElementById("rules-modal");
    if (modal.classList.contains('show')) {
        modal.classList.remove('show');
    } else {
        modal.classList.add('show');
    }
}

function toggleBalanceModal() {
    const modal = document.getElementById("balance-modal");
    if (modal.classList.contains('show')) {
        modal.classList.remove('show');
    } else {
        modal.classList.add('show');
    }
}

function setQuickAmount(amount) {
    document.getElementById("add-balance").value = amount;
}

function addBalance() {
    const amount = parseInt(document.getElementById("add-balance").value);
    if (amount < 500 || amount > 50000) {
        messageEl.textContent = "Please enter an amount between ₹500 and ₹50,000";
        return;
    }
    
    player.chips += amount;
    updateStats();
    toggleBalanceModal();
    messageEl.textContent = `Added ${formatCurrency(amount)} chips! Place your bet to start a new game.`;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const rulesModal = document.getElementById("rules-modal");
    const balanceModal = document.getElementById("balance-modal");
    if (event.target === rulesModal) {
        rulesModal.classList.remove('show');
    }
    if (event.target === balanceModal) {
        balanceModal.classList.remove('show');
    }
}

// Initialize the game
updateStats();
