/*-----------------------------------------------------------------------------
================================== Variables ==================================
-----------------------------------------------------------------------------*/

let gameOver = null
let timer = null
let cellEls = null

/*-----------------------------------------------------------------------------
============================= Objects and Classes =============================
-----------------------------------------------------------------------------*/

input = {
	rows: 12,
	columns: 12,
	bombs: 20,
	firstClick: null,
	pageLoad: 1
}

board = {
	rowsInPlay: null,
	columnsInPlay: null,
	bombsInPlay: null,
	time: null,
	flagCount: null,
	cells: null,
	cellsWithBombs: null,
}

class Cell {
  constructor(id,xcor,ycor,hasBomb,hasFlag,hasNeighboringBombs,isRevealed,neighbors
  ) {
    this.id = id
    this.xcor = xcor
    this.ycor = ycor
    this.hasBomb = hasBomb
    this.hasFlag = hasFlag
    this.hasNeighboringBombs = hasNeighboringBombs
    this.isRevealed = isRevealed
    this.neighbors = neighbors
  }
  isEdge() {
    if (this.xcor === 0 || this.xcor === board.columnsInPlay - 1 ||
      this.ycor === 0 || this.ycor == board.rowsInPlay - 1) {
      return true
    }
    return false
  }
  countNeighborsWithBombs() {
    let neighborBombCount = 0
    this.neighbors.forEach(neighbor => {
      if (board.cells[neighbor].hasBomb) neighborBombCount++
    })
    return neighborBombCount
  }
  cascade() {
    this.neighbors.forEach(neighbor => {
      let cell = board.cells[neighbor]
      if (!cell.isRevealed && !cell.hasFlag) {
        if (cell.hasNeighboringBombs) {
          cellEls[cell.id].classList.add('animate__animated', 'animate__flash')
          cell.isRevealed = true
        }
        if (!cell.hasNeighboringBombs) {
          cell.isRevealed = true
          cellEls[cell.id].classList.add('animate__animated', 'animate__flash')
          //Round and round we go
          cell.cascade()
        }
      }
    })
  }
}

let colorMode = {
  dark: 0,
  light: 1,
  change: false,
  colorStr: 'light',
  changeColorMode: function() {
    if (this.dark) {
      this.light = 1
      this.dark = 0
      this.change = true
    } else {
      this.light = 0
      this.dark = 1
      this.change = true
    }
    preRender()
  },
}

var confettiSettings = {
  target: 'my-canvas',
  size: 2,
  start_from_edge: true,
  props: ['square', 'circle', 'triangle', 'line'],
  rotate: true,
  colors: [ [62, 62, 62], [245, 245, 245], [138, 62, 59],
    [209, 95, 71], [70, 143, 158], [20, 43, 61], ],
}

const confetti = new ConfettiGenerator(confettiSettings)
const explosionMedia = new Audio('../assets/audio/explosion.wav')
const yayMedia = new Audio('../assets/audio/yay.mp3')

/*-----------------------------------------------------------------------------
==================================== Cache ====================================
-----------------------------------------------------------------------------*/

// Query these for logic
const boundingEl = document.querySelector('main')
const gameboardEl = document.querySelector('#gameboard')
const flagCountEl = document.querySelector('#flag-count')
const mineCatEl = document.querySelector('#minecat')
const timeEl = document.querySelector('#time')
// Nav bar elements
const columnsInputEl = document.querySelector('#columns-input')
const rowsInputEl = document.querySelector('#rows-input')
const bombsInputEl = document.querySelector('#bombs-input')
const navBarEl = document.querySelector('nav')
// Elements only used for style
const body = document.querySelector('body')
const lightDarkBtnEl = document.querySelector('#light-dark-btn')

/*-----------------------------------------------------------------------------
=============================== Event Listeners ===============================
-----------------------------------------------------------------------------*/

gameboardEl.addEventListener('click', handleCellClick)
gameboardEl.addEventListener('auxclick', handleCellAuxClick)
mineCatEl.addEventListener('click', init)
navBarEl.addEventListener('click', handleNavBarClick)
navBarEl.addEventListener('change', handleNavBarInputChange)

/*-----------------------------------------------------------------------------
================================= Functions ===================================
-----------------------------------------------------------------------------*/

function init() {
  /* 2 rows and columns are added compared to what the user inputs, because the 
	first and last of each are hidden from the user view*/
  board.rowsInPlay = input.rows + 2
  board.columnsInPlay = input.columns + 2
  board.bombsInPlay = input.bombs
  board.flagCount = board.bombsInPlay
  clearInterval(timer)
  board.time = timer = gameOver = cellCount = board.cellsWithBombs = 0
  board.cells = []
  cellEls = []
  input.firstClick = 1
  timeEl.textContent = '000'
  mineCatEl.textContent = '😸'
  while (gameboardEl.firstChild) {
    gameboardEl.removeChild(gameboardEl.firstChild)
  }
  boardBuilder()
  cellBuilder()
  plantBombs()
  placeNumbers()
  checkUserColorSchemePreference()
}

/*========================= Board and Cell Creation =========================*/

function boardBuilder() {
  /* Determine the height of the bounding box with the number of user facing 
rows, multiplied by the size of each cell, plus the height of all the elements
within the bounding box. Do the same for the width using the columns. */
  boundingEl.style.height = (board.rowsInPlay - 2) * 25 + 130 + 'px'
  boundingEl.style.width = (board.columnsInPlay - 2) * 25 + 34 + 'px'
  /* Determine the height of the board with the number of user facing rows,
	multiplied by the size of each cell. Do the same for the width using the
	columns */
  gameboardEl.style.height = (board.rowsInPlay - 2) * 25 + 'px'
  gameboardEl.style.width = (board.columnsInPlay - 2) * 25 + 'px'
}

function cellBuilder() {
	let cellCount = 0
  for (let row = 0; row < board.rowsInPlay; row++) {
    for (let column = 0; column < board.columnsInPlay; column++) {
      let newCell = new Cell(cellCount, column, row, null, false ,false, false,
        [
					cellCount - board.columnsInPlay - 1, cellCount - board.columnsInPlay,
					cellCount - board.columnsInPlay + 1, cellCount - 1, cellCount + 1,
					cellCount + board.columnsInPlay - 1, cellCount + board.columnsInPlay,
					cellCount + board.columnsInPlay + 1,
        ]
      )
      /* Places cells onto the board, places a bomb in any cell not revealed on
			the board to remove literal edge cases in bomb placement logic */
      if (newCell.isEdge()) {
        // Fill outside edges with bombs, don't show them to the player
        let newCellEl = document.createElement('div')
        cellEls.push(newCellEl)
        newCell.hasBomb = true
      } else {
        let newCellEl = document.createElement('div')
        newCellEl.setAttribute('id', cellCount)
        newCellEl.classList.add('cell')
        gameboardEl.appendChild(newCellEl)
        cellEls.push(newCellEl)
      }
      // From this point, logic is carried out using the cells array
      board.cells.push(newCell)
      cellCount++
    }
  }
}

function plantBombs() {
  while (board.cellsWithBombs < board.bombsInPlay) {
    let cellId = getRandomIntInclusive(0, board.cells.length - 1)
    if (!board.cells[cellId].hasBomb) {
      board.cells[cellId].hasBomb = true
      board.cellsWithBombs++
    }
  }
  /*Prevent the edge case of a 9 bombs within a 3x3 area (or 6 bombs within
		2x3 area around the edges OR 4 bombs within a 2x2 area in the corners)*/
  board.cells.forEach(cell => {
    if (!cell.isEdge() && cell.hasBomb && cell.countNeighborsWithBombs() == 8) {
      cell.hasBomb = false
      board.cellsWithBombs--
      //Round and round we go
      plantBombs()
    }
  })
}

function placeNumbers() {
  /* Remove bombs from outside cells, they will interfere with number placement.
Fill cells with a number and mark them as revealed. We are now done with edges*/
  board.cells.forEach(cell => {
    if (cell.isEdge()) {
      cell.hasBomb = false
      cell.hasNeighboringBombs = 1
      cell.isRevealed = true
    }
	})
	/* NOW place numbers in cells */
  board.cells.forEach(cell => {
    if (!cell.isEdge() && !cell.hasBomb) {
      cell.hasNeighboringBombs = cell.countNeighborsWithBombs()
      //document.getElementById(cell.id).textContent = cell.hasNeighboringBombs
    }
  })
}

function checkForEndGame() {
  cellsToBeRevealed = null
  board.cells.forEach(cell => {
    if (!cell.isRevealed) {
      cellsToBeRevealed++
    }
  })
  if (!gameOver && cellsToBeRevealed === board.bombsInPlay) {
    gameOver = 1
    confetti.render()
    yayMedia.play()
  }
  if (gameOver) {
    board.cells.forEach(cell => {
      cell.isRevealed = true
      cellEls[cell.id].classList.add('animate__animated', 'animate__flash')
    })
  }
  preRender()
}

/*============================= Event Functions =============================*/

function handleCellClick(evnt) {
  if (input.firstClick) {
    timer = setInterval(renderTime, 1000)
  }
  let cell = board.cells[evnt.target.id]
  let cellEl = cellEls[evnt.target.id]
  if (!gameOver && !cell.hasFlag && !cell.isRevealed) {
    if (cell.hasBomb) {
      cell.isRevealed = true
      cellEl.classList.add('animate__animated', 'animate__flash')
      explosionMedia.play()
      gameOver = -1
    } else if (cell.hasNeighboringBombs) {
      cell.isRevealed = true
      cellEl.classList.add('animate__animated', 'animate__flash')
    } else {
      cell.isRevealed = true
      cellEl.classList.add('animate__animated', 'animate__flash')
      cell.cascade()
    }
    checkForEndGame()
  }
}

function handleCellAuxClick(evnt) {
  let cell = board.cells[evnt.target.id]
  if (!gameOver && !cell.isRevealed) {
    if (board.flagCount) {
      cell.hasFlag
        ? ((cell.hasFlag = false), board.flagCount++)
        : ((cell.hasFlag = true), board.flagCount--)
    } else {
      flagCountEl.classList.add('animate__animated', 'animate__flash')
    }
  }
  preRender()
}

function handleNavBarClick(evnt) {
	let targetBtn = evnt.target.id
  switch (targetBtn) {
    case 'sub-columns-btn':
			input.columns--
      break
    case 'sub-rows-btn':
			input.rows--
      break
    case 'sub-bombs-btn':
			input.bombs--
      break
    case 'pos-columns-btn':
			input.columns++
      break
    case 'pos-rows-btn':
			input.rows++
      break
    case 'pos-bombs-btn':
			input.bombs++
      break
    case 'light-dark-btn':
      colorMode.changeColorMode()
      break
	}
	input.columns = validateNumInput(input.columns, 10, 70, 12)
	input.rows = validateNumInput(input.rows, 8, 50, 12)
	input.bombs = validateNumInput(input.bombs, 5, ((input.rows) * (input.columns)) / 2, 20)
  preRender()
}

function handleNavBarInputChange(){
	input.columns = validateNumInput(columnsInputEl.value, 10, 70, 12)
	input.rows = validateNumInput(rowsInputEl.value, 8, 50, 12)
	input.bombs = validateNumInput(bombsInputEl.value, 5, 
		((input.rows) * (input.columns)) / 2, 20)
	preRender()
}

/*================================== Render ==================================*/

function checkUserColorSchemePreference() {
  if (input.pageLoad) {
    if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
      colorMode.changeColorMode()
      input.pageLoad = 0
    }
  }
  preRender()
}

function preRender() {
  if (colorMode.change) {
    if (colorMode.dark) {
      lightDarkBtnEl.textContent = 'light'
      body.classList.replace('light', 'dark')
    } else {
      lightDarkBtnEl.textContent = 'dark'
      body.classList.replace('dark', 'light')
    }
    colorMode.change = false
  }
  render()
}

function render() {
  let flagCountStr = formatNumberWithPadding(board.flagCount, '0', 3)
  flagCountEl.textContent = flagCountStr
  if (gameOver) {
    gameOver === 1
      ? (mineCatEl.textContent = '😻')
      : (mineCatEl.textContent = '🙀')
  }
  cellEls.forEach((cellEl, idx) => {
    let cell = board.cells[idx]
    if (cell.isRevealed) {
      cellEl.classList.add('revealed')
      if (cell.hasBomb) {
        gameOver === 1
          ? (cellEl.textContent = '😻')
          : (cellEl.textContent = '💣')
      } else if (cell.hasNeighboringBombs) {
        cellEl.textContent = cell.hasNeighboringBombs
        cellEl.classList.add(`num${cell.hasNeighboringBombs}`)
      } else {
        cellEl.textContent = ''
      }
    }
    if (cell.hasFlag) cellEl.textContent = '🚩'
    if (!cell.isRevealed && !cell.hasFlag) cellEl.textContent = ''
  })
  columnsInputEl.value = input.columns
  rowsInputEl.value = input.rows
  bombsInputEl.value = input.bombs
}

function renderTime() {
  input.firstClick = 0
  if (!gameOver) {
    if (board.time < 999) {
      board.time++
      let timeStr = formatNumberWithPadding(board.time, '0', 3)
      timeEl.textContent = timeStr
    }
  }
}

/*============================= Helper Functions =============================*/

function formatNumberWithPadding(num, pad, len) {
  num += ''
  if (num.length >= len) return num
  return pad.repeat(len - num.length) + num
}

function getRandomIntInclusive(minNum, maxNum) {
  minNum = Math.ceil(minNum)
  maxNum = Math.floor(maxNum)
  return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
}

function validateNumInput(inputVal, lowerBound, upperBound, defaultVal) {
	inputVal = parseInt(inputVal)
	if (isNaN(inputVal)) return defaultVal
	if (inputVal < lowerBound) return lowerBound
	if (inputVal > upperBound) return upperBound
	return inputVal
}

/*============================ Development Tools ============================*/

function iLikeToWin() {
  board.cells.forEach(cell => {
    if (!cell.hasBomb) cell.isRevealed = true
  })
  checkForEndGame()
}

/*================================== init ==================================*/

init()