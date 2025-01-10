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
    document.getElementById("current-bet-amount").textContent = formatCurrency(currentBet);
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
    const betAmount = parseInt(document.getElementById("bet-amount").value);
    const betDisplay = document.getElementById("current-bet-amount");
    const totalBetAmount = currentBet + betAmount; // Add new bet to existing bet
    
    if (betAmount > player.chips) {
        messageEl.textContent = "Not enough chips! Add more chips or reduce your bet.";
        return;
    }
    if (totalBetAmount > 5000) {
        messageEl.textContent = "Total bet cannot exceed ₹5,000";
        return;
    }
    if (betAmount < 100) {
        messageEl.textContent = "Minimum bet is ₹100";
        return;
    }
    
    // Update current bet and chips
    currentBet = totalBetAmount;
    player.chips -= betAmount;
    
    // Update displays
    betDisplay.textContent = formatCurrency(currentBet);
    updateStats();
    
    // Update UI state
    startBtn.disabled = false;
    messageEl.textContent = `Total bet: ${formatCurrency(currentBet)}. Click START GAME to begin!`;
}

function startGame() {
    if (gameInProgress) return;
    
    if (currentBet === 0) {
        messageEl.textContent = "Please place a bet first!";
        return;
    }
    
    // Disable betting once game starts
    betInput.disabled = true;
    
    // Reset game state
    deck = buildDeck();
    shuffleDeck();
    playerCards = [];
    dealerCards = [];
    playerSum = 0;
    dealerSum = 0;
    
    // Deal initial cards
    playerCards.push(deck.pop());
    dealerCards.push(deck.pop());
    playerCards.push(deck.pop());
    dealerCards.push(deck.pop());
    
    playerSum = calculateSum(playerCards);
    dealerSum = calculateSum(dealerCards);
    
    gameInProgress = true;
    hitBtn.disabled = false;
    standBtn.disabled = false;
    startBtn.disabled = true;
    
    updateUI();
    checkForNaturalBlackjack();
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
    
    let winAmount = 0;
    // Determine winner
    if (playerSum > 21) {
        messageEl.textContent = "You bust! Dealer wins!";
        gameStats.losses++;
        playSound("lose");
    } else if (dealerSum > 21) {
        winAmount = currentBet * 2;
        messageEl.textContent = `Dealer busts! You win ${formatCurrency(winAmount)}!`;
        player.chips += winAmount;
        gameStats.wins++;
        showCelebration();
    } else if (playerSum > dealerSum) {
        winAmount = currentBet * 2;
        messageEl.textContent = `You win ${formatCurrency(winAmount)}!`;
        player.chips += winAmount;
        gameStats.wins++;
        showCelebration();
    } else if (playerSum < dealerSum) {
        messageEl.textContent = "Dealer wins!";
        gameStats.losses++;
        playSound("lose");
    } else {
        winAmount = currentBet;
        messageEl.textContent = `Push! It's a tie! You get back ${formatCurrency(winAmount)}`;
        player.chips += winAmount;
        playSound("win");
    }
    
    // Reset for next game
    betInput.disabled = false;
    document.getElementById("current-bet-amount").textContent = "₹0";
    currentBet = 0;
    updateStats();
}

function checkForNaturalBlackjack() {
    if (playerSum === 21) {
        const winAmount = Math.floor(currentBet * 2.5);
        messageEl.textContent = `Blackjack! You win ${formatCurrency(winAmount)}!`;
        player.chips += winAmount;
        gameStats.wins++;
        showCelebration();
        gameInProgress = false;
        hitBtn.disabled = true;
        standBtn.disabled = true;
        betInput.disabled = false;
        currentBet = 0;
        document.getElementById("current-bet-amount").textContent = "₹0";
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
    const rulesModal = document.getElementById("rules-modal");
    if (rulesModal.style.display === "flex") {
        rulesModal.style.display = "none";
        // Enable betting if coming from welcome popup
        if (document.getElementById("welcome-popup").style.display === "none") {
            document.getElementById("bet-amount").disabled = false;
            document.getElementById("place-bet-btn").disabled = false;
            messageEl.textContent = "Place your bet to begin!";
        }
    } else {
        rulesModal.style.display = "flex";
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

// Show welcome popup on page load
window.onload = function() {
    // Show welcome popup
    const welcomePopup = document.getElementById("welcome-popup");
    if (welcomePopup) {
        welcomePopup.style.display = "flex";
    }
    updateStats();
};

function showRules() {
    // Hide welcome popup and show rules
    document.getElementById("welcome-popup").style.display = "none";
    document.getElementById("rules-modal").style.display = "flex";
}

function closePopup() {
    const welcomePopup = document.getElementById("welcome-popup");
    if (welcomePopup) {
        welcomePopup.style.display = "none";
        // Show rules modal after welcome popup
        setTimeout(() => {
            toggleRulesModal();
            // Add event listener for rules modal close
            const rulesModal = document.getElementById("rules-modal");
            const rulesCloseBtn = rulesModal.querySelector(".close-btn");
            const originalRulesClose = rulesCloseBtn.onclick;
            rulesCloseBtn.onclick = function() {
                if (originalRulesClose) originalRulesClose.call(this);
                // Show balance modal after rules modal
                setTimeout(() => {
                    toggleBalanceModal();
                }, 500);
            };
        }, 500);
    }
}

// Initialize the game
updateStats();
