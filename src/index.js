import Game from './game.js';

const canvas = document.getElementById('game-surface');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const game = new Game(canvas); 
game.start()