# Mineland

This is a minesweeper re-creation! Like Minesweeper, cells on the board can be clicked, which will reveal them. The goal of the game is to reveal every cell on the board, except for those that have mines. When revealed, cells with neighboring mines will be shown with a number on them, corresponding to the number of mines next to that cell. Clicking on a cell that has no adjacency with a bomb will reveal an empty space, and will reveal any empty space around it. This action cascades out until it reaches the edges of the board, any flags, or a numbered cell (while revealing a single layer of numbered cells. Flags may be placed and removed with a right click, and are used to mark potential bomb locations.

---

## [Play the game here](https://davidstinson.github.io/mineland/)

## Screenshots

![https://i.imgur.com/i0HEAhG.png](https://i.imgur.com/i0HEAhG.png)

![https://i.imgur.com/ZqLhCIm.png](https://i.imgur.com/ZqLhCIm.png)

---

## Technologies used

- CSS
- JavaScript
- HTML

---

## Credits

- Uses Animate.css by Daniel Eden. Get it at: [GitHub](https://daneden.github.io/animate.css/)

---

## Ice Box

- [ ] Add functionality to let user choose rows, columns, and number of bombs
- [ ] Font design
- [ ] Dark Mode
- [ ] Add flags on touchscreen device
- [ ] Accessibility features (keyboard input, colorblind settings)
