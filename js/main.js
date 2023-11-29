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
const SECRET_WORD_LIST = ['stare', 'quota', 'jumpy', 'skimp'];

const LETTER_STATE_LOOKUP = {
    'e': {desc: 'Exact Match', color: 'green'},
    'p': {desc: 'Partial Match', color: 'yellow'},
    'n': {desc: 'No Match', color: 'grey'},
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
let letters;  // an array of 26 arrays where the key is the letter (from keyboard) and the value is it's letter state

let numGuesses;  // the number of guesses the player has made already

// ===================================================== 
//                  DOM ELEMENTS
// ===================================================== 
// Store elements that will be needed multiple times
//   - Guess button
//   - Play Again button
//   - Guess square divs
// ===================================================== 
console.log('\n============================\n');
console.log('Storing Elements: \n');
console.log('============================\n');
const messageEl = document.querySelector('h2');
console.log('message element: \n', messageEl);
const guessButtonEl = document.getElementById('guess');
console.log('guess button element: \n', guessButtonEl);
const playAgainButtonEl = document.getElementById('playAgain');
console.log('[play again button] element: \n', playAgainButtonEl);

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
    console.log('init: guesses before reset():\n', guesses);
    resetGuesses();
    console.log('init: guesses after reset():\n', guesses);

    // reset letters state
    letters = [];
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
            guesses[i][j] = { state: 0 };
        }
    }
}

// ===================================================== 
// Render the screen:
//   - Render the appropriate message (make a guess, you win, you lose)
//   - Render the guesses with the appropriate background color based on the guess's state (exact match, partial match, no match, unknown - not tried)
//   - Render the screen keyboard with the appropriate background color based on the letter's state (exact match, partial match, no match, unknown - not tried)
//   - Render the button: "GUESS" if user has more tries or "PLAY AGAIN" if they lost
// ===================================================== 

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