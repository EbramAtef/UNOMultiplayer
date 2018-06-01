
//this is just configuring a screen size to fit the game properly
//to the browser
const canvas_width = window.innerWidth; 
const canvas_height = window.innerHeight;
console.log( window.devicePixelRatio);
game = new Phaser.Game(canvas_width, canvas_height, Phaser.CANVAS, 'MainCont');
game.state.add('Boot', Gameobject.Boot);
game.state.add('MainMenu', Gameobject.MainMenu);
game.state.add('Waiting', Gameobject.Waiting);
game.state.add('Game', Gameobject.Game);
game.state.start('Boot');