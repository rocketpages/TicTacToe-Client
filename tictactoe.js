// Constants - Status Updates
var STRATEGIZING_STATUS = "Your opponent is strategizing.";
var WAITING_STATUS = "Waiting for an opponent.";
var YOUR_TURN_STATUS = "It's your turn!";
var YOU_WIN_STATUS = "You win!";
var TIED_STATUS = "The game is tied.";
var WEBSOCKET_CLOSED_STATUS = "The WebSocket Connection Has Been Closed.";

// Constants - Game
var PLAYER_O = "O";
var PLAYER_X = "X";

// Variables
var player;
var opponent;
var gameId;
var yourTurn = false;

// WebSocket connection
var ws;

$(document).ready(function() {
	
	/* Bind to the click of all divs (tic tac toe cells) on the page
	   We would want to qualify this if we styled the game fancier! */
	$("div").click(function () {
		// Only process clicks if it's your turn.
		if (yourTurn == true) { 
	      // Stop processing clicks and invoke sendMessage(). 
		  yourTurn = false;
    	  sendMessage(this.id);
    	  // Add the X or O to the game board and update status.
	      $("#" + this.id).addClass(player);
	      $("#" + this.id).html(player);	    	  
	      $('#status').text(STRATEGIZING_STATUS);    	 					      
    	}
    });	

	// On the intial page load we perform the handshake with the server.
    ws = new WebSocket("ws://localhost:9000/websocket");
    
    ws.onopen = function(event) { 
    	$('#status').text(WAITING_STATUS); 
    }
    
    // Process turn message ("push") from the server.
	ws.onmessage = function(event) {
 		var message = jQuery.parseJSON(event.data);
 		
 		// Process the handshake response when the page is opened
 		if (message.type === 'handshake') {
   	 		gameId = message.gameId;
   	 		player = message.player;

   	 	 	if (player === "x") {
   	 	 		opponent = "o"; 
   	 	 	} else {
   	 	 		opponent = "x";   	 	 	
   	 	 	}
 		}
 		
 		// Process your opponent's turn data.
 		if (message.type === 'response') {
 			// Show their turn info on the game board.
 			$("#" + message.gridId).addClass(message.opponent);
 			$("#" + message.gridId).html(message.opponent);
 			
 			// Switch to your turn.
 			if (message.winner == true) {
 				$('#status').text(message.opponent + " is the winner!"); 
 			} else if (message.tied == true) {
 				$('#status').text(TIED_STATUS);   	   	 			
 			} else {
 				yourTurn = true;
    			$('#status').text(YOUR_TURN_STATUS);    	   	 			
    		}
 		}   	 	
 		
 		/* The initial turn indicator from the server. Determines who starts
 		   the game first. Both players wait until the server gives the OK
 		   to start a game. */
 		if (message.type === 'turn') {
 			if (message.turn === 'YOUR_TURN') {
 				yourTurn = true;
	    		$('#status').text(YOUR_TURN_STATUS);    	 			
    			} else if (message.turn === 'WAITING') {
				$('#status').text(STRATEGIZING_STATUS);    	 					    	
    		}
 		}
 		
 		/* The server has determined you are the winner and sent you this message. */
 		if (message.type === 'game_over') {
	 		if (message.result === 'YOU_WIN') {
				$('#status').text(YOU_WIN_STATUS);
			} 
			else if (message.result === 'TIED') {
				$('#status').text(TIED_STATUS);
			}
 		}	
 	} 
 	
 	ws.onclose = function(event) { 
 		$('#status').text(WEBSOCKET_CLOSED_STATUS); 
 	} 
 		
 	//capture the return key
	$("form").bind("keydown", function(e) {
		if (e.keyCode == 13) {
			sendMessage();
			//prevent default form submission behaviour
			return false; 
		}
	});
		
});

// Send your turn information to the server.
function sendMessage(id) {
	var message = {gameId: gameId, player: player, gridId:id};
	var encoded = $.toJSON(message);
	ws.send(encoded);
}