import * as Chess from 'chess.js'
import {BehaviorSubject} from 'rxjs'
import PromotionChoice from './PromotionChoice'


let promotion = 'rnb2bnr/pppPkppp/8/4p3/7q/8/PPPP1PPP/RNBQKBNR w KQ - 1 5'
let staleMate = '4k3/4P3/4K3/8/8/8/8/8 b - - 0 78'
const chess = new Chess(staleMate);

export const gameSubject = new BehaviorSubject({
    board: chess.board
})

export function initGame() {
    updateGame()
}

export function resetGame() {
    chess.reset()
    updateGame()
}

export function handleMove(from, to) {
    // Array of all possible promotions from the current position
    const promotions = chess.moves({verbose: true}).filter(m => m.promotion)
    console.table(promotions)
    // Some method is if one item in array satisfies condition
    if(promotions.some(p => `${p.from}:${p.to}` === `${from}:${to}`)) {
        const pendingPromotion = {from, to, color: promotions[0].color}
        updateGame(pendingPromotion) 
    }

    const {pendingPromotion} = gameSubject.getValue()

    if(!pendingPromotion) {
        move(from, to)
    }
}

var ws = new WebSocket("ws://localhost:8088/UGH/ws");
// change this path if ur on another machine, DO NOT FORGET OR ELSE IT WONT WORK (working=poop)
export function move(from, to, promotion) {
    let tempMove = {from, to}
    if(promotion) {
        tempMove.promotion = promotion
    }
    const legalMove = chess.move(tempMove)
    if(legalMove) {
        updateGame();
    }
    // Now block here for opponents move to come back
    ws.onopen = function(event) {
        // todo: add something here possibly?
		//document.getElementById("mychat").innerHTML += "Connected!<br />";
    }
    ws.onmessage = function(event) {
       // document.getElementById("mychat").innerHTML += event.data + "<br />";
    }
    ws.onclose = function(event) {
       // document.getElementById("mychat").innerHTML += "Disconnected!<br />";
    }
    ws.onerror = function(event) {
        alert('check');
    }

    // had to include these two functions because having a Connecting error... it's hella annoying
    // https://stackoverflow.com/questions/23051416/uncaught-invalidstateerror-failed-to-execute-send-on-websocket-still-in-co


    var send = function (message, callback) {
        waitForConnection(function () {
            ws.send(message);
            if (typeof callback !== 'undefined') {
              callback();
            }
        }, 1000);
    };
    
    var waitForConnection = function (callback, interval) {
        if (ws.readyState === 1) {
            callback();
        } else {
            // optional: implement backoff for interval here
            setTimeout(function () {
                waitForConnection(callback, interval);
            }, interval);
        }
    };
    // getting an error when i send this to websocket, why? 
    ws.addEventListener('error', function (event) {
        alert('WebSocket error: ', event);
      });
    
    ws.send("please help me i am suffering greatly")
    //send("check", function(){});
 //   send(`{"from":"${from}","to":"${to}","promotion":${promotion}}`, function(){});
}

function updateGame(pendingPromotion) {
    const isGameOver = chess.game_over()
    
    const newGame =  {
        board: chess.board(),
        pendingPromotion,
        isGameOver,
        turn: chess.turn(),
        result: isGameOver ? getGameResult() : null
    }

    gameSubject.next(newGame)
}

function getGameResult() {
    if(chess.in_checkmate()) {
        const winner = (chess.turn() === "w") ? 'BLACK' : 'WHITE'
        return `CHECKMATE - WINNER - ${winner}`
    }
    else if (chess.in_draw()) {
        let reason = '50 - MOVES - RULE'
        if(chess.in_stalemate()) {
            reason = 'STALEMATE'
        }
        else if(chess.in_threefold_repitition()){
            reason = 'REPITITION'
        }
        else if(chess.insufficient_material()){
            reason = 'INSUFFICIENT MATERIAL'
        }
        return `DRAW - ${reason}`
    }
    else{
        return 'UNKNOWN REASON'
    }
}