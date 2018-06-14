var cardss = [];
var pl = [];
var deck;
var UNOFlag = false;
var LastCardCount = 0;
var midcard;
Gameobject.Boot = function(game){};
Gameobject.Boot.prototype = {
    preload:function()
    {
        game.load.image('background', 'client/img/background.jpg');
        game.load.image('logo', 'client/img/logo.png');
        game.load.image('Login', 'client/img/button.png');
        this.game.plugins.add(PhaserInput.Plugin);
    },
    create:function()
    {
        console.log("booting");
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        if (sessionStorage.access_token !== undefined) {
            console.log("recconec");
            socket.emit("reconect",{
                access_token:sessionStorage.access_token
            });
        }
        game.state.start("MainMenu");
    },
    update:function()
    {
        
    }
}


Gameobject.MainMenu = function(game){};
Gameobject.MainMenu.prototype = {
    preload:function()
    {

    },
    create:function()
    {
        console.log("MainMenu");
        var background = game.add.sprite(0, 0, 'background');
        background.x = 0;
        background.y = 0;
        background.height = game.height;
        background.width = game.width;
        var h = 0;
        var logo = game.add.sprite(0, h, 'logo');
        logo.width = game.width/4;
        logo.height = game.height/4;
        logo.x = (game.width/2) - (logo.width/2);
        h+=logo.height+20;
        var style = { font: "32px Arial", fill: "#fff", align: "center" };
        var text = game.add.text(game.world.centerX, h, "Login", style);
        text.x = (game.width/2) - (text.width/2);
        h+=text.height+20;
        user = game.add.inputField(game.world.centerX, h, {
            font: '18px Arial',
            fill: '#212121',
            fontWeight: 'bold',
            width: 150,
            padding: 8,
            borderWidth: 1,
            borderColor: '#000',
            borderRadius: 6,
            placeHolder: 'Username',
            //type: PhaserInput.InputType.password
        });
        user.x = (game.width/2) - (user.width/2);
        h+=user.height+20;
        pass = game.add.inputField(game.world.centerX, h, {
            font: '18px Arial',
            fill: '#212121',
            fontWeight: 'bold',
            width: 150,
            padding: 8,
            borderWidth: 1,
            borderColor: '#000',
            borderRadius: 6,
            placeHolder: 'Password',
            type: PhaserInput.InputType.password
        });
        pass.x = (game.width/2) - (pass.width/2);
        h+=pass.height+20;
        button = game.add.button(game.world.centerX - 97, h, 'Login', actionOnClick, this, 2, 1, 0);
        button.width  = 194;
        button.height = 50;
    },
    update:function()
    {

    }
}

Gameobject.Waiting = function(game){};
Gameobject.Waiting.prototype = {
    preload:function()
    {

    },
    create:function()
    {
        console.log("Waiting");
        var background = game.add.sprite(0, 0, 'background');
        background.x = 0;
        background.y = 0;
        background.height = game.height;
        background.width = game.width;
    },
    update:function()
    {

    }
}

Gameobject.Game = function(game){};
Gameobject.Game.prototype = {
    preload:function()
    {
        game.load.atlas('cards', 'client/img/cards.png', 'client/img/cards.json');
        game.load.image('back', 'client/img/back.png');
        game.load.image('avatar', 'client/img/user.png');
        game.load.image('unobutton', 'client/img/uno_button.png');
        game.load.image('unobuttonPressed', 'client/img/uno_buttonPressed.png');        
        game.load.image('passbutton', 'client/img/pass_button.png');
        game.load.image('passbuttonPressed', 'client/img/pass_buttonPressed.png');
    },
    create:function()
    {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        game.time.advancedTiming = true;
        var background = game.add.sprite(0, 0, 'background');
        background.x = 0;
        background.y = 0;
        background.height = game.height;
        background.width = game.width;
        cardss = [];
        cards.forEach(function(car){
            var card = game.add.sprite(0, 0, 'cards', car.filename);
            card.events.onInputDown.add(cardClicked, this);
            card.data = car;
            cardss.push(card);
        });
        midcard = game.add.sprite(game.world.centerX,game.world.centerY,'cards',middlecard.filename);
        midcard.width = canvas_width/10;
        var ratio = 240/360;
        midcard.height = midcard.width/ratio;
        midcard.x -= midcard.width + 10;
        midcard.y -= midcard.height/2 - 20;

        deck = game.add.sprite(game.world.centerX,game.world.centerY,'back');
        deck.width = midcard.width;
        deck.height = midcard.height;
        deck.y -= deck.height/2 - 20;
        deck.x +=10
        deck.events.onInputDown.add(DrawACard, this);
        //deck.inputEnabled = true;
        if(middlecard.type == 0)
        {
            switch (middlecard.color) {
                case 0:
                    midcard.tint = 0xff0000;
                    break;                    
                case 1:
                    midcard.tint = 0xffff00;
                    break;                    
                case 2:
                    midcard.tint = 0x00ff00;
                    break;                    
                case 3:
                    midcard.tint = 0x0000ff;
                    break;
                default:
                    break;
            }
        }
        switch (players.length) {
            case 1:
                pl[0] = {};
                pl[0].username = players[0].username;
                var x = game.world.centerX;
                var y = 0
                var img0 = game.add.sprite(x,y,'avatar');
                img0.width=canvas_width/8;
                img0.height=canvas_width/8;
                img0.x -= img0.width/2;
                y += img0.height;
                pl[0].x = img0.x+img0.width/2;
                pl[0].y = img0.y+img0.height/2;
                var style = { font: "5vh Arial", fill: "#fff", align: "center" };
                var text0 = game.add.text(x, y, players[0].username, style);
                text0.x -= text0.width/2;
                var text1 = game.add.text(x, y, players[0].cards, style);
                text1.x -= text1.width/2 - (text0.width/2 + 10);
                pl[0].cardsnumsprite = text1;
                pl[0].cardsnum = players[0].cards;
                break;
            case 2:
                var ord = order+1; /////// really i need to think of better names for the vars 
                if(ord === players.length+1)
                {
                    ord = 0;
                } 
                var player = players.filter(function( obj ) {
                    return obj.order ==ord;
                })[0];
                pl[1] = {};
                pl[1].username = player.username;
                x = game.width - 256;
                y = 0;
                var img2 = game.add.sprite(x,y,'avatar');
                img2.width=canvas_width/8;
                img2.height=canvas_width/8;
                y += img2.height+10;
                pl[1].x = img2.x+img2.width/2;
                pl[1].y = img2.y+img2.height/2;
                var style2 = { font: "5vh Arial", fill: "#fff", align: "center" };
                var text2 = game.add.text(x+img2.width/2, y, player.username, style2);
                text2.x -= text2.width/2;
                var text3 = game.add.text(x+img2.width/2, y, player.cards, style2);
                text3.x -= text3.width/2 - (text2.width/2 + 10);
                pl[1].cardsnumsprite = text3;
                pl[1].cardsnum = player.cards;
                ////////////////////////////////
                ord++;
                if(ord === players.length+1)
                {
                    ord = 0;
                } 
                var player = players.filter(function( obj ) {
                    return obj.order ==ord;
                })[0]; 
                pl[0] = {};
                pl[0].username = player.username;
                var x = 0;
                var y = 0;
                var img = game.add.sprite(x,y,'avatar');
                img.width=canvas_width/8;
                img.height=canvas_width/8;
                y += img.height+10;
                pl[0].x = img.x+img.width/2;
                pl[0].y = img.y+img.height/2;
                var style = { font: "5vh Arial", fill: "#fff", align: "center" };
                var text = game.add.text(x+(img.width/2), y, player.username, style);
                text.x -= text.width/2;
                var text1 = game.add.text(x+(img.width/2), y, player.cards, style);
                text1.x -= text1.width/2 - (text.width/2 + 10);
                pl[0].cardsnumsprite = text1;
                pl[0].cardsnum = player.cards; 
                break;
            case 3:
                var ord = order+1; /////// really i need to think of better names for the vars 
                if(ord === players.length+1)
                {
                    ord = 0;
                } 
                var player = players.filter(function( obj ) {
                    return obj.order ==ord;
                })[0];
                pl[0] = {};
                pl[0].username = player.username;
                var x = game.width - 256;
                var y = 20;
                var img2 = game.add.sprite(x,y,'avatar');
                img2.width=canvas_width/8;
                img2.height=canvas_width/8;
                y += img2.height+20;
                pl[0].x = img2.x+img2.width/2;
                pl[0].y = img2.y+img2.height/2;
                var style = { font: "4vh Arial", fill: "#fff", align: "center" };
                var text2 = game.add.text(x+img2.width/2, y, player.username, style);
                text2.x -= text2.width/2;
                var text1 = game.add.text(x+img2.width/2, y, player.cards, style);
                text1.x -= text1.width/2 - (text2.width/2 + 10);
                pl[0].cardsnumsprite = text1;
                pl[0].cardsnum = player.cards;
                /////////////////////////////////
                ord++;
                if(ord === players.length+1)
                {
                    ord = 0;
                } 
                var player = players.filter(function( obj ) {
                    return obj.order ==ord;
                })[0];
                pl[1] = {};
                pl[1].username = player.username;
                x = game.world.centerX;
                y = 0
                var img0 = game.add.sprite(x,y,'avatar');
                img0.width=canvas_width/8;
                img0.height=canvas_width/8;
                img0.x -= img0.width/2;
                y += img0.height+20;
                pl[1].x = img0.x+img0.width/2;
                pl[1].y = img0.y+img0.height/2;
                var text0 = game.add.text(x, y, player.username, style);
                text0.x -= text0.width/2;
                var text3 = game.add.text(x, y, player.cards, style);
                text3.x -= text3.width/2 - (text0.width/2 + 10);
                pl[1].cardsnumsprite = text3;
                pl[1].cardsnum = player.cards;
                ///////////////////////////////////////////////////////////
                ord++;
                if(ord === players.length+1)
                {
                    ord = 0;
                } 
                var player = players.filter(function( obj ) {
                    return obj.order ==ord;
                })[0];
                pl[2] = {};
                pl[2].username = player.username;
                x = 0;
                y = 20;
                var img = game.add.sprite(x,y,'avatar');
                img.width=canvas_width/8;
                img.height=canvas_width/8;
                y += img.height+20;
                pl[2].x = img.x+img.width/2;
                pl[2].y = img.y+img.height/2;
                var text = game.add.text(x, y, player.username, style);
                //text.x -= text.width/2;
                var text4 = game.add.text(x, y, player.cards, style);
                text4.x+= (text.width + 10);
                pl[2].cardsnumsprite = text4;
                pl[2].cardsnum = player.cards;
                break;
            default:
                break;
        }
        //UNO Button
        this.UNO = game.add.sprite(game.width,game.height,"unobutton");
        this.UNO.width = canvas_width /10;
        this.UNO.height = canvas_width /10;
        this.UNO.x -= this.UNO.width + 50 ;
        this.UNO.y -= this.UNO.height +50 ;
        this.UNO.events.onInputDown.add(SetUnoFlag, this);
        this.UNO.inputEnabled = true;
        //Pass Button
        this.Pass = game.add.sprite(0,game.height,"passbutton");
        this.Pass.x += 50 ;
        this.Pass.y = this.UNO.y;
        this.Pass.width = this.UNO.width;
        this.Pass.height = this.UNO.height;
        this.Pass.events.onInputDown.add(Passfunc, this);
        this.Pass.inputEnabled = true;
    },
    update:function()
    { 
        arrangeCards();
        deck.inputEnabled = CanDraw;
        if(CanPlay)
            cardss.forEach(function(car){
                if(CardCanBePlayed(car.data))
                {
                    car.inputEnabled = true;
                }
            });
        else
            cardss.forEach(function(car){
                car.inputEnabled = false;
            });
        if(IsnewCards)
        {
            var i = 0;
            newCards.forEach(function(car){
                var card = game.add.sprite(deck.x, deck.y, 'cards', car.filename);
                card.height = deck.height;
                card.width= deck.width;
                card.events.onInputDown.add(cardClicked, this);
                card.data = car;
                var tween=game.add.tween(card);
                tween.to({ x: game.world.centerX, y:game.height, width:0, height:0 }, 1000,"Sine.easeInOut",false,i*500);
                tween.interpolation(Phaser.Math.linearInterpolation);
                tween.onComplete.add(DrawnACardTwennCallback,this,tween);
                tween.start();
                i++;
            });
            IsnewCards = false;
        }
        if(!UNOFlag)
        {
            this.UNO.loadTexture("unobutton");
        }
        else
        {
            this.UNO.loadTexture("unobuttonPressed");
        }
        if(middlecardchanged)
        {
            middlecardchanged = false;
            var player = pl.filter(function( obj ) {
                return obj.username == playerWhoPlayed;
            })[0];
            console.log(pl);
            var card = game.add.sprite(player.x,player.y,'cards',middlecard.filename);
            card.width = 0;
            card.height = 0;
            game.world.bringToTop(card);
            var tween=game.add.tween(card);
            tween.to({ x: midcard.x, y:midcard.y, width:midcard.width, height:midcard.height }, 1000,"Sine.easeInOut");
            tween.interpolation(Phaser.Math.linearInterpolation);
            tween.onComplete.add(PlayerPlayedMiddleCardTwennCallback,this,tween);
            tween.start();
        }
        if(PlayerDrawedACardAnimation)
        {
            PlayerDrawedACardAnimation = false;
            var player = pl.filter(function( obj ) {
                return obj.username == PlayerDrawedACardAnimationData.player;
            })[0];
            for(var i = 0;i<PlayerDrawedACardAnimationData.cardNum;i++)
            {
                var card = game.add.sprite(deck.x,deck.y,'back');
                card.height = deck.height;
                card.width = deck.width;
                var tween=game.add.tween(card);
                tween.to({ x: player.x, y:player.y, width:0, height:0 }, 1000,"Sine.easeInOut",false,i*500);
                tween.interpolation(Phaser.Math.linearInterpolation);
                tween.onComplete.add(PlayerDrawnACardTwennCallback,this,tween);
                tween.start();
            }
        }
    },
    render : function()
    {
        game.debug.text(game.time.fps, 2, 14, "#00ff00");
    }
}
function DrawnACardTwennCallback(card,tween)
{
    cardss.push(card);
}
function PlayerDrawnACardTwennCallback(card,tween)
{
    card.destroy();
}
function PlayerPlayedMiddleCardTwennCallback(card,tween)
{
    console.log(card)
    midcard.loadTexture('cards',middlecard.filename);
    console.log(middlecard);
    if(middlecard.type == 0)
    {
        switch (middlecard.color) {
            case 0:
                midcard.tint = 0xff0000;
                break;                    
            case 1:
                midcard.tint = 0xffff00;
                break;                    
            case 2:
                midcard.tint = 0x00ff00;
                break;                    
            case 3:
                midcard.tint = 0x0000ff;
                break;
            default:
                break;
        }
    }
    card.destroy();
}
function SetUnoFlag(e)
{
    if(!UNOFlag)
    {
        e.loadTexture("unobuttonPressed");
        UNOFlag = true;
    }
}
function Passfunc(e)
{
    console.log("pass");
    socket.emit("Pass",{
        id : GameId,
        access_token : access_token,
    });
    CanPlay = false;
}
function actionOnClick () {
    login();
}
function DrawACard(e)
{
    console.log("click");
    socket.emit("DrawACard",{
        id : GameId,
        access_token : access_token
    });
}
function cardClicked(e)
{
    console.log(e.data);
    
    if(e.data.type == 0)
    {
        var html = '<div class="message"><br><button style="background:#ff0000" class="button" id="0"></button><button style="background:#ffff00" class="button" id="1"></button><button style="background:#00ff00" class="button" id="2"></button><button style="background:#0000ff" class="button" id="3"></button></div>';
        console.log(html);
        $.fancybox.open(html);
        $(".button").on("click",function(el){
            //e.defaultPrevented();
            console.log(el);
            $.fancybox.close();
            e.data.color = parseInt($(this).attr("id"));
            socket.emit("played",{
                card : e.data,
                id : GameId,
                access_token : access_token,
                UNOFlag : UNOFlag
            });
            var i;
            for(i = 0;i<cardss.length;i++)
            {
                if(e.data.filename == cardss[i].data.filename)
                    break;
            }
            game.world.bringToTop(cardss[i]);
            var tween=game.add.tween(cardss[i]);
            tween.to({ x: midcard.x, y:midcard.y, width:midcard.width, height:midcard.height }, 1000,"Sine.easeInOut");
            tween.interpolation(Phaser.Math.linearInterpolation);
            tween.onComplete.add(ChangeMiddleCard,this,tween,i);
            tween.start();
            CanPlay = false;
            UNOFlag = false;
            CanDraw = false;
        });
    }
    else
    {
        socket.emit("played",{
            card : e.data,
            id : GameId,
            access_token : access_token,
            UNOFlag : UNOFlag
        });
        var i;
        for(i = 0;i<cardss.length;i++)
        {
            if(e.data.filename == cardss[i].data.filename)
                break;
        }
        game.world.bringToTop(cardss[i]);
        var tween=game.add.tween(cardss[i]);
        tween.to({ x: midcard.x, y:midcard.y, width:midcard.width, height:midcard.height }, 1000,"Sine.easeInOut");
        tween.interpolation(Phaser.Math.linearInterpolation);
        tween.onComplete.add(ChangeMiddleCard,this,tween,i);
        tween.start();
        CanPlay = false;
        UNOFlag = false;
        CanDraw = false;
    }
}
function ChangeMiddleCard(card,tween,i)
{
    console.log(i);
    console.log(cardss[i].data.filename);
    midcard.loadTexture('cards',cardss[i].data.filename);
    console.log(middlecard);
    if(middlecard.type == 0)
    {
        switch (middlecard.color) {
            case 0:
                midcard.tint = 0xff0000;
                break;                    
            case 1:
                midcard.tint = 0xffff00;
                break;                    
            case 2:
                midcard.tint = 0x00ff00;
                break;                    
            case 3:
                midcard.tint = 0x0000ff;
                break;
            default:
                break;
        }
    }
    cardss[i].destroy();
    cardss.splice(i,1);
}
function CardCanBePlayed(playerCard)
{
    if(playerCard.type === 0)
        return true;
    else
    {
        if(playerCard.color === middlecard.color)
            return true;
        else if(playerCard.value === middlecard.value && playerCard.type === middlecard.type)
            return true;
    }
    return false;
}
function ColorChosen(val,json)
{
    var obj = JSON.parse(json);
    $.fancybox.close();
    console.log(val);
    obj.card.color = val;
    socket.emit("played",obj);
    var i;
    for(i = 0;i<cardss.length;i++)
    {
        if(obj.card.filename == cardss[i].data.filename)
            break;
    }
    console.log(i);
    cardss[i].destroy();
    cardss.splice(i,1);
    CanPlay = false;
}
function arrangeCards()
{
    if(LastCardCount == cardss.length)
        return;
    var width = canvas_width/15;
    var ratio = 240/360;
    var height = width/ratio;
    var winc = width*7/cardss.length;
    var w = game.world.centerX -((winc*cardss.length)/2);
    var y =  game.height - height;
    cardss.forEach(function(card){
        card.x = w;
        card.y = y;
        card.width = width;
        card.height = height;
        if(cardss.length > 7)
        {
            w+=winc;
        }
        else
        {
            w+= card.width;
        }
    });
    console.log("updated");
    LastCardCount = cardss.length;
};
function copy(o) {
    var output, v, key;
    output = Array.isArray(o) ? [] : {};
    for (key in o) {
        v = o[key];
        output[key] = (typeof v === "object" && v !== null) ? copy(v) : v;
    }
    return output;
}  
function ChangeTheNumberOfCards(username,n)
{
    pl.forEach(function(player){
        if(player.username == username)
        {
            player.cardsnum += n;
            player.cardsnumsprite.setText(player.cardsnum);
        }
    });
}

/**
     * 
     * Cards Values Dic
     * Types:
     * 0:Wild
     * 1:Action
     * 2:Normal
     * 
     * Values:
     * 0 => 0 : ColorChange
     *      1 : DrawFour
     * 1 => 0 : skip
     *      1 : reverse
     *      2 : +2
     * 2 => 0 :: 9
     * 
     * group:
     * 0 => undefined
     * 1 => 0 : A
     *      1 : B
     * 2 => if(value == 0) : null
     *      else
     *          0 : A
     *          1 : B
     * 
     * color:
     * 0 => 4:black
     * 1,2 => 0 : Red
     *        1 : yellow
     *        2 : green
     *        3 : blue
     */