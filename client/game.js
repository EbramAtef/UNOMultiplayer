var cardss = [];
var pl;
var deck 
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
    },
    create:function()
    {
        var background = game.add.sprite(0, 0, 'background');
        background.x = 0;
        background.y = 0;
        background.height = game.height;
        background.width = game.width;
        var width = canvas_width/25;
        var ratio = 240/360;
        var height = width/ratio;
        var winc = width*7/cards.length;
        var w = game.world.centerX -((winc*cards.length)/2);
        var y =  game.height - height;
        cards.forEach(function(car){
            var card = game.add.sprite(0, 0, 'cards', car.filename);
            card.events.onInputDown.add(cardClicked, this, game);
            card.data = car;
            cardss.push(card);
        });
        arrangeCards();

        var midcard = game.add.sprite(game.world.centerX,game.world.centerY,'cards',middlecard.filename);
        midcard.width/=1.4;
        midcard.height/=1.4;
        midcard.x -= midcard.width + 10;
        midcard.y -= midcard.height/2;

        deck = game.add.sprite(game.world.centerX,game.world.centerY,'back');
        deck.width = midcard.width;
        deck.height = midcard.height;
        deck.y -= deck.height/2;
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
        pl = game.add.group();

        switch (players.length) {
            case 1:
                var x = game.world.centerX;
                var y = 0
                var img0 = game.add.sprite(x,y,'avatar');
                img0.width/=1.4;
                img0.height/=1.4;
                img0.x -= img0.width/2;
                y += img0.height+20;
                var text0 = game.add.text(x, y, players[0], style);
                text0.x -= text0.width/2;
                break;
            case 2:
                var x = 0;
                var y = 0;
                var img = game.add.sprite(x,y,'avatar');
                y += img.height+20;
                var style = { font: "32px Arial", fill: "#fff", align: "center" };
                var text = game.add.text(x+(img.width/2), y, players[0], style);
                text.x -= text.width/   2;
                x = game.width - 256;
                y = 0;
                var img2 = game.add.sprite(x,y,'avatar');
                y += img2.height+20;
                var style2 = { font: "32px Arial", fill: "#fff", align: "center" };
                var text2 = game.add.text(x+img2.width/2, y, players[1], style);
                text2.x -= text2.width/2;
                break;
            case 3:
                var x = game.world.centerX;
                var y = 0
                var img0 = game.add.sprite(x,y,'avatar');
                img0.width/=1.4;
                img0.height/=1.4;
                img0.x -= img0.width/2;
                y += img0.height+20;
                var text0 = game.add.text(x, y, players[0], style);
                text0.x -= text0.width/2;
                x = 0;
                y = 20;
                var img = game.add.sprite(x,y,'avatar');
                y += img.height+20;
                var style = { font: "32px Arial", fill: "#fff", align: "center" };
                var text = game.add.text(x+(img.width/2), y, players[1], style);
                text.x -= text.width/   2;
                x = game.width - 256;
                y = 20;
                var img2 = game.add.sprite(x,y,'avatar');
                y += img2.height+20;
                var style2 = { font: "32px Arial", fill: "#fff", align: "center" };
                var text2 = game.add.text(x+img2.width/2, y, players[2], style);
                text2.x -= text2.width/2;

                break;
            default:
                break;
        }
        console.log(pl);
    },
    update:function()
    { 
        if(CanDraw)
        {
            deck.inputEnabled = true;
        }
        else
        {
            deck.inputEnabled = false;
        }
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
                car.alpha = 1;
            });
        if(middlecardchanged)
        {
            var midcard = game.add.sprite(game.world.centerX,game.world.centerY,'cards',middlecard.filename);
            midcard.width/=1.4;
            midcard.height/=1.4;
            midcard.x -= midcard.width + 10;
            midcard.y -= midcard.height/2;
            middlecardchanged =false;
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
        }
        if(IsnewCards)
        {
            newCards.forEach(function(car){
                var card = game.add.sprite(0, 0, 'cards', car.filename);
                card.events.onInputDown.add(cardClicked, this,game);
                card.data = car;
                cardss.push(card);
            });
            arrangeCards();
            IsnewCards = false;
        }
    }
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
function cardClicked(e,game)
{
    console.log(e.data.filename);
    e.y -= 20;
    if(e.data.type == 0)
    {
        /*var json = JSON.stringify({
            card : e.data,
            id : GameId,
            access_token : access_token
        });
        var json = json.replace(/"/g, '\\"');*/
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
                access_token : access_token
            });
            var i;
            for(i = 0;i<cardss.length;i++)
            {
                if(e.data.filename == cardss[i].data.filename)
                    break;
            }
            console.log(i);
            cardss[i].destroy();
            cardss.splice(i,1);
            CanPlay = false;
        });
    }
    else
    {
        socket.emit("played",{
            card : e.data,
            id : GameId,
            access_token : access_token
        });
        var i;
        for(i = 0;i<cardss.length;i++)
        {
            if(e.data.filename == cardss[i].data.filename)
                break;
        }
        console.log(i);
        cardss[i].destroy();
        cardss.splice(i,1);
        CanPlay = false;
    }
    CanDraw = false;
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
    var width = canvas_width/25;
    var ratio = 240/360;
    var height = width/ratio;
    var winc = width*7/cards.length;
    var w = game.world.centerX -((winc*cardss.length)/2);
    var y =  game.height - height;
    cardss.forEach(function(card){
        card.x = w;
        card.y = y;
        card.width = width;
        card.height = height;
        if(cards.length > 7)
        {
            w+=winc;
        }
        else
        {
            w+= card.width;
        }
    });
};
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