/*-----------------------------------------------------------------------------
================================== Variables ==================================
-----------------------------------------------------------------------------*/
let rows = null
let columns = null
let time = null
let bombs = null
let flagCount = null
let playerCells = null
let cellCount = null
let cells = null
let cellsWithBombs = null
let gameOver = null
let cellsToBeRevealed = null
let timer = null
let cellEls = null
let firstClick = null
let pageLoad = 1
let bombsInPlay = null

/*-----------------------------------------------------------------------------
============================= Objects and Classes =============================
-----------------------------------------------------------------------------*/

class Cell {
  constructor(
    id,
    xcor,
    ycor,
    hasBomb,
    hasFlag,
    hasNeighboringBombs,
    isRevealed,
    neighbors
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
  cascade() {
    this.neighbors.forEach(neighbor => {
      let cell = cells[neighbor]
      if (!cell.isRevealed && !cell.hasFlag) {
        if (cell.hasNeighboringBombs) {
          cellEls[cell.id].classList.add('animated', 'flash')
          cell.isRevealed = true
        }
        if (!cell.hasNeighboringBombs) {
          cell.isRevealed = true
          cellEls[cell.id].classList.add('animated', 'flash')
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
  colors: [
    [62, 62, 62],
    [245, 245, 245],
    [138, 62, 59],
    [209, 95, 71],
    [70, 143, 158],
    [20, 43, 61],
  ],
}

const confetti = new ConfettiGenerator(confettiSettings)
const explosionMedia = new Audio('../media/explosion.wav')
const yayMedia = new Audio('../media/yay.mp3')

/*-----------------------------------------------------------------------------
==================================== Cache ====================================
-----------------------------------------------------------------------------*/

// Query these for logic
const boundingEl = document.querySelector('main')
const gameboardEl = document.querySelector('#gameboard')
const flagCountEl = document.querySelector('#flag-count')
const mineCatEl = document.querySelector('#mine-cat')
const timeEl = document.querySelector('#time')
// Nav bar elements
const columnsInputEl = document.querySelector('#columns-input')
const rowsInputEl = document.querySelector('#rows-input')
const bombsInputEl = document.querySelector('#bombs-input')
const navBarEl = document.querySelector('nav')
// Nav bar element only used for style
const allEls = document.querySelectorAll('*')
const lightDarkBtnEl = document.querySelector('#light-dark-btn')

/*-----------------------------------------------------------------------------
=============================== Event Listeners ===============================
-----------------------------------------------------------------------------*/

gameboardEl.addEventListener('click', handleCellClick)
gameboardEl.addEventListener('auxclick', handleCellAuxClick)
mineCatEl.addEventListener('click', init)
navBarEl.addEventListener('click', handleNavBarClick)

/*-----------------------------------------------------------------------------
================================= Functions ===================================
-----------------------------------------------------------------------------*/

function init() {
  /* 2 rows and columns are added compared to what the user inputs, because the 
	first and last of each are hidden from the user view*/
  // Don't allow user to set less than 12 columns
  rows = parseInt(rowsInputEl.value) + 2
  if (rows > 52) rows = 52
  if (rows < 12 || isNaN(rows)) rows = 12
  columns = parseInt(columnsInputEl.value) + 2
  if (columns > 72) columns = 72
  if (columns < 12 || isNaN(columns)) columns = 12
  bombs = parseInt(bombsInputEl.value)
  if (bombs > ((rows - 2) * (columns - 2)) / 2 || isNaN(columns)) {
    bombs = ((rows - 2) * (columns - 2)) / 2
  }
  if (bombs < 5) bombs = 5
  bombsInPlay = flagCount = bombs
  time = 0
  gameOver = cellCount = cellsWithBombs = 0
  cells = []
  cellEls = []
  firstClick = 1
  clearInterval(timer)
  timer = 0
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
  boundingEl.style.height = (rows - 2) * 25 + 107 + 4 + 20 + 'px'
  boundingEl.style.width = (columns - 2) * 25 + 10 + 4 + 20 + 'px'
  /* Determine the height of the board with the number of user facing rows,
	multiplied by the size of each cell. Do the same for the width using the
	columns */
  gameboardEl.style.height = (rows - 2) * 25 + 'px'
  gameboardEl.style.width = (columns - 2) * 25 + 'px'
}

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
        let newCellEl = document.createElement('div')
        cellEls.push(newCellEl)
        newCell.hasBomb = true
      } else {
        let newCellEl = document.createElement('div')
        newCellEl.setAttribute('id', cellCount)
        newCellEl.classList.add('cell')
        colorMode.dark
          ? newCellEl.classList.add('dark')
          : newCellEl.classList.add('light')
        gameboardEl.appendChild(newCellEl)
        cellEls.push(newCellEl)
      }
      // From this point, logic is carried out using the cells array
      cells.push(newCell)
      cellCount++
    }
  }
}

function plantBombs() {
  while (cellsWithBombs < bombsInPlay) {
    let cellId = getRandomIntInclusive(0, cells.length - 1)
    if (!cells[cellId].hasBomb) {
      cells[cellId].hasBomb = true
      cellsWithBombs++
    }
  }
  /*Prevent the edge case of a 9 bombs within a 3x3 area (or 6 bombs within
		2x3 area around the edges OR 4 bombs within a 2x2 area in the corners)*/
  cells.forEach(cell => {
    if (!cell.isEdge() && cell.hasBomb && cell.countNeighborsWithBombs() == 8) {
      cell.hasBomb = false
      cellsWithBombs--
      //Round and round we go
      plantBombs()
    }
  })
}

function placeNumbers() {
  /* Remove bombs from outside cells, they will interfere with number placement.
Fill cells with a number and mark them as revealed. We are now done with edges*/
  cells.forEach(cell => {
    if (cell.isEdge()) {
      cell.hasBomb = false
      cell.hasNeighboringBombs = 1
      cell.isRevealed = true
    }
  })
  cells.forEach(cell => {
    if (!cell.isEdge() && !cell.hasBomb) {
      cell.hasNeighboringBombs = cell.countNeighborsWithBombs()
      //document.getElementById(cell.id).textContent = cell.hasNeighboringBombs
    }
  })
}

function checkForEndGame() {
  cellsToBeRevealed = null
  cells.forEach(cell => {
    if (!cell.isRevealed) {
      cellsToBeRevealed++
    }
  })
  if (!gameOver && cellsToBeRevealed === bombsInPlay) {
    gameOver = 1
    confetti.render()
    yayMedia.play()
  }
  if (gameOver) {
    cells.forEach(cell => {
      cell.isRevealed = true
      cellEls[cell.id].classList.add('animated', 'flash')
    })
  }
  preRender()
}

/*============================= Event Functions =============================*/

function handleCellClick(evnt) {
  if (firstClick) {
    timer = setInterval(renderTime, 1000)
  }
  let cell = cells[evnt.target.id]
  let cellEl = cellEls[evnt.target.id]
  if (!gameOver && !cell.hasFlag && !cell.isRevealed) {
    if (cell.hasBomb) {
      cell.isRevealed = true
      cellEl.classList.add('animated', 'flash')
      explosionMedia.play()
      gameOver = -1
    } else if (cell.hasNeighboringBombs) {
      cell.isRevealed = true
      cellEl.classList.add('animated', 'flash')
    } else {
      cell.isRevealed = true
      cellEl.classList.add('animated', 'flash')
      cell.cascade()
    }
    checkForEndGame()
  }
}

function handleCellAuxClick(evnt) {
  let cell = cells[evnt.target.id]
  if (!gameOver && !cell.isRevealed) {
    if (flagCount) {
      cell.hasFlag
        ? ((cell.hasFlag = false), flagCount++)
        : ((cell.hasFlag = true), flagCount--)
    } else {
      flagCountEl.classList.add('animated', 'flash')
    }
  }
  preRender()
}

function handleNavBarClick(evnt) {
  let targetBtn = evnt.target.id
  switch (targetBtn) {
    case 'sub-columns-btn':
      if (!isNaN(parseInt(columnsInputEl.value)) && columns > 12) {
        columns = parseInt(columnsInputEl.value) + 1
      }
      break
    case 'sub-rows-btn':
      if (!isNaN(parseInt(rowsInputEl.value)) && rows > 10) {
        rows = parseInt(rowsInputEl.value) + 1
      }
      break
    case 'sub-bombs-btn':
      if (!isNaN(parseInt(bombsInputEl.value)) && bombs > 5) {
        bombs = parseInt(bombsInputEl.value) - 1
      }
      break
    case 'pos-columns-btn':
      if (!isNaN(parseInt(columnsInputEl.value)) && columns < 72) {
        columns = parseInt(columnsInputEl.value) + 3
      }
      break
    case 'pos-rows-btn':
      if (!isNaN(parseInt(rowsInputEl.value)) && rows < 52) {
        rows = parseInt(rowsInputEl.value) + 3
      }
      break
    case 'pos-bombs-btn':
      if (
        !isNaN(parseInt(bombsInputEl.value)) &&
        bombs < ((rows - 2) * (columns - 2)) / 2
      ) {
        bombs = parseInt(bombsInputEl.value) + 1
      }
      break
    case 'light-dark-btn':
      colorMode.changeColorMode()
      break
  }
  preRender()
}

/*================================== Render ==================================*/

function checkUserColorSchemePreference() {
  if (pageLoad) {
    if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
      colorMode.changeColorMode()
      pageLoad = 0
    }
  }
  preRender()
}

function preRender() {
  if (colorMode.change) {
    if (colorMode.dark) {
      cellEls.forEach(cellEl => cellEl.classList.replace('light', 'dark'))
      lightDarkBtnEl.textContent = 'light'
      allEls.forEach(el => {
        el.classList.replace('light', 'dark')
      })
    } else {
      cellEls.forEach(cellEl => cellEl.classList.replace('dark', 'light'))
      allEls.forEach(el => {
        el.classList.replace('dark', 'light')
      })
    }
    colorMode.change = false
  }
  render()
}

function render() {
  let flagCountStr = formatNumberWithPadding(flagCount, '0', 3)
  flagCountEl.textContent = flagCountStr
  if (gameOver) {
    gameOver === 1
      ? (mineCatEl.textContent = '😻')
      : (mineCatEl.textContent = '🙀')
  }
  cellEls.forEach((cellEl, idx) => {
    let cell = cells[idx]
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
  columnsInputEl.value = columns - 2
  rowsInputEl.value = rows - 2
  bombsInputEl.value = bombs
}

function renderTime() {
  firstClick = 0
  if (!gameOver) {
    if (time < 999) {
      time++
      let timeStr = formatNumberWithPadding(time, '0', 3)
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

/*============================ Development Tools ============================*/

function iLikeToWin() {
  cells.forEach(cell => {
    if (!cell.hasBomb) cell.isRevealed = true
  })
  checkForEndGame()
}

init()
