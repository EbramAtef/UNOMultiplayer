//require('dotenv').config();
var events = require('events');
var eventEmitter = new events.EventEmitter();
//import express.js 
var express = require('express');
//assign it to variable app 
var app = express();

//game class
const Game = require('./game.js');

//game cards
var fs = require('fs');
var cardsobject = JSON.parse(fs.readFileSync('./cards.json', 'utf8'));
var cards = cardsobject.frames;

app.set('view engine', 'ejs');
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
//create a server and pass in app as a request handler
var serv = require('http').Server(app); //Server-11

//import postgres
const { Client } = require('pg');
const db = new Client();

//connect to database
db.connect();

var players = [];
var games = [];

//send a index.html file when a get request is fired to the given 
//route, which is ‘/’ in this case
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

app.get('/dashboard',function(req,res)
{
    db.query("Select * from users", (err, result) => {
        if (err) {
        console.log(err.stack);
        } else {
            var users = [];
            result.rows.forEach(function(user){
                users.push(user);
            });
            res.render(__dirname + '/client/Dashboard/index',{
                users : users
            });
        }
    });
});
app.get('/dashboard/Organise',function(req,res)
{
    var users = [];
    players.forEach(function(user) {
        if(!user.playing)
        {
            var temp = user
            delete temp.db.pass;
            users.push(temp.db);
        }
    });
    res.render(__dirname + '/client/Dashboard/org',{
        users : users
    });
});
/*app.post('/Dashboard/StartGame',function(req,res)
{
    var game_players = [];
    req.body.players.forEach(player => {
        for(var i = 0;i<players.length;i++)
        {
            if(players[i].db.id == player.id)
            {
                game_players.push(players[i]);
                players[i].playing = true;
            }
        }
    });
    console.log(cards.length);
    var game = new Game(game_players,cards);
    game.start();
    games.push(game);
});*/
app.post('/Dashboard/StartGame',function(req,res)
{
    var game_players = [];
    var flag = false;
    req.body.players.forEach(player => {
        for(var i = 0;i<players.length;i++)
        {
            if(players[i].db.id == player.id)
            {
                game_players.push(players[i]);
                if(players[i].playing == true)
                {
                    console.log("TRYING TO START A GAME WITH PLAYERS ALRADY PLAYING");
                    flag = true;
                }
                players[i].playing = true;
            }
        }
    });
    if(game_players.length < 1 || flag)
        return;
    console.log(cards.length);
    var game = new Game(game_players,cards);
    game.start();
    games.push(game);
});
//this means when a get request is made to ‘/client’, put all the 
//static files inside the client folder 

app.use('/client',express.static(__dirname + '/client'));
app.use('/scripts/input',express.static(__dirname + '/node_modules/@orange-games/phaser-input/build/'));
function GameEnds(gameid)
{
    for(var i = 0;i<games.length;i++)
    {
        if(games[i].id === gameid)
        {
            games.splice(i,1);
            break;
        }
    }
}
function Player(socket)
{
    this.socket = socket;
};
Player.prototype.setname = function(name)
{
    this.name = name;
};
Player.prototype.setaccess = function(access_token) {
    this.access_token = access_token;
}
Player.prototype.setdb = function(db)
{
    this.db = db;
}


//listen on port 2000
serv.listen(process.env.PORT || 2000);
console.log("Server started.");

 // binds the serv object we created to socket.io
var io = require('socket.io')(serv,{});

// listen for a connection request from any client
io.sockets.on('connection', function(socket){
    var conn = new Player(socket);
    console.log("socket connected"); 
	//output a unique socket.id 
    console.log(socket.id);
    socket.on('login',function(data){
        console.log(data.username);
        text = 'Select * from users where username = $1';
        values = [data.username];
        db.query(text, values, (err, res) => {
            if (err) {
            console.log(err.stack)
            } else if(res.rows[0]){
                console.log(res.rows[0].pass);
                console.log(data.password);
                if(res.rows[0].pass === data.password)
                {
                    console.log("logged");
                    require('crypto').randomBytes(48, function(err, buffer) {
                        var token = buffer.toString('hex');
                        socket.emit("logged", {
                            access_token : token
                        });
                        conn.setaccess(token);
                        conn.setname(data.username);
                        conn.setdb(res.rows[0]);
                        players.push(conn);
                    });

                }else
                {
                    socket.emit("failed","Worng Credentials");
                }
            }
        });
    });
    socket.on("reconect",function(data)
    {
        for(var i = 0 ; i < players.length;i++)
        {
            if(players[i].access_token == data.access_token)
            {
                players[i].socket = socket;
            }
            socket.emit("logged", {
                access_token : data.access_token
            });
        }
        games.forEach(function(game) {
            game.players.forEach(function(player){
                if(player.access_token ==  data.access_token)
                {
                    player.socket = socket;
                    game.recconected(data.access_token);
                }
            });        
        });

    });
    socket.on("played",function(data){
        games.forEach(function(game){
            if(game.id == data.id)
            {
                game.Played(data.card,data.access_token,socket,data.UNOFlag);
            }
        })
    });
    socket.on("DrawACard",function(data){
        games.forEach(function(game){
            if(game.id == data.id)
            {
                game.DrawACard(data.access_token);
            }
        })
    });
    socket.on("Pass",function(data){
        games.forEach(function(game){
            if(game.id == data.id)
            {
                game.Pass(data.access_token);
            }
        })
    });
});