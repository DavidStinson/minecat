/*-----------------------------------------------------------------------------
================================== Variables ==================================
-----------------------------------------------------------------------------*/
let rows = null
let collumns = null
let time = null
let bombs = null
let winLoss = null
let flags = null
let cellCount = null
let cells = null

/*-----------------------------------------------------------------------------
=================================== Objects ===================================
-----------------------------------------------------------------------------*/
// Object constructor for cells
/*	id
		xcor use for logic and css
		ycor use for logic and css
		bomb
		flag
		revealed
		neighbors array
		neighborsCheck
		*/

class Cell {
  constructor(id, xcor, ycor, number, bomb, flag, revealed, neighbors) {
    this.id = id
    this.xcor = xcor
    this.ycor = ycor
    this.number = number
    this.bomb = bomb
    this.flag = flag
    this.revealed = revealed
    this.neighbors = neighbors
    this.edge = function() {
      if (
        xcor === 0 ||
        xcor === columns - 1 ||
        ycor === 0 ||
        ycor == rows - 1
      ) {
        return true
      }
      return false
    }
  }
  neighborsAllHaveBombs() {
    let neighborBombCount = 0
    this.neighbors.forEach(neighbor => {
      if (neighbor.bomb) neighborBombCount++
    })
    return neighborBombCount === 8 ? true : false
  }
  // Also work on this later
  neighborsAreBlank() {}
}

/*-----------------------------------------------------------------------------
==================================== Cache ====================================
-----------------------------------------------------------------------------*/

const boundingEl = document.querySelector('main')
const titleEl = document.querySelector('#title')
const flagCountEl = document.querySelector('#flag-count')
const mineCatEl = document.querySelector('#mine-cat')
const countdownEl = document.querySelector('#countdown')
const gameboardEl = document.querySelector('#gameboard')

/*-----------------------------------------------------------------------------
=============================== Event Listeners ===============================
-----------------------------------------------------------------------------*/

gameboardEl.addEventListener('click', handleCellClick)
gameboardEl.addEventListener('auxclick', handleCellAuxClick)
mineCatEl.addEventListener('click', endGame)
// listen for click on any cell to trigger handleCellClick
// listen for right click on any cell to trigger handleCellAltClick
// listen for click on emoji man to trigger checkForWin

/*-----------------------------------------------------------------------------
================================= Functions ===================================
-----------------------------------------------------------------------------*/

// init
/* set everything to default
	*EVENTUALLY* Querry the user for everything, or query them to choose a 
	*difficulty
	call cellBuilder
	call 
	call render */
function init() {
  /* 2 rows and columns are added compared to what the user inputs, because the first and last of each are hidden from the user view*/
  // Don't allow user to set less than 12 columns
  rows = 10
  columns = 70
  flags = 20
  bombs = 20
  time = 999
  winLoss = 0
  cellCount = 0
  cells = []
  boardBuilder()
  cellBuilder()
}

function boardBuilder() {
  /* Determine the height of the bounding box with the number of user facing rows, multiplied by the size of each cell, plus the height of all the elements within the bounding box. Do the same for the width using the columns. */
  boundingEl.style.height = (rows - 2) * 25 + 107 + 4 + 'px'
  boundingEl.style.width = (columns - 2) * 25 + 10 + 4 + 'px'
  /* Determine the height of the board with the number of user facing rows, multiplied by the size of each cell. Do the same for the width using the columns */
  gameboardEl.style.columns = (rows - 2) * 25 + 'px'
  gameboardEl.style.width = (columns - 2) * 25 + 'px'
}

// cellBuilder
/*	
		fill with bombs
			If a cells neighbors are all bombs, it cannot be a bomb.
		Remove all edge bombs.
		fill with numbers */

function cellBuilder() {
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      let newCell = new Cell(
        cellCount,
        column,
        row,
        null,
        false,
        false,
        false,
        [
          cellCount - columns - 1,
          cellCount - columns,
          cellCount - columns + 1,
          cellCount - 1,
          cellCount + 1,
          cellCount + columns - 1,
          cellCount + columns,
          cellCount + columns + 1,
        ]
      )
      /* Places cells onto the board, places a bomb in any cell not revealed on the board to remove literal edge cases in bomb placement logic */
      if (newCell.edge() === false) {
        let newCellEl = document.createElement('div')
        newCellEl.setAttribute('id', cellCount)
        newCellEl.classList.add('cell')
        gameboardEl.appendChild(newCellEl)
      } else {
        newCell.bomb = true
      }
      // From this point, logic is carried out using the cells array
      cells.push(newCell)
      cellCount++
    }
  }
  cellCount--
  plantBombs()
}

function plantBombs() {
  let cellsWithBombs = 0
  while (cellsWithBombs < bombs) {
    cellId = getRandomIntInclusive(0, cells.length - 1)
    if (!cells[cellId].bomb) {
      if (!cells[cellId].neighborsAllHaveBombs()) {
        cells[cellId].bomb = true
        console.log(cells[cellId].id + ' now has a bomb')
        cellsWithBombs++
      }
    }
  }
}

// handleCellClick
/*	call checkForLoss
			If player has clicked on a bomb, reveal all the bombsrender*/

function handleCellClick() {}

// handleCellAltClick
/*If player has any remaining flags, place a flag, if no remaining flags flash the flag counter*/

function handleCellAuxClick() {}

function endGame() {}

// render
//  *EVENTUALLY* if the game is starting, query the user for number of rows,
//  *columns, bombs, and time they want to have
/*  Render cells
		render framing
		render countdown
		render emoji button */

function getRandomIntInclusive(minNum, maxNum) {
  minNum = Math.ceil(minNum)
  maxNum = Math.floor(maxNum)
  return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
}

init()
