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
    constructor(players,cards){
        this.players = players;
        this.players_minfied = [];
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
                if(card.filename.includes("+2") != -1)
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
        this.players.forEach(player => {
            var pl_cards = []
            for(var i = 0;i<7;i++)
            {
                pl_cards.push(this.cards[0]);
                this.cards.shift();
            }
            console.log(this.cards.length);
            player.cards = pl_cards;
            players_minfied.push(player.db.username);
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
                return pl != player.db.username;
            });
            player.socket.emit("Started",{
                cards: player.cards,
                players:temp,
                middleCard : this.middleCard(),
                id :this.id
            });
        });
        this.players_minfied = players_minfied;
        this.whoPlayNow = 0;
        this.players[this.whoPlayNow].socket.emit("Play");
        this.players[this.whoPlayNow].socket.emit("CanDraw");
        this.direction = 1;
    }
    endgame()
    {
        this.players.forEach(player => {
            player.socket.emit("disconnectedGm");
        });
    }
    recconected(access_token)
    {
        console.log("Reconnect Attempt ID="+this.id);
        var pl = this.players_minfied;
        var mid =  this.middleCard();
        var idga =  this.id;
        for(var i =0;i<this.players.length;i++)
        {
            if(this.players[i].access_token == access_token)
            {
                var self = this;
                pl = pl.filter(function(temp){
                    return temp != self.players[i].db.username;
                });
                this.players[i].socket.emit("reconnected",{
                    cards: this.players[i].cards,
                    players:pl,
                    middleCard :mid,
                    id:idga
                }); 
                if(this.whoPlayNow == i)
                {
                    this.players[i].socket.emit("Play");
                    this.players[this.whoPlayNow].socket.emit("CanDraw");
                }
            }
        }
    }
    Played(cardRecieved,access_token,socket)
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
        this.players.forEach(player => {
            player.socket.emit("CardPlayed",{
                card: cardRecieved,
            });
        });
        //TODO: preform the action and move to the next player here
        if(cardRecieved.type == 2)
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
        else
        {
            console.log("TODO Action card");
            if(cardRecieved.type == 0 && cardRecieved.value == 1)
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
                console.log(this.players[this.whoPlayNow].db.username);
                var c = this.DrawCard(4);
                this.players[this.whoPlayNow].cards.push.apply(this.players[this.whoPlayNow].cards,c);
                this.players[this.whoPlayNow].socket.emit("DrawCards",{
                    cards : c
                });
            }
            else if(cardRecieved.type == 0 && cardRecieved.value == 0)
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
            if(cardRecieved.type == 1)
            {
                if(cardRecieved.val == 1)
                    this.direction*=-1;
                this.whoPlayNow+=this.direction;
                if(this.whoPlayNow == -1)
                {
                    this.whoPlayNow = this.players.length -1;
                }
                else if(this.whoPlayNow == this.players.length)
                {
                    this.whoPlayNow = 0;
                }
                switch (cardRecieved.value) {
                    case 0:
                        this.players[this.whoPlayNow].socket.emit("Skipped");
                        this.whoPlayNow+=this.direction;
                        if(this.whoPlayNow == -1)
                        {
                            this.whoPlayNow = this.players.length -1;
                        }
                        else if(this.whoPlayNow == this.players.length)
                        {
                            this.whoPlayNow = 0;
                        }
                        break;
                    case 2:
                        var c = this.DrawCard(2);
                        this.players[this.whoPlayNow].cards.push.apply(this.players[this.whoPlayNow].cards,c);
                        this.players[this.whoPlayNow].socket.emit("DrawCards",{
                            cards : c
                        });
                        this.players[this.whoPlayNow].socket.emit("Skipped");
                        this.whoPlayNow+=this.direction;
                        if(this.whoPlayNow == -1)
                        {
                            this.whoPlayNow = this.players.length -1;
                        }
                        else if(this.whoPlayNow == this.players.length)
                        {
                            this.whoPlayNow = 0;
                        }
                        break;
                }
            }
            
        }
        this.players[this.whoPlayNow].socket.emit("Play");
        this.players[this.whoPlayNow].socket.emit("CanDraw");
        //remove it form the player hand
        this.players[pl].cards.splice(index,1);
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
                })
            }
        }
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
