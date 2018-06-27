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
function FB_Login(response)
{   
    console.log(response);
    if (response.status === 'connected') {
        FBLoginToServer();
    }
}
function FBLoginSequence()
{
    if(FB != undefined)
    {
        FB.login(function(response){
            console.log(response);
            if (response.status === 'connected') {
                FBLoginToServer();
            }
        });
    }
}
function FBLoginToServer()
{
    if(FB != undefined)
    {
        FB.api('me?fields=id,name', function(response) {
            var username = response.name;
            var id = response.id;
            FB.api(response.id+'/picture', {redirect: 0,heigth:256,width:256} ,function(response) {
                var img = response.data.url;
                socket.emit("FBlogin",{
                    access_token:FB.getAccessToken(),
                    username:username,
                    img_url:img,
                    user_id:id
                });
            });
        });
    }
}
socket = io.connect(); // send a connection request to the server
socket.on("connect", function()
{
    console.log("connected to server");
    if (localStorage.access_token !== undefined) {
        console.log("recconec");
        socket.emit("reconect",{
            access_token:localStorage.access_token
        });
    }
    else
    {
        FB.getLoginStatus(FB_Login);
    }
});
socket.on("logged", function(data)
{
    access_token = data.access_token;
    console.log("logged");
    console.log(access_token);
    localStorage.access_token=access_token;
    AfterLoadCompleteState = "Waiting";
    game.state.start("Boot");
});
socket.on("disconnect",function(){
    game.state.start("MainMenu");
    message("Dissconected From the Server");
})
socket.on("Started", function(data)
{
    console.log(data);
    cards = data.cards;
    middlecard = data.middleCard;
    players = data.players;
    GameId = data.id;
    order = data.order;
    game.state.start("Game");
});
socket.on("reconnected", function(data)
{
    console.log(data);
    cards = data.cards;
    middlecard = data.middleCard;
    players = data.players;
    GameId = data.id;
    order = data.order;
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
    playerWhoPlayed = data.player.username;
    ChangeTheNumberOfCards(data.player.username,-1);
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
socket.on("PlayerDrawedACard",function(data){
    console.log(data);
    PlayerDrawedACardAnimationData = data;
    PlayerDrawedACardAnimation = true;
    ChangeTheNumberOfCards(PlayerDrawedACardAnimationData.player,PlayerDrawedACardAnimationData.cardNum);
});
socket.on("GameEnded",function(data){
    message("PLayer "+data.WhoWon+" won the game with score "+data.score);
    game.state.start("Waiting");
});
socket.on("UNOBroadCast",function(data){
    var msg = new SpeechSynthesisUtterance(data.player+ " Says Uno");
    window.speechSynthesis.speak(msg);
});
socket.on("ServerEndedGame",function()
{
    message("server ended the game");
    game.state.start("Waiting");
});
function message(msg)
{
    $(".fullScreen h1").html(msg);
    $(".fullScreen").fadeIn();
    window.setTimeout(removeFullScreen, 1000);
}
function removeFullScreen()
{
    $(".fullScreen").hide();
}