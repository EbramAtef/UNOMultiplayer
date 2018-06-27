function is_action_card(filename)
{
    if(filename.charAt(0) == 'W')
        return true;
    var action_cards = ["skip.png","reverse.png","+2.png"];
    var args = filename.split("_");
    if(action_cards.indexOf(args[1]) != -1)
        return true;
    return false;
}
function copy(o) {
    var output, v, key;
    output = Array.isArray(o) ? [] : {};
    for (key in o) {
        v = o[key];
        output[key] = (typeof v === "object" && v !== null) ? copy(v) : v;
    }
    return output;
}  
module.exports = class Game {
    constructor(players,cards,eventEmitter){
        this.players = players;
        this.cards = copy(cards);
        this.cards.forEach(function(card){
            if(card.filename.charAt(0) == 'W')
            {
                card.type = 0;
                card.color = 4;
                if(card.filename.includes('+'))
                    card.value = 1;
                else
                    card.value = 0;
            }
            else if(is_action_card(card.filename))
            {
                card.type = 1;
                if(card.filename.search("skip") != -1)
                {
                    card.value = 0;
                }
                if(card.filename.search("reverse") != -1)
                {
                    card.value = 1;
                }
                if(card.filename.includes("+2"))
                {
                    card.value = 2;
                }
                var args = card.filename.split("_");
                if(args[0].charAt(args[0].length-1) === 'A')
                {
                    card.group = 0;
                    args[0] = args[0].slice(0, -1);
                }
                else if(args[0].charAt(args[0].length-1) === 'B')
                {
                    card.group = 1;
                    args[0] = args[0].slice(0, -1);
                }
                switch (args[0]) {
                    case "Red":
                        card.color = 0;
                        break;
                    case "Yellow":
                        card.color = 1;
                        break;                    
                    case "Green":
                        card.color = 2;
                        break;                    
                    case "Blue":
                        card.color = 3;
                        break;
                    default:
                        break;
                }
            }
            else
            {
                card.type = 2;
                var args = card.filename.split("_");
                card.value = parseInt(args[1].charAt(0));
                if(args[0].charAt(args[0].length-1) === 'A')
                {
                    card.group = 0;
                    args[0] = args[0].slice(0, -1);
                }
                else if(args[0].charAt(args[0].length-1) === 'B')
                {
                    card.group = 1;
                    args[0] = args[0].slice(0, -1);
                }
                switch (args[0]) {
                    case "Red":
                        card.color = 0;
                        break;
                    case "Yellow":
                        card.color = 1;
                        break;                    
                    case "Green":
                        card.color = 2;
                        break;                    
                    case "Blue":
                        card.color = 3;
                        break;
                    default:
                        break;
                }
            }
        });
        this.id = Math.floor(new Date() / 1000);
        this.discardDeck = [];
        console.log("Game Object has been created ID="+this.id);
        this.eventEmitter = eventEmitter;
    }
    middleCard()
    {
        return this.discardDeck[0];
    }
    shuffle(array)
    {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
    }
    start()
    {
        console.log("Game Started!! ID="+this.id);
        var players_minfied = [];
        this.cards = this.shuffle(this.cards);
        console.log(this.cards.length);
        var index = 0;
        this.players.forEach(player => {
            var pl_cards = []
            for(var i = 0;i<7;i++)
            {
                pl_cards.push(this.cards[0]);
                this.cards.shift();
            }
            player.cards = pl_cards;
            player.order = index;
            console.log(player.order+ ":" + player.db.username )
            var temp = {
                username : player.db.username,
                cards : player.cards.length,
                order : player.order,
                img : player.imgUrl
            };
            index++;
            players_minfied.push(temp);
        });
        while(is_action_card(this.cards[0].filename))
        {
            console.log("true");
            this.cards = this.shuffle(this.cards);

        }
        this.discardDeck.unshift(this.cards[0]);
        this.cards.shift();
        this.players.forEach(player => {
            var temp = players_minfied.filter(function(pl) {
                return pl.username != player.db.username;
            });
            player.socket.emit("Started",{
                cards: player.cards,
                players:temp,
                middleCard : this.middleCard(),
                id :this.id,
                order : player.order
            });
        });
        this.whoPlayNow = 0;
        this.players[this.whoPlayNow].socket.emit("Play");
        this.players[this.whoPlayNow].socket.emit("CanDraw");
        this.direction = 1;
    }
    endgame(index)
    {
        console.log(this.id);
        if(index == -1)
        {
            this.players.forEach(player => {
                player.socket.emit("ServerEndedGame");
                player.playing = false;
            });
        }
        else
        {
            var score = 0;
            //calculate the score
            var won = this.players[index];
            this.players.forEach(player => {
                player.socket.emit("GameEnded",{
                    WhoWon : won.db.username,
                    score : score
                });
                player.playing = false;
            });
        }
        this.eventEmitter.emit('gameEnds',this.id);
    }
    recconected(access_token)
    {
        console.log("Reconnect Attempt ID="+this.id);
        var pl =[];
        this.players.forEach(function(player){
            var temp = {
                username : player.db.username,
                cards : player.cards.length,
                order : player.order,
                img : player.imgUrl
            };
            pl.push(temp);
        });
        var mid =  this.middleCard();
        var idga =  this.id;
        for(var i =0;i<this.players.length;i++)
        {
            if(this.players[i].access_token == access_token)
            {
                var self = this;
                pl = pl.filter(function(temp){
                    return temp.username != self.players[i].db.username;
                });
                this.players[i].socket.emit("reconnected",{
                    cards: this.players[i].cards,
                    players:pl,
                    middleCard :mid,
                    id:idga,
                    order:this.players[i].order
                }); 
                if(this.whoPlayNow == i)
                {
                    this.players[i].socket.emit("Play");
                    this.players[this.whoPlayNow].socket.emit("CanDraw");
                }
            }
        }
    }
    Played(cardRecieved,access_token,socket,UNO)
    {
        var pl = -1;
        //verfiy the user
        for(var i = 0;i<this.players.length;i++)
        {
            if(this.players[i].access_token == access_token)
                pl = i;
        }
        if(pl == -1)
        {            
            socket.emit("DON'T TRY TO CHEAT!!");
            return;
        }
        //verfiy that he is the one who have to play
        if(this.whoPlayNow !== pl)
        {
            socket.emit("DON'T TRY TO CHEAT!!");
            return;
        }
        //verfiy that the card can be played and he actually has the freking card ok!!!!!
        var owns = false;
        var index = -1;
        for(var i = 0;i<this.players[pl].cards.length;i++)
        {
            if(this.players[pl].cards[i].filename === cardRecieved.filename)
            {
                owns = true;
                index = i;
            }
        }
        if(!owns)
        {
            socket.emit("DON'T TRY TO CHEAT!!");
            return;
        }
        if(!this.CardCanBePlayed(cardRecieved,this.middleCard()))
        {
            socket.emit("DON'T TRY TO CHEAT!!");
            return;
        }
        //change the middle card
        this.discardDeck.unshift(cardRecieved);
        //emit it 
        /*this.players.forEach(player => {
            player.socket.emit("CardPlayed",{
                card: cardRecieved,
            });
        });*/
        for(var i = 0;i<this.players.length;i++)
        {
            if(i != pl)
            {            
                this.players[i].socket.emit("CardPlayed",{
                    card: cardRecieved,
                    player: {username: this.players[pl].db.username,cards:this.players[pl].length}
                });
            }
        }
        if(this.players[this.whoPlayNow].cards.length === 2)
        {
            if(!UNO)
            {
                var c = this.DrawCard(2);
                this.players[this.whoPlayNow].cards.push.apply(this.players[this.whoPlayNow].cards,c);
                this.players[this.whoPlayNow].socket.emit("DrawCards",{
                    cards : c,
                });
                var username = this.players[this.whoPlayNow].db.username
                this.players.forEach(function(pl){
                    if(pl.db.username != username)
                    {
                        pl.socket.emit("PlayerDrawedACard",{
                            player : username,
                            cardNum : 2
                        });
                    }
                });
            }
            else
            {
                //UNOBroadCast
                for(var i = 0;i<this.players.length;i++)
                {
                    if(i != this.whoPlayNow)
                    {
                        this.players[i].socket.emit("UNOBroadCast",{
                            player : this.players[this.whoPlayNow].db.username
                        })
                    }
                }
            }
        }
        if(this.players[this.whoPlayNow].cards.length === 1)
        {
            this.endgame(this.whoPlayNow);
        }
        if(cardRecieved.type == 2)
        {
            this.advancePlayer();
        }
        else
        {
            console.log("TODO Action card");
            if(cardRecieved.type == 0 && cardRecieved.value == 1)
            {
                this.advancePlayer();
                console.log(this.players[this.whoPlayNow].db.username);
                var c = this.DrawCard(4);
                this.players[this.whoPlayNow].cards.push.apply(this.players[this.whoPlayNow].cards,c);
                this.players[this.whoPlayNow].socket.emit("DrawCards",{
                    cards : c
                });
                var username = this.players[this.whoPlayNow].db.username;
                this.players.forEach(function(pl){
                    if(pl.db.username != username)
                    {
                        pl.socket.emit("PlayerDrawedACard",{
                            player : username,
                            cardNum : 4
                        });
                    }
                });
            }
            else if(cardRecieved.type == 0 && cardRecieved.value == 0)
            {
                this.advancePlayer();
            }
            if(cardRecieved.type == 1)
            {
                if(cardRecieved.value == 1)
                {
                    if(this.players.length > 2)
                    {
                        this.direction*=-1;
                    }
                    else
                    {
                        this.advancePlayer();
                    }
                }
                this.advancePlayer();
                console.log(cardRecieved.value);
                console.log(this.direction);
                switch (cardRecieved.value) {
                    case 0:
                        this.players[this.whoPlayNow].socket.emit("Skipped");
                        this.advancePlayer();
                        break;
                    case 2:
                        var c = this.DrawCard(2);
                        this.players[this.whoPlayNow].cards.push.apply(this.players[this.whoPlayNow].cards,c);
                        this.players[this.whoPlayNow].socket.emit("DrawCards",{
                            cards : c
                        });
                        var username = this.players[this.whoPlayNow].db.username;
                        this.players.forEach(function(pl){
                            if(pl.db.username != username)
                            {
                                pl.socket.emit("PlayerDrawedACard",{
                                    player : username,
                                    cardNum : 2
                                });
                            }
                        });
                        this.players[this.whoPlayNow].socket.emit("Skipped");
                        this.advancePlayer();
                        break;
                }
            }
            
        }
        this.players[this.whoPlayNow].hasDrawnAcard = false;
        this.players[this.whoPlayNow].socket.emit("Play");
        this.players[this.whoPlayNow].socket.emit("CanDraw");
        //remove it form the player hand
        this.players[pl].cards.splice(index,1);
    }
    advancePlayer()
    {
        this.whoPlayNow+=this.direction;
        if(this.whoPlayNow == -1)
        {
            this.whoPlayNow = this.players.length -1;
        }
        else if(this.whoPlayNow == this.players.length)
        {
            this.whoPlayNow = 0;
        }
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
    DrawCard(num = 0)
    {
        if(num != 0)
        {
            var R_cards = [];
            for(var i = 0;i<num;i++)
            {
                if(this.cards.length > 0)
                {
                    R_cards.push(this.cards[0]);
                    this.cards.shift();
                }
                else
                {
                    var last  = this.middleCard();
                    this.discardDeck.shift();
                    this.cards = copy(this.discardDeck);
                    this.discardDeck = [];
                    this.shuffle(this.cards);
                    R_cards.push(this.cards[0]);
                    this.cards.shift();
                }
            }
            return R_cards;
        }
        if(this.cards.length > 0)
        {
            var c = this.cards[0];
            this.cards.shift();
            return c;
        }
        else
        {
            var last  = this.middleCard();
            this.discardDeck.shift();
            this.cards = copy(this.discardDeck);
            this.discardDeck = [];
            this.shuffle(this.cards);
            var c = this.cards[0];
            this.cards.shift();
            return c;
        }
    }
    DrawACard(access_token)
    {
        for(var i = 0;i<this.players.length;i++){
            if(this.players[i].access_token == access_token)
            {
                var c = this.DrawCard();
                this.players[i].cards.push(c);
                this.players[i].socket.emit("CardDrawn",{
                    card: c,
                });
                var username = this.players[i].db.username
                this.players.forEach(function(pl){
                    if(pl.db.username != username)
                    {
                        pl.socket.emit("PlayerDrawedACard",{
                            player : username,
                            cardNum : 1
                        });
                    }
                });
                this.players[i].hasDrawnAcard = true;
            }
        }
    }
    Pass(access_token)
    {
        var pl = -1;
        //verfiy the user
        for(var i = 0;i<this.players.length;i++)
        {
            if(this.players[i].access_token == access_token)
                pl = i;
        }
        if(pl == -1)
        {            
            this.players[pl].socket.emit("DON'T TRY TO CHEAT!!");
            return;
        }
        //verfiy that he is the one who have to play
        if(this.whoPlayNow !== pl)
        {
            this.players[pl].socket.emit("DON'T TRY TO CHEAT!!");
            return;
        }
        if(!this.players[pl].hasDrawnAcard)
        {
            this.players[pl].socket.emit("DON'T TRY TO CHEAT!!");
            return;
        }
        this.whoPlayNow+=this.direction;
        if(this.whoPlayNow == -1)
        {
            this.whoPlayNow = this.players.length -1;
        }
        else if(this.whoPlayNow == this.players.length)
        {
            this.whoPlayNow = 0;
        }
        this.players[this.whoPlayNow].socket.emit("Play");
        this.players[this.whoPlayNow].socket.emit("CanDraw");
        this.players[pl].hasDrawnAcard = false;
    }
    CanDraw(cards)
    {
        cards.forEach(function(card){
            if(CardCanBePlayed(card,this.middleCard()))
            {
                return false;
            }
        });
        return true;
    }
    CardCanBePlayed(playerCard,midcard)
    {
        if(playerCard.type === 0)
            return true;
        else
        {
            if(playerCard.color === midcard.color)
                return true;
            else if(playerCard.value === midcard.value && playerCard.type === midcard.type)
                return true;
        }
        return false;
    }
}
