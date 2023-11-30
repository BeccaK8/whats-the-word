// ===================================================== 
//                  CONSTANTS
// ===================================================== 
//  Define required constants:
//   - Master list of secret words
//   - Letter states: exact match, partial match, no match, unknown (not tried) with their associated background colors
//       = Exact Match ==> correct letter in the correct spot (green)
//       = Partial Match ==> correct letter in the wrong spot (yellow)
//       = No Match ==> letter not in secret word (grey)
//       = Unknown ==> letter has not been tried yet (white)
//   - Maximum number of guesses
// ===================================================== 
// TODO: add test case for repeat letters - skunk
const SECRET_WORD_LIST = ['STARE', 'QUOTA', 'JUMPY', 'SKIMP'];

const LETTER_STATE_LOOKUP = {
    'e': {desc: 'Exact Match', color: 'rgb(10 123 55)'},
    'p': {desc: 'Partial Match', color: 'rgb(255 192 0)'},
    'n': {desc: 'No Match', color: 'rgb(89 89 89)'},
    '0': {desc: 'Unknown', color: 'white'}
};

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;


// ===================================================== 
//                  CLASSES
// ===================================================== 
//  Class for Player which stores and updates statistics
// ===================================================== 

class Player {
    constructor() {
        this.winCount = 0;
        this.lossCount = 0;
        this.winStreak = 0;
    };

    recordWin() {
        this.winCount++;
        this.winStreak++;
    }

    recordLoss() {
        this.lossCount++;
        this.winStreak = 0;
    }
}


// ===================================================== 
//                  STATE VARIABLES
// ===================================================== 
//  Identify and initialize state variables:
//   - Secret word
//   - Player object to hold stats
//   - Guesses array of arrays - store each letter separately to render easier
//   - Letters array - store current state of each letter
//   -
// ===================================================== 

let player;   // instance of Player to hold the statistics for the current user

let secretWord;   // secret word

let guesses;  // an array of 6 nested arrays containing objects
let lettersUsed;  // an array of used letters where the key is the letter (from keyboard) and the value is it's letter state

let numGuesses;  // the number of guesses the player has made already

let gameStatus;   // W = win, L = loss (out of turns), otherwise keep playing

// ===================================================== 
//                  DOM ELEMENTS
// ===================================================== 
// Store elements that will be needed multiple times
//   - Guess button
//   - Play Again button
//   - Guess square divs
// ===================================================== 
console.log('Storing Elements: \n');
const messageEl = document.querySelector('h2');
console.log('message element: \n', messageEl);
const buttonEl = document.querySelector('button');
console.log('button element: \n', buttonEl);


// TODO: Do I really need this?  May be able to delete
// grab keyboard elements and save them to an array
const keysEls = [...document.querySelectorAll(".row > div")];
console.log('keys element array: \n', keysEls);


// ===================================================== 
//                 FUNCTIONS
// ===================================================== 

// Initialize the game:
function init() {
    // if a player object does not exist, create one; otherwise, assume it's the same player
    console.log('\ninit: player \n', player);
    if (!player) player = new Player();
    console.log('\ninit: player \n', player);

    numGuesses = 0;

    // pick secret word
    secretWord = getSecretWord();

    // reset guesses array
    // console.log('init: guesses before reset():\n', guesses);
    resetGuesses();
    // console.log('init: guesses after reset():\n', guesses);

    // reset letters used and game status
    lettersUsed = [];
    gameStatus = null;

    // TODO: remove this - for testing only:
    letters = {
        A: 'e',
        S: 'p',
        E: 'n',
        K: 'e'
    };
    
    render();
}

init();

// Get Secret Word - Select a random word from the master array and return it
function getSecretWord() {
    const wordIdx = Math.floor(Math.random() * SECRET_WORD_LIST.length);
    console.log('\n getSecretWord() - secretWord: \n', SECRET_WORD_LIST[wordIdx]);

    return SECRET_WORD_LIST[wordIdx];
}

// Reset Guesses Array - Reinitialize guesses to be a two-dimensional array
//  of objects - initially containing just a state of 0 (or unknown)
function resetGuesses() {
    guesses = new Array(MAX_GUESSES);
    for (let i = 0; i < MAX_GUESSES; i++) {
        guesses[i] = [];
        for (let j = 0; j < WORD_LENGTH; j++) {
            guesses[i][j] = { state: '0' };
        }
    }
}

// ===================================================== 
// Render functions
// ===================================================== 
// Render the appropriate message (make a guess, you win, you lose)
function renderMessage() {
    if (gameStatus === 'W') {
        // message user wins
        messageEl.innerText = `Congratulations!  You won in ${numGuesses} guesses!`;
    } else if (gameStatus === 'L') {
        // message user ran out of turns
        messageEl.innerHTML = `
            So close!  The word was 
            <span style="color: ${LETTER_STATE_LOOKUP['e'].color}">${secretWord}</span>
        `;
    } else if (numGuesses === 0) {
        // message to get started
        messageEl.innerText = "Let's play...";
    } else {
        // message to guess again
        const guessesLeft = MAX_GUESSES - numGuesses;
        messageEl.innerText = `Nice try! You have ${guessesLeft} guesses left...`;
    }
}

// Render the guesses with the appropriate background color based on the guess's state (exact match, partial match, no match, unknown - not tried)
function renderGuesses() {

    // console.log('renderGuesses: guesses - \n', guesses);

    // loop through the guesses array
    // get the element for that square and set the text and background color based on the object
    for (let i = 0; i < MAX_GUESSES; i++) {
        for (let j = 0; j < WORD_LENGTH; j++) {
            const squareEl = document.getElementById(`g${i}l${j}`);
            // console.log('squareEl key: \n',`g${i}l${j}`);
            // console.log('squareEl: \n', squareEl);

            // console.log('guesses[i][j]: \n', guesses[i][j]);
            // console.log('guesses[i][j].state: \n', guesses[i][j].state);
            // console.log('guesses[i][j].letter: \n', guesses[i][j].letter);
            // only change the text if that square in guesses has a letter picked
            if (guesses[i][j].letter) squareEl.innerText = guesses[i][j].letter;
            squareEl.style.backgroundColor = LETTER_STATE_LOOKUP[guesses[i][j].state].color;
        }
    }
}

// Render the screen keyboard with the appropriate background color based on the letter's state (exact match, partial match, no match, unknown - not tried)
function renderKeys() {
    // Loop through the letters used array
    // for each letter, get the element for that key and change the background and font color
    for (let letter in lettersUsed) {
        // console.log('renderKeys - letter \n:', letters[letter]);
        const keyEl = document.getElementById(letter);
        // console.log('renderKeys - keyEl \n:', keyEl);
        keyEl.style.backgroundColor = LETTER_STATE_LOOKUP[lettersUsed[letter]].color;
        keyEl.style.color = 'white';
    }
}

// Render the button: "GUESS" if user has more tries or "PLAY AGAIN" if they lost
function renderButtons() {
    // if user wins or loses, set the id and text of the button to "Play Again"
    if (gameStatus === 'W' || gameStatus === 'L') {
        buttonEl.innerText = 'Play Again';
        buttonEl.id = 'playAgain';
    } else {
        // otherwise, set the id and text of the button to "Guess"
        buttonEl.innerText = 'Guess';
        buttonEl.id = 'guess';
    }
}

// Main render function
function render() {
    renderMessage();
    renderGuesses();
    renderKeys();
    renderButtons();
}

// ===================================================== 
// Handle Click of Screen "Keyboard" Buttons:
//   - Check if "letter" button clicked - if not, ignore click
//   - Capture "letter" of button clicked
//   - Call Handle Selected Letter (below) with letter clicked
// ===================================================== 

// ===================================================== 
// Handle Press of Keyboard
//   - Check if key pressed is a letter - if not, ignore press
//   - Capture "letter" of key pressed
//   - Call Handle Selected Letter (below) with letter pressed
// ===================================================== 

// ===================================================== 
// Handle Selected Letter
//   - Update current guess square state variable with letter clicked
//   - Advance to next letter square on current guess
//   - If no more empty squares on current guess, highlight "GUESS" button
//   - Render changes to screen
// ===================================================== 

// ===================================================== 
// Handle Click of "GUESS" button:
//   - Check for win - does guess equal mystery word
//   - If no win, for each letter in guess, 
//      = Check if letter at that spot is same as secret word at that spot.  If so, mark letter as "exact match"
//      = Check if letter at that spot is anywhere else in secret word.  If so, mark letter as "found but not exact match"
//      = Otherwise, mark letter as "not in secret word"
//   - Increment number of guesses
//   - If win or lose, update statistics
// ===================================================== 

// ===================================================== 
// Handle Click of "PLAY AGAIN" button:
//   - Reinitialize game
// ===================================================== 

// ===================================================== 
// Handle Click of "Stats" button:
//   - Display Number of Games Played
//   - Display Win %
//   - Display Current Streak
// ===================================================== 

// ===================================================== 
// Handle Click of "Help" button:
//   - Overlay the instructions on screen
// ===================================================== 