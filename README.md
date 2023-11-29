# What's the Word?!

## Overview
What's the Word?! is a version of Wordle that gives you six chances to guess a mystery 5-letter word.  After each guess, you'll find out how close you are - letters in the correct spot will be green, letters in the word but in the wrong spot will be yellow, and letters not in the word at all will be white.  The shown keyboard will help you see what letters you haven't yet tried.  Can you figure out...What's the Word?! in time?? Good luck!

## User Stories
As a user, I want to...
  - click to start the game
  - enter word guess using computer keyboard
  - enter word guess using screen keyboard
  - see which letters I have used on screen keyboard
  - celebrate when I get a correct guess
  - be informed of letters in the correct spot
  - be informed of letters in the word but not the correct spot
  - be informed of correct answer when I run out of guesses
  - track the percentage of games I have won
  - track how many games I have won in a row (my current streak)
  - have the ability to play again

## Wireframes

Here is a wireframe of the game starting with an empty board, user entering the first word, and clicking "Guess"

![Game Start](wireframes/gameStart.png)

This wireframe shows how the board will update as the user makes their first and second guesses

![User Guesses](wireframes/userGuesses.png)

Here is a wireframe of the user guessing the correct word and winning!

![User Wins](wireframes/userWins.png)

Unfortunately, they may not guess the word every time so here's what will happen if they lose...

![User Loses](wireframes/userLoses.png)

Finally, this is a wireframe of the user's statistics for the current session.

![User Statistics](wireframes/userStats.png)


## Technologies Used
- HTML5
- CSS3
- JavaScript

##### Font
```css
font-family: Arial, Helvetica, sans-serif;
```

## Next Steps
As a user, I want to...
  - track how many guesses it has taken me to win games
