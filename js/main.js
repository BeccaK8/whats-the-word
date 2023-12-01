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
const SECRET_WORD_LIST = ['SKANT', 'SKUNK', 'STANK', 'SUSIS', 'STARE', 'QUOTA', 'JUMPY', 'SKUNK'];

const EXACT_MATCH = 'e';
const PARTIAL_MATCH = 'p';
const NO_MATCH = 'n';
const UNKNOWN = 0;

const LETTER_STATE_LOOKUP = {
    [EXACT_MATCH]: {desc: 'Exact Match', bgColor: 'rgb(10 123 55)', color: 'white'},
    [PARTIAL_MATCH]: {desc: 'Partial Match', bgColor: 'rgb(255 192 0)', color: 'white'},
    [NO_MATCH]: {desc: 'No Match', bgColor: 'rgb(89 89 89)', color: 'white'},
    [UNKNOWN]: {desc: 'Unknown', bgColor: 'white', color: 'black'}
};

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const WIN = 'W';
const LOSS = 'L';

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
const messageEl = document.querySelector('h2');
const buttonEl = document.getElementsByClassName('button')[0];
// console.log('buttonEl: \n', buttonEl);

// grab keyboard elements and save them to an array
const keysEls = [...document.querySelectorAll(".row > div")];

// help popup
const helpPopupLinkEl = document.getElementById('popup-help-link');
const helpPopupWindowEl = document.getElementById('popup-help-window');
const helpCloseEl = document.getElementById('close-help');

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

    render();
}

init();

// is game over?
function isGameOver() {
    return gameStatus === WIN || gameStatus === LOSS;
}

// Get Secret Word - Select a random word from the master array and return it
function getSecretWord() {
    const wordIdx = Math.floor(Math.random() * SECRET_WORD_LIST.length);
    console.log('\n getSecretWord() - secretWord: \n', SECRET_WORD_LIST[wordIdx]);

    return SECRET_WORD_LIST[wordIdx];
}

// Reset Guesses Array - Reinitialize guesses to be a two-dimensional array
//  of objects - initially containing just a state of 0 (or unknown), with all letter k:v's deleted
function resetGuesses() {
    // console.log('resetGuesses - guesses before: \n', guesses);
    guesses = new Array(MAX_GUESSES);
    for (let i = 0; i < MAX_GUESSES; i++) {
        // console.log(`resetGuesses - outer i loop - i=${i}`);
        // console.log('AND guesses[i] = \n', guesses[i]);
        guesses[i] = [];
        
        for (let j = 0; j < WORD_LENGTH; j++) {
            // console.log(`BEFORE resetGuesses - inner j loop - i=${i} j=${j}`);
            // console.log('AND guesses[i] BEFORE = \n', guesses[i][j]);
            guesses[i][j] = { state: UNKNOWN };
            // console.log(`AFTER STATE CHANGE resetGuesses - inner j loop - i=${i} j=${j}`);
            // console.log('AND guesses[i] AFTER STATE CHANGE = \n', guesses[i][j]);
        }
    }
}

// Render the appropriate message (make a guess, you win, you lose)
function renderMessage() {
    if (gameStatus === WIN) {
        // message user wins
        messageEl.innerText = `Congratulations!  You won in ${numGuesses} ${numGuesses === 1 ? 'guess' : 'guesses'}!`;
    } else if (gameStatus === LOSS) {
        // message user ran out of turns
        messageEl.innerHTML = `
            So close!  The word was 
            <span style="color: ${LETTER_STATE_LOOKUP['e'].bgColor}">${secretWord}</span>
        `;
    } else if (numGuesses === 0) {
        // message to get started
        messageEl.innerText = "Let's play...";
    } else {
        // message to guess again
        const guessesLeft = MAX_GUESSES - numGuesses;
        messageEl.innerText = `Nice try! You have ${guessesLeft} ${guessesLeft === 1 ? 'guess' : 'guesses'} left...`;
    }
}

// Render the guesses with the appropriate background color based on the guess's state (exact match, partial match, no match, unknown - not tried)
function renderGuesses() {
    // loop through the guesses array
    // get the element for that square and set the text and background color based on the object
    for (let i = 0; i < MAX_GUESSES; i++) {
        for (let j = 0; j < WORD_LENGTH; j++) {
            const squareEl = document.getElementById(`g${i}l${j}`);
            const square = guesses[i][j];
            // console.log('squareEl key: \n',`g${i}l${j}`);
            // console.log('squareEl: \n', squareEl);

            // console.log('guesses[i][j]: \n', square);
            // console.log('guesses[i][j].state: \n', square.state);
            // console.log('guesses[i][j].letter: \n', square.letter);
            // change the text if that square in guesses has a letter picked; otherwise, change it to a '' to erase if backspace hit
            squareEl.innerText = square.letter ? square.letter : '';
            squareEl.style.backgroundColor = LETTER_STATE_LOOKUP[square.state].bgColor;
            squareEl.style.color = LETTER_STATE_LOOKUP[square.state].color;
        }
    }
}

// Render the screen keyboard with the appropriate background color based on the letter's state (exact match, partial match, no match, unknown - not tried)
function renderKeys() {
    // Loop through the keys eleements
    // for each element see if it's letter has been used (if not, set to "unknown"  or 0)
    // and change the background and font color
 
    keysEls.forEach((keyEl) => {
        const letter = keyEl.id;
        // console.log('renderKeys - keyEl = \n', keyEl);
        // console.log('renderKeys - letter \n:', letter);
        // console.log('renderKeys - lettersUsed[letter] \n:', lettersUsed[letter]);
        const letterState = lettersUsed[letter] ? lettersUsed[letter] : UNKNOWN;
        // console.log('renderKeys() - letterState = \n', letterState);
        // console.log('renderKeys() - LETTER_STATE_LOOKUP[letterState] = \n', LETTER_STATE_LOOKUP[letterState]);
        // console.log('renderKeys - keyEl \n:', keyEl);
        keyEl.style.backgroundColor = LETTER_STATE_LOOKUP[letterState].bgColor;
        keyEl.style.color = LETTER_STATE_LOOKUP[letterState].color;
    });
}

// Render the button: "GUESS" if user has more tries or "PLAY AGAIN" if they lost
function renderButtons() {

    // if user wins or loses, set the id and text of the button to "Play Again"
    if (isGameOver()) {
        buttonEl.style.visibility = 'visible';
        buttonEl.innerText = 'Play Again';
        buttonEl.id = 'playAgain';
    } else if (guessComplete) {
        // if the guess is complete, set the id and text of the button to "Guess"
        buttonEl.style.visibility = 'visible';
        buttonEl.innerText = 'Guess';
        buttonEl.id = 'guess';
        // if the guess is complete, add a class that changes the button colors to entice them to enter their guess
        if (guessComplete) {
            buttonEl.classList.add('guessComplete');
        } else {
            buttonEl.classList.remove('guessComplete');
        }
    } else {
        // hide the button if there's no action to be performed
        buttonEl.style.visibility = 'hidden';
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

    // if the game is already  over, just return
    if (isGameOver()) return;

    let letterIdx = 0;   // this will be the index of the next empty letter in the guess
    // console.log('handleSelectedLetter: input letter: \n', letter);
    // console.log('handleSelectedLetter: guess square letter: \n', guesses[numGuesses][letterIdx].letter);
    
    // check if they hit the backspace button
    const isBackspace = letter.toLowerCase() === 'backspace';
    // console.log('handleSelectedLetter: isbackspace - \n', isBackspace);

    while (letterIdx < WORD_LENGTH && guesses[numGuesses][letterIdx].letter) {
        // console.log('handleSelectedLetter - in while with letterIdx of: \n', letterIdx);
        letterIdx++;
    }
    // console.log('handleSelectedLetter - out of while with letterIdx of: \n', letterIdx);

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
    // console.log('handleScreenKeyClick - letter id: \n', letterClicked);

    // Call Handle Selected Letter (below) with letter clicked
    handleSelectedLetter(letterClicked);
}

// ===================================================== 
// Handle Press of Keyboard
//   - Check if key pressed is a letter - if not, igre press
//   - Capture "letter" of key pressed
//   - Call Handle Selected Letter (below) with letter pressed
// ===================================================== 
function handleKeyUp(evt) {
    // console.log('handleKeyUp - event key: \n', evt.key);
    // console.log('handleKeyUp - event code: \n', evt.code);
    const evtKey = evt.key.toUpperCase();
    // console.log('handleKeyUp - eventkey: \n', evtKey);
    // if it's not a letter or the backspace, just return
    if (evt.code !== `Key${evtKey}` && evt.code !== 'Backspace' && evt.code !== 'Enter') return;

    if (evt.code !== 'Enter') {
        handleSelectedLetter(evtKey);
    } else {
        // user triggered the button using "enter" key so grab the current id of the element (guess or playAgain) and pass it through same logic as if button clicked
        handleButtonAction(buttonEl.id);
    }
}

// Update letters used to add letter if not there and to update state appropriately
function updateLettersUsed(letter, state) {
    // console.log('updateLettersUsed: letter = \n', letter);
    // console.log('updateLettersUsed: state = \n', state);
    // console.log('updateLettersUsed: lettersUsed BEFORE = \n', lettersUsed);

    // console.log('updateLettersUsed: lettersUsed[letter] BEFORE = \n', lettersUsed[letter]);
    // see if state needs to be updated - only update it if it's not already used OR not already exact - once exact, it won't change
    if (!lettersUsed[letter] || lettersUsed[letter] !== EXACT_MATCH) {
        // unless the existing state is PARTIAL and the new state is NOT FOUND -- repeat letter scenario
        if (lettersUsed[letter] === PARTIAL_MATCH && state === NO_MATCH) return;
        lettersUsed[letter] = state;
    }

    // console.log('updateLettersUsed: lettersUsed[letter] AFTER = \n', lettersUsed[letter]);
    // console.log('updateLettersUsed: lettersUsed AFTER = \n', lettersUsed);
}

function canHandleGuess() {
    return !isGameOver() && guessComplete;
}

// Get state of given letter relative to secretWord at the given index
function getLetterState(letter, idx) {
    return (secretWord.includes(letter)) ? ((secretWord.charAt(idx) === letter) ? EXACT_MATCH : PARTIAL_MATCH) : NO_MATCH;
}

// Compare guess (argument is an array of square objects) to secret word and update square state and letters used appropriately
function checkGuess(guess) {

    // console.log('checkGuess - guess argument: \n', guess);
    
    // build guessWord from guess array of square objects
    // and an array of letters in 
    let guessWord = '';
    let guessLetters = {};
    for (let idx in guess) {
        const letter = guess[idx].letter;
        guessWord = guessWord + letter;
        if (!guessLetters[letter]) guessLetters[letter] = [];
        guessLetters[letter].push(idx);
    };
    // console.log('checkGuess - guessLetters: \n', guessLetters);
    // console.log('handleGuess - guessWord: \n', guessWord);

    // check to see if match
    if (guessWord === secretWord) {
        //update guess states and game status
        for (let idx in guess) {
            guess[idx].state = EXACT_MATCH;
        }
        gameStatus = WIN;
    } else {
        // guess is not the secret word
        // for each unique letter in guess
        for (let letter in guessLetters) {
            // console.log('guessLetters[letter].length: \n', guessLetters[letter].length);
            // if the letter only exists once in guess, then process normally
            if (guessLetters[letter].length === 1) {
                let idx = guessLetters[letter][0];
                guess[idx].state = getLetterState(letter, idx);
            } else {
                // handle repeats
                const guessLetterIndexes = guessLetters[letter];
                const secretRptIndexes = [];
                for (let i = 0; i < secretWord.length; i++) {
                    if (secretWord[i] === letter) {
                        secretRptIndexes.push(i);
                    }
                }
                if (secretRptIndexes.length >= guessLetterIndexes.length) {
                    // can still process normally
                    guessLetterIndexes.forEach((idx) => guess[idx].state = getLetterState(letter, idx));
                } else {
                    // Handle scenario where the letter is repeated more in guess than secret

                    // handle exact matches first
                    let exactMatchCount = 0;
                    // loop through indexes of that letter in the secret word (since fewer here)
                    secretRptIndexes.forEach((idx) => {
                        // if the index of the letter in secret word matches one of the indexes that same letter is in for guess
                        const matchLetterIndex = guessLetterIndexes.indexOf(idx.toString());
                        // if that index is in guess letter index array - its an exact match so just get letter state normally
                        if (matchLetterIndex > -1) {
                            guess[idx].state = EXACT_MATCH;
                            //    and pop that index off of the guess letter array and secret word array
                            guessLetterIndexes.splice(matchLetterIndex, 1);
                            exactMatchCount++;
                        }
                    });

                    // of the remaining, a subset may be PARTIAL, the rest will be NOT FOUND
                    let partialCount = secretRptIndexes.length - exactMatchCount;
                    guessLetterIndexes.forEach((glIdx) => {
                        console.log('handle repeats - partial count = \n', partialCount);
                        // console.log('handle repeats - now need to mark the p and n: glIdx = \n', glIdx);
                        guess[glIdx].state = (partialCount > 0) ? PARTIAL_MATCH : NO_MATCH;
                        partialCount--;
                    });
                }
            }
        }
    }

    // update the keyboard state
    for (let idx in guess) {
        updateLettersUsed(guess[idx].letter, guess[idx].state);
    }
}


// Handle Click of "GUESS" button:
function handleGuess() {
    // console.log('handleGuess - numGuesses (aka current guess): \n', numGuesses);
    // console.log('handleGuess - guesses[numGuesses]: \n', guesses[numGuesses]);
    // console.log('handleGuess - for in - reminder of secret word: \n', secretWord);

    // if we cannot process the guess for some return then just return
    if (!canHandleGuess()) return;

    checkGuess(guesses[numGuesses]);

    //   - Check for win - does guess equal mystery word
    if (gameStatus === WIN) {
        // they guessed the right word!
        numGuesses++;  // to get it to actual number of guesses (1-based)
        player.recordWin();
    } else {
        // Increment number of guesses and reset guessComplete
        numGuesses++;
        guessComplete = false;

        // have they run out of guesses and lost
        if (numGuesses === MAX_GUESSES) {
            gameStatus = LOSS; 
            player.recordLoss();
        }
    }

    // update board
    render();
}

// Handle Click of "PLAY AGAIN" button:
function handlePlayAgain() {
    //   - Reinitialize game
    init();
}

// Need to determine if "GUESS" or "PLAY AGAIN" clicked - making it generic to work for both button click and ENTER keyup
function handleButtonAction(action) {
    if (action === 'guess') {
        handleGuess();
    } else {
        handlePlayAgain();
    }
}

function handleButtonClick(evt) {
    // console.log('handleButtonClick - evt.target.id: \n', evt.target.id);
    handleButtonAction(evt.target.id);
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

document.addEventListener('keyup', handleKeyUp);

helpPopupLinkEl.addEventListener('click', (evt) => {
    evt.preventDefault();
    helpPopupWindowEl.style.display = 'block';
});

helpCloseEl.addEventListener('click', () => helpPopupWindowEl.style.display = 'none');