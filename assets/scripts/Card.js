// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var CardInfo = require("CardInfo");
var Game = require("game");

cc.Class({
    extends: cc.Component,

    properties: {
        cardInfo: CardInfo,

        cardNum: {
            default: null,
            type: cc.Sprite
        },

        smallTag: {
            default: null,
            type: cc.Sprite,
        },

        bigTag: {
            default: null,
            type: cc.Sprite,
        },

        jokerTag: {
            default: null,
            type: cc.Sprite,
        },

        isSelected: false,
        game: {
            default: null,
            type: Game,
        },
    },

    onLoad () {
        var number = this.cardInfo.number;
        // cc.log(this.cardInfo.name);

        switch (number) {
            case CardInfo.CardNumber.littleJoker:
                this.loadJokerSpriteFrame();
                break;
            case CardInfo.CardNumber.bigJoker:
                this.loadJokerSpriteFrame();
                break;
            default: 
                this.loadNumberSpriteFrame();
                break;
        }

        var card = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function(event) {
            card.click();
        });
    },

    loadJokerSpriteFrame() {
        var card = this;
        var number = this.cardInfo.number;
        var jokerTagStr = "";
        var bigTagStr = "";

        if (number == CardInfo.CardNumber.littleJoker) {
            jokerTagStr = "b-smalltag_4";
            bigTagStr = "b-bigtag_4";
        } else {
            jokerTagStr = "b-smalltag_5";
            bigTagStr = "b-bigtag_5";
        }

        cc.loader.loadRes("poker_b", cc.SpriteAtlas, function (err, atlas) {
            var smallTagFrame = atlas.getSpriteFrame(jokerTagStr);
            var bigTagFrame = atlas.getSpriteFrame(bigTagStr);
            card.jokerTag.spriteFrame = smallTagFrame;
            card.bigTag.spriteFrame = bigTagFrame;
        });
    },

    loadNumberSpriteFrame() {
        var suitNumbers = [2, 3, 1, 0];
        var suit = this.cardInfo.suit;
        var numberMapList = [2,3,4,5,6,7,8,9,10,11,12,0,1];
        var card = this;
        var number = this.cardInfo.number;

        var smTagStr = "b-bigtag_" + suitNumbers[suit-1];
        var numberStr = null;
        if (suit == CardInfo.CardSuit.spade || suit == CardInfo.CardSuit.club) {
            numberStr = "b-black_" + numberMapList[number-1];
        } else {
            numberStr = "b-red_" + numberMapList[number-1];
        }

        cc.loader.loadRes("poker_b", cc.SpriteAtlas, function(err, atlas) {
            var tagFrame = atlas.getSpriteFrame(smTagStr);
            var numberFrame = atlas.getSpriteFrame(numberStr);

            card.smallTag.spriteFrame = tagFrame;
            card.bigTag.spriteFrame = tagFrame;
            card.cardNum.spriteFrame = numberFrame;

        });
    },

    start () {

    },

    click () {
        this.isSelected ? this.unselect() : this.select();
    },

    select () {
        if (!this.isSelected) {
            let offset = 25;
            this.node.setPositionY(this.node.getPositionY() + offset);
            this.game.appendSelectCard(this);
        }
        this.isSelected = true;
    },

    unselect () {
        if (this.isSelected) {
            let offset = 25;
            this.node.setPositionY(this.node.getPositionY() - offset);
            this.game.removeSelectCard(this);
        }
        this.isSelected = false;
    },
});
