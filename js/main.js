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
    'e': {desc: 'Exact Match', bgColor: 'rgb(10 123 55)', color: 'white'},
    'p': {desc: 'Partial Match', bgColor: 'rgb(255 192 0)', color: 'white'},
    'n': {desc: 'No Match', bgColor: 'rgb(89 89 89)', color: 'white'},
    '0': {desc: 'Unknown', bgColor: 'white', color: 'black'}
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

let guessComplete;
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
    guessComplete = false;

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

    // loop through the guesses array for the number of guesses made plus 1 (for the current guess that has not yet been submitted)
    // get the element for that square and set the text and background color based on the object
    for (let i = 0; i < numGuesses + 1; i++) {
        for (let j = 0; j < WORD_LENGTH; j++) {
            const squareEl = document.getElementById(`g${i}l${j}`);
            // console.log('squareEl key: \n',`g${i}l${j}`);
            // console.log('squareEl: \n', squareEl);

            // console.log('guesses[i][j]: \n', guesses[i][j]);
            // console.log('guesses[i][j].state: \n', guesses[i][j].state);
            // console.log('guesses[i][j].letter: \n', guesses[i][j].letter);
            // change the text if that square in guesses has a letter picked; otherwise, change it to a '' to erase if backspace hit
            squareEl.innerText = guesses[i][j].letter ? guesses[i][j].letter : '';
            squareEl.style.backgroundColor = LETTER_STATE_LOOKUP[guesses[i][j].state].bgColor;
            squareEl.style.color = LETTER_STATE_LOOKUP[guesses[i][j].state].color;
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
        keyEl.style.backgroundColor = LETTER_STATE_LOOKUP[lettersUsed[letter]].bgColor;
        keyEl.style.color = LETTER_STATE_LOOKUP[lettersUsed[letter]].color;
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
        // if the guess is complete, add a class that changes the button colors to entice them to enter their guess
        if (guessComplete) {
            buttonEl.classList.add('guessComplete');
        } else {
            buttonEl.classList.remove('guessComplete');
        }
    }
}

// Main render function
function render() {
    renderMessage();
    renderGuesses();
    renderKeys();
    renderButtons();
}

// Handle Selected Letter
function handleSelectedLetter(letter) {
    let letterIdx = 0;   // this will be the index of the next empty letter in the guess
    // console.log('handleSelectedLetter: input letter: \n', letter);
    // console.log('handleSelectedLetter: guess square letter: \n', guesses[numGuesses][letterIdx].letter);
    
    // check if they hit the backspace button
    const isBackspace = letter === 'backspace';
    // console.log('handleSelectedLetter: isbackspace - \n', isBackspace);

    while (letterIdx < WORD_LENGTH && guesses[numGuesses][letterIdx].letter) {
        // console.log('handleSelectedLetter - in while with letterIdx of: \n', letterIdx);
        letterIdx++;
    }
    console.log('handleSelectedLetter - out of while with letterIdx of: \n', letterIdx);

    if (isBackspace) {
        // console.log('handleSelectedLetter - handling backspace - letterIdx: \n', letterIdx);
        // make sure there is a letter to erase
        if (letterIdx > 0) {
            // if the user hit the backspace, we need to remove the last entered letter from the array
            // console.log('handleSelectedLetter - handling backspace - letter at index - 1:\n', guesses[numGuesses][letterIdx-1].letter);
            delete guesses[numGuesses][letterIdx-1].letter;
            // console.log('handleSelectedLetter - handling backspace - letter at index - 1 after delete:\n', guesses[numGuesses][letterIdx-1].letter);
            // reset guessComplete to false since we just deleted a letter
        }
        guessComplete = false;
    } else {
        if (letterIdx < WORD_LENGTH) {
            // Update current guess square state variable with letter clicked
            guesses[numGuesses][letterIdx].letter = letter;
            // console.log('handleSelectedLetter: guess complete?: \n', letterIdx === WORD_LENGTH - 1);
            // If no more empty squares on current guess, mark guess as complete to trigger highlight of "GUESS" button
            guessComplete = (letterIdx === WORD_LENGTH - 1);
        }
        // console.log('handleSelectedLetter: guess square in if(letteridx<wordlength): \n', guesses[numGuesses]);
    }

    // update the board
    render();
}

// Handle Click of Screen "Keyboard" Buttons:
function handleScreenKeyClick(evt) {
    // console.log('handleScreenKeyClick - this was clicked: \n', evt.target.tagName);
    
    // Check if "letter" div clicked - if not, ignore click
    if (evt.target.tagName !== 'DIV') { return; }

    // Capture "letter" of button clicked
    const letterClicked = evt.target.id;
    console.log('handleScreenKeyClick - letter id: \n', letterClicked);

    // Call Handle Selected Letter (below) with letter clicked
    handleSelectedLetter(letterClicked);
}

// ===================================================== 
// Handle Press of Keyboard
//   - Check if key pressed is a letter - if not, ignore press
//   - Capture "letter" of key pressed
//   - Call Handle Selected Letter (below) with letter pressed
// ===================================================== 


// Handle Click of "GUESS" button:
function handleGuess() {
    console.log('handleGuess - numGuesses (aka current guess): \n', numGuesses);
    console.log('handleGuess - guesses[numGuesses]: \n', guesses[numGuesses]);

    let exactMatchCount = 0;
    //   - for each letter in guess, 
    for (let idx in guesses[numGuesses]) {
        let square = guesses[numGuesses][idx];
        console.log('for in working - idx: \n', idx);
        console.log('for in working - square: \n', square);

        console.log('handleGuess - for in - reminder of secret word: \n', secretWord);

        // Check the letter against the secret word
        // TODO handle duplicate letters

        if (square.letter === secretWord.charAt(idx)) {
            // exact match
            // update guess square
            square.state = 'e';
            // update keyboard state
            // update exact match count
            exactMatchCount++;
            console.log(`handleGuess - for in - square at idx ${idx} with letter ${square.letter} is an exact match`);
            console.log(`handleGuess - for in - count of exact matches: \n ${exactMatchCount}`);
        } else {
            // check for partial or no match
            if (secretWord.indexOf(square.letter) > -1) {
                console.log(`handleGuess - for in - square at idx ${idx} with letter ${square.letter} is a partial match`);
                square.state = 'p';
            } else {
                console.log(`handleGuess - for in - square at idx ${idx} with letter ${square.letter} is not a match`);
                square.state = 'n';
            }
        }
        console.log(`handleGuess - for in - count of exact matches: \n ${exactMatchCount}`);
        // Check if letter at that spot is anywhere else in secret word.  If so, mark letter as "found but not exact match"
        // Otherwise, mark letter as "not in secret word"
    };
    //   - Check for win - does guess equal mystery word
    
    //   - Increment number of guesses and reset guess complete
    numGuesses++;
    guessComplete = false;

    //   - If win or lose, update statistics

    // update board
    render();

}

// ===================================================== 
// Handle Click of "PLAY AGAIN" button:
//   - Reinitialize game
// ===================================================== 

// Need to determine if "GUESS" or "PLAY AGAIN" clicked
function handleButtonClick(evt) {
    console.log('handleButtonClick - evt.target.id: \n', evt.target.id);
    if (evt.target.id === 'guess') {
        handleGuess();
    } else {
        // TODO handlePlayAgain();
    }
}

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

// ===================================================== 
//                 EVENT LISTENERS
// ===================================================== 

document.getElementById('keyboard').addEventListener('click', handleScreenKeyClick);

buttonEl.addEventListener('click', handleButtonClick);