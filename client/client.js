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
    $(".fullScreen").fadeIn();
    window.setTimeout(removeFullScreen, 500);
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
function removeFullScreen()
{
    $(".fullScreen").hide();
}