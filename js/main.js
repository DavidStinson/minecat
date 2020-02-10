/*-----------------------------------------------------------------------------
/*-------------------------------- Variables --------------------------------*/
-----------------------------------------------------------------------------*/
let rows = null;
let collumns = null;
let time = null;
let bombs = null;
let winLoss = 0;
let flags = null;


/*-----------------------------------------------------------------------------
/*--------------------------------- Objects ---------------------------------*/
-----------------------------------------------------------------------------*/
// Object constructor for cells
/*  xcor use for logic and css
    ycor use for logic and css
    bomb
    valu
    flag
    revealed */



/*-----------------------------------------------------------------------------
/*---------------------------------- Cache ----------------------------------*/
-----------------------------------------------------------------------------*/
// cache all styled elements


/*-----------------------------------------------------------------------------
/*============================= Event Listeners =============================*/
-----------------------------------------------------------------------------*/
// listen for click on any cell to trigger handleCellClick
// listen for right click on any cell to trigger handleCellAltClick
// listen for click on emoji man to trigger checkForWin


/*-----------------------------------------------------------------------------
/*================================ Functions ==================================
-----------------------------------------------------------------------------*/

// init
/*  set everything to default
    *EVENTUALLY* Querry the user for everything, or query them to choose a 
    *difficulty
    call cellBuilder
    call 
    call render */



// cellBuilder
/*  build rows and collumns 
    fill with bombs
        If there are edge conditions of places we can't place bombs, and don't
        place bombs there
    fill with numbers */

// handleCellClick
/*  call checkForLoss
    If player has clicked on a bomb, reveal all the bombsrender*/

// handleCellAltClick
/*  If player has any remaining flags, place a flag, if no remaining flags flash the flag counter

// checkForWin
/*  if player has alt clicked all correct bomb locations
    */

// checkForLoss
    /* if player clicked on a bomb they lost */

// render
//  *EVENTUALLY* if the game is starting, query the user for number of rows,
//  *columns, bombs, and time they want to have
/*  Render cells
    render framing
    render countdown
    render emoji button */ 