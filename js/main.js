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
let cellsWithBombs = null

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
  constructor(
    id,
    xcor,
    ycor,
    neighboringBombs,
    hasBomb,
    hasFlag,
    isRevealed,
    neighbors
  ) {
    this.id = id
    this.xcor = xcor
    this.ycor = ycor
    this.neighboringBombs = neighboringBombs
    this.hasBomb = hasBomb
    this.hasFlag = hasFlag
    this.isRevealed = isRevealed
    this.neighbors = neighbors
  }
  isEdge() {
    if (
      this.xcor === 0 ||
      this.xcor === columns - 1 ||
      this.ycor === 0 ||
      this.ycor == rows - 1
    ) {
      return true
    }
    return false
  }
  countNeighborsWithBombs() {
    let neighborBombCount = 0
    this.neighbors.forEach(neighbor => {
      if (cells[neighbor].hasBomb) neighborBombCount++
    })
    return neighborBombCount
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

/*-----------------------------------------------------------------------------
================================= Functions ===================================
-----------------------------------------------------------------------------*/

// init
/* set everything to default
	*EVENTUALLY* Querry the user for everything, or query them to choose a 
	*difficulty
	call render */
function init() {
	/* 2 rows and columns are added compared to what the user inputs, because the 
	first and last of each are hidden from the user view*/
  // Don't allow user to set less than 12 columns
  rows = 10
  columns = 14
  flags = 20
  bombs = 10
  time = 999
  winLoss = cellCount = cellsWithBombs = 0
  cells = []
  boardBuilder()
	cellBuilder()
}

function boardBuilder() {
  /* Determine the height of the bounding box with the number of user facing 
rows, multiplied by the size of each cell, plus the height of all the elements
within the bounding box. Do the same for the width using the columns. */
  boundingEl.style.height = (rows - 2) * 25 + 107 + 4 + 'px'
  boundingEl.style.width = (columns - 2) * 25 + 10 + 4 + 'px'
  /* Determine the height of the board with the number of user facing rows,
	multiplied by the size of each cell. Do the same for the width using the columns */
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
      /* Places cells onto the board, places a bomb in any cell not revealed on
			the board to remove literal edge cases in bomb placement logic */
      if (newCell.isEdge()) {
        // Fill outside edges with bombs, don't show them to the player
        newCell.hasBomb = true
      } else {
        let newCellEl = document.createElement('div')
        newCellEl.setAttribute('id', cellCount)
        newCellEl.classList.add('cell')
        gameboardEl.appendChild(newCellEl)
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
  while (cellsWithBombs < bombs) {
    cellId = getRandomIntInclusive(0, cells.length - 1)
    if (!cells[cellId].hasBomb) {
      cells[cellId].hasBomb = true
      cellsWithBombs++
      document.getElementById(cells[cellId].id).textContent = 'b'
    }
  }
  /*Prevent the edge case of a 9 bombs within a 3x3 area (or 6 bombs within
		2x3 area around the edges OR 4 bombs within a 2x2 area in the corners)*/
  cells.forEach(cell => {
    if (!cell.isEdge()) {
      if (cell.hasBomb) {
        if (cell.countNeighborsWithBombs() === 8) {
          cell.hasBomb = false
          cellsWithBombs--
          document.getElementById(cell.id).textContent = ''
          //Round and round we go
          plantBombs()
        }
      }
    }
  })
  placeNumbers()
}

function placeNumbers() {
  /* Remove bombs from outside cells, they will interfere with number placement.
Fill cells with a number and mark them as revealed. We are now done with edges*/
  cells.forEach(cell => {
    if (cell.isEdge()) {
      cell.hasBomb = false
      cell.neighboringBombs = 1
      cell.isRevealed = true
    }
  })
  cells.forEach(cell => {
    if (!cell.isEdge()) {
      if (!cell.hasBomb) {
        cell.neighboringBombs = cell.countNeighborsWithBombs()
        document.getElementById(cell.id).textContent = cell.neighboringBombs
      }
    }
  })
}

// handleCellClick
/*	call checkForLoss
			If player has clicked on a bomb, reveal all the bombs
			render*/

function handleCellClick(evnt) {}

// handleCellAltClick
/*If player has any remaining flags, place a flag, if no remaining flags flash the flag counter
	render*/

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
