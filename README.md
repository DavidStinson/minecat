# Minecat!

![A partially completed game of minecat on a 40x30 board with 140 bombs.](https://minecat.davidstinson.dev/assets/images/minecat.jpeg)

Minecat is a Minesweeper re-creation! Cells on the board can be clicked, which will reveal them. The goal of the game is to reveal every cell on the board, except for those that have mines. When revealed, cells with neighboring mines will be shown with a number on them, corresponding to the number of mines next to that cell. Clicking on a cell that has no adjacency with a bomb will reveal an empty space, and will reveal any empty space around it. This action cascades out until it reaches the edges of the board, any flags, or a numbered cell while revealing a single layer of numbered cells. Flags may be placed and removed with a right click, and are used to mark potential bomb locations.

The number of rows, columns, and bombs can be adjusted by using the bar beneath the play board.

## [Play the game here](https://minecat.davidstinson.dev)

## Technologies used 💾

- CSS
- JavaScript
- HTML
- git

## Credits 🙌

- Check out the [Attributions](https://github.com/DavidStinson/minecat/blob/main/attributions.md).

## Recent Changes 🧹

- Refactored CSS, reducing file size by almost a quarter while simultaneously allowing for easier modification in the future.
- Made big changes to how light and dark mode interacts with the DOM, reducing the number of items held in the cache, massively improving memory performance.
- Changes around the number of columns and rows avaiable to improve performance.

## Ice Box 🧊

- [x] Add functionality to let user choose rows, columns, and number of bombs
- [x] Font design
- [x] Halo around fonts
- [x] Dark Mode
- [x] Fix flag display
- [ ] Add flags on touchscreen device
- [ ] Accessibility features (keyboard input, colorblind settings)
- [x] Confetti!
- [ ] Explosion Animations
- [x] Sound
