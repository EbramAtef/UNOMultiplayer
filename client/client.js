socket = io.connect(); // send a connection request to the server
socket.on("connect", function()
{
    console.log("connected to server");
});
function login()
{
    console.log("clicked");
    if(user.value && pass.value)
    {
        console.log("sent");
        socket.emit("login",{
            username:user.value,
            password:pass.value
        });
    }
}
socket.on("logged", function(data)
{
    access_token = data.access_token;
    console.log("logged");
    console.log(access_token);
    sessionStorage.access_token=access_token;
    game.state.start("Waiting");

});
socket.on("Started", function(data)
{
    console.log(data);
    cards = data.cards;
    middlecard = data.middleCard;
    players = data.players;
    GameId = data.id;
    game.state.start("Game");
});
socket.on("reconnected", function(data)
{
    console.log(data);
    cards = data.cards;
    middlecard = data.middleCard;
    players = data.players;
    GameId = data.id;
    game.state.start("Game");
});
socket.on("Play",function()
{
    CanPlay = true;
    console.log("playing");
    message("Your Turn!");
});
socket.on("CardPlayed",function(data){
    console.log(data);
    middlecard = data.card;
    middlecardchanged = true;
});
socket.on("DrawCards",function(data){
    console.log("DrawCards");
    newCards = data.cards;
    IsnewCards = true;
});
socket.on("CardDrawn",function(data){
    newCards = [data.card];
    console.log(newCards);
    IsnewCards = true;
    CanDraw = false;
});
socket.on("CanDraw",function(){
    CanDraw = true;
});
socket.on("GameEnded",function(data){
    message("PLayer "+data.WhoWon+" won the game with score "+data.score);
    alert("PLayer "+data.WhoWon+" won the game with score "+data.score);
});
socket.on("UNOBroadCast",function(data){
    var msg = new SpeechSynthesisUtterance(data.player+ " Says Uno");
    window.speechSynthesis.speak(msg);
});
function message(msg)
{
    $(".fullScreen h1").html(msg);
    $(".fullScreen").fadeIn();
    window.setTimeout(removeFullScreen, 500);
}
function removeFullScreen()
{
    $(".fullScreen").hide();
}