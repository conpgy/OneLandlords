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
var CardTypeInfo = require("CardTypeInfo");

cc.Class({
    extends: cc.Component,

    properties: {
        title: null,
        isSelf: false,  // 是否自己
        isDiZhu: false, // 是否地主

        cardsManager: {
            default: null,
            type: cc.Sprite
        },

        nameLabel: {
            default: null,
            type: cc.Label
        },

        scoreLabel: {
            default: null,
            type: cc.Label
        },

        pokeCountLabel: {
            default: null,
            type: cc.Label
        },

        cardPrefab: {
            default: null,
            type: cc.Prefab
        },

        outCardZone: {
            default: null,
            type: cc.Sprite,
        },

        handCards: [CardInfo],
        outCards: [CardInfo],

        groupedCards: [CardInfo],

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    deal(game, cardInfo) {
        this.handCards.push(cardInfo);
        
        if (this.isSelf) {
            var card = cc.instantiate(this.cardPrefab);
            card.getComponent('Card').cardInfo = cardInfo;
            card.getComponent('Card').game = game;
            card.name = cardInfo.name;
            this.cardsManager.node.addChild(card, 100 - cardInfo.number);
            this.cardsManager.node.sortAllChildren();
        }
        
        
        this.updateCards();
    },

    updateCards () {
        // 拆牌
        this.chaipai();

        var count = this.cardsManager.node.getChildrenCount();
        var zeroPoint = count / 2;

        this.pokeCountLabel.string = "" + count;

        for (i = 0; i < count; i++) {
            var card = this.cardsManager.node.getChildren()[i];
            if (card) {
                var x = 500 + (i - zeroPoint) * 50;
               card.setPositionX(x);
            }
            
        }
    },

    chaipai () {

	    // 牌值

	    //		   最小牌基础值	   每大一点加一
	    // 单张		0	+	1
	    // 对子		20	+	1
	    // 三带		40	+	1
	    // 单顺		60	+	1
	    // 双顺		80	+	1
	    // 炸弹		100	+	1
	    // 火箭		120


        this.groupedCards = [];

        var numbers = [];
        for (const key in this.handCards) {
            if (this.handCards.hasOwnProperty(key)) {
                const cardInfo = this.handCards[key];
                numbers.push(cardInfo.number);
            }
        }
        numbers.sort(function(a, b) {
            return a - b;
        });

        var singleArray = [];
        var pairArray = [];
        var tripletArray = [];
        var bombArray = []; 

        for (var i = 0; i < numbers.length; i++) {
            let number = numbers[i];
            var index = singleArray.indexOf(number);
            if (index != -1) {
                index = pairArray.indexOf(number);
                if (index != -1) {
                    index = tripletArray.indexOf(number);
                    if (index != -1) {
                        bombArray.push(number);
                    } else {
                        tripletArray.push(number);
                    }
                } else {
                    pairArray.push(number);
                }
            } else {
                singleArray.push(number);
            }
        }

        var littleJokerIndex = numbers.indexOf(CardInfo.CardNumber.littleJoker);
        var bigJokerIndex = numbers.indexOf(CardInfo.CardNumber.bigJoker);

        // 火箭 🚀
        if (littleJokerIndex != -1 && bigJokerIndex != -1) {
            var cardTypeInfo = new CardTypeInfo();
            cardTypeInfo.cards.push(CardInfo.CardNumber.littleJoker);
            cardTypeInfo.cards.push(CardInfo.CardNumber.bigJoker);
            cardTypeInfo.type = CardTypeInfo.CardType.rocket;
            cardTypeInfo.value = 120;
            this.groupedCards.push(cardTypeInfo);
        }

        // 炸弹
        for (var i = 0; i < bombArray.length; i++) {
            var cardTypeInfo = new CardTypeInfo();
            cardTypeInfo.cards.push(bombArray[i]);
            cardTypeInfo.cards.push(bombArray[i]);
            cardTypeInfo.cards.push(bombArray[i]);
            cardTypeInfo.cards.push(bombArray[i]);
            cardTypeInfo.type = CardTypeInfo.CardType.bomb;
            cardTypeInfo.value = 100 + bombArray[i];
            this.groupedCards.push(cardTypeInfo);
        }

        // 三条
        for (var i = 0; i < tripletArray.length; i++) {
            var cardTypeInfo = new CardTypeInfo();
            cardTypeInfo.cards.push(tripletArray[i]);
            cardTypeInfo.cards.push(tripletArray[i]);
            cardTypeInfo.cards.push(tripletArray[i]);
            cardTypeInfo.type = CardTypeInfo.CardType.triplet;
            cardTypeInfo.value = 40 + tripletArray[i];
            this.groupedCards.push(cardTypeInfo);
        }

        // 对子
        for (var i = 0; i < pairArray.length; i++) {
            var cardTypeInfo = new CardTypeInfo();
            cardTypeInfo.cards.push(pairArray[i]);
            cardTypeInfo.cards.push(pairArray[i]);
            cardTypeInfo.type = CardTypeInfo.CardType.pair;
            cardTypeInfo.value = 20 + pairArray[i];
            this.groupedCards.push(cardTypeInfo);
        }

        // 单张和单顺
        for (var i = 0; i < singleArray.length; i++) {
            for (var j = 4; j < singleArray.length; j++) {
                if (i + j < singleArray.length && singleArray[i+j] - singleArray[i] == j && singleArray[i+j] == CardInfo.CardNumber.num_A) {
                    var cardTypeInfo = new CardTypeInfo();
                    cardTypeInfo.type = CardTypeInfo.CardType.sequence;
                    cardTypeInfo.value = 60 + singleArray[i];
                    for (var k = 0; k <= j; k++) {
                        cardTypeInfo.cards.push(singleArray[k+i]);
                    }
                    this.groupedCards.push(cardTypeInfo);
                }
            }

            var cardTypeInfo = new CardTypeInfo();
            cardTypeInfo.type = CardTypeInfo.CardType.single;
            cardTypeInfo.cards.push(singleArray[i]);
            cardTypeInfo.value = singleArray[i];
            this.groupedCards.push(cardTypeInfo);
        }

        // 双顺子
        for (var i = 0; i < pairArray.length; i++) {
            for (var j = 2; j < pairArray.length; j++) {
                if (i + j < pairArray.length && pairArray[i+j] - pairArray[i] == j && pairArray[i+j] == CardInfo.CardNumber.num_A) {
                    var cardTypeInfo = new CardTypeInfo();
                    cardTypeInfo.type = CardTypeInfo.CardType.pair;
                    cardTypeInfo.value = 80 + pairArray[i];
                    for (var k = 0; k <= j; k++) {
                        cardTypeInfo.cards.push(pairArray[k+i]);
                        cardTypeInfo.cards.push(pairArray[k+i]);
                    }
                    this.groupedCards.push(cardTypeInfo);
                }
            }
        }

    },

    removeCards (cards) {
        if (!cards || cards.lenngth == 0) return;

        for (const key in cards)   {
            if (cards.hasOwnProperty(key)) {
                const element = cards[key];
                element.node.removeFromParent(true);
                this.handCards.pop(element);
            }
        }
        this.appendCardsToOutZone(cards);
        this.updateCards();
    },

    appendCardsToOutZone(cards) {
        this.outCardZone.node.removeAllChildren(true);

        var count = cards.length;
        var zeroPoint = count / 2;

        for (var i = 0; i < count; i++)   {
            var card = cards[i];
            var cardNode = card.node;
            this.outCardZone.node.addChild(cardNode, 100 - card.cardInfo.number);
        }
        this.outCardZone.node.sortAllChildren();

        // 设置position
        for (var i = 0; i < count; i++)   {
            var cardNode = this.outCardZone.node.getChildren()[i];;

            var x = 500 + (i - zeroPoint) * 50;
            var y = cardNode.getPositionY() + 150;
            cardNode.setScale(0.7, 0.7);
            cardNode.setPosition(x, y);
        }
        
    },

});
