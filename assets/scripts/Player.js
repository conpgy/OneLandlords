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
        ID: 0,

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

        if (this.ID == 1) {
            cc.log(this.groupedCards);
        }
        
    },

    removeCards (cards) {
        if (!cards || cards.lenngth == 0) return;

        

        for (const key in cards) {
            if (cards.hasOwnProperty(key)) {
                const card = cards[key];
                card.node.removeFromParent(true);

                for (var i = 0; i < this.handCards.length; i++)   {
                    var cardInfo = this.handCards[i];
                    if (cardInfo == card.cardInfo) {
                        this.handCards.splice(i, 1);
                        break;
                    }
                }
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

    /** 出牌提示
     * 
     * isFollow     : 是否是跟牌
     * cardTypeInfo : 牌型对象
     * 
     */
    showTips (isFollow, cardTypeInfo) {
        // 取消所有的选牌
        var count = this.cardsManager.node.getChildrenCount();
        for (i = 0; i < count; i++) {
            var card = this.cardsManager.node.getChildren()[i];
            if (card) {
                card.getComponent("Card").unselect();
            }
        }

        // 查询要出的牌
        var cardNumbers = isFollow ? this.findFollowCardNumbers() : this.findOutCardNumbers();
        if (cardNumbers.length == 0) {
            cc.log("没有牌打过上家");
        } else {
            // 选中相应的牌
            for (const key in cardNumbers) {
                if (cardNumbers.hasOwnProperty(key)) {
                    const number = cardNumbers[key];
                    for (i = 0; i < count; i++) {
                        var cardNode = this.cardsManager.node.getChildren()[i];
                        if (cardNode) {
                            var card = cardNode.getComponent("Card");
                            if (!card.isSelected && card.cardInfo.number == number) {
                                card.select();
                                break;
                            }
                        }
                    }
                }
            }
        }
    },

    /** 找出要跟的牌 */
    findFollowCardNumbers (followInfo) {
        var resultNumbers = [];

        for (const key in this.groupedCards) {
            if (this.groupedCards.hasOwnProperty(key)) {
                const cardTypeInfo = this.groupedCards[key];
                
                if (cardTypeInfo.value <= followInfo.value) {
                    continue;
                }

                // 单张/对子/三不带/炸弹/单顺/双顺/飞机/火箭
                if (cardTypeInfo.type == followInfo.type) {
                    if (cardTypeInfo.type == CardTypeInfo.CardType.sequence || cardTypeInfo.type == CardTypeInfo.CardType.sequence_pairs
                        || cardTypeInfo.type == CardTypeInfo.CardType.sequence_triplet) {
                        if (followInfo.cards.length == cardTypeInfo.cards.length) {
                            return cardTypeInfo.cards;
                        }
                    } else {
                        return cardTypeInfo.cards;
                    }
                } else {
                    // 上家出的牌为3带1
                    if (followInfo.type == CardTypeInfo.CardType.triplet_one) {
                        if (cardTypeInfo.type == CardTypeInfo.CardType.triplet) {
                            // 加上一张单牌
                            for (var i = 0; i < this.groupedCards.length; i++) {
                                if (groupedCards[i].type == CardTypeInfo.CardType.single) {
                                    return [
                                        cardTypeInfo.cards[0],
                                        cardTypeInfo.cards[0],
                                        cardTypeInfo.cards[0],
                                        groupedCards[i].cards[0]
                                    ];
                                }
                            }
                        }
                    }

                    // 上家出的牌为3带1对
                    if (followInfo.type == CardTypeInfo.CardType.triplet_two) {
                        if (cardTypeInfo.type == CardTypeInfo.CardType.triplet) {
                            // 加上一张单牌
                            for (var i = 0; i < this.groupedCards.length; i++) {
                                if (groupedCards[i].type == CardTypeInfo.CardType.pair && cardTypeInfo.cards[0] != groupedCards[i].cards[0]) {
                                    return [
                                        cardTypeInfo.cards[0],
                                        cardTypeInfo.cards[0],
                                        cardTypeInfo.cards[0],
                                        groupedCards[i].cards[0],
                                        groupedCards[i].cards[1],
                                    ];
                                }
                            }
                        }
                    }
                }
            }
        }

        // 没有找到对应的牌型, 用炸弹
        for (const key in this.groupedCards) {
            if (this.groupedCards.hasOwnProperty(key)) {
                const cardTypeInfo = this.groupedCards[key];
                if (cardTypeInfo.value == followInfo.value) {
                    continue;
                }
                if (cardTypeInfo.type == CardTypeInfo.CardType.bomb) {
                    return cardTypeInfo.cards;
                }
            }
        }

        // 炸弹也没有, 使用王炸
        for (const key in this.groupedCards) {
            if (this.groupedCards.hasOwnProperty(key)) {
                const cardTypeInfo = this.groupedCards[key];
                if (cardTypeInfo.type == CardTypeInfo.CardType.rocket) {
                    return cardTypeInfo.cards;
                }
            }
        }

        return resultNumbers;
    },

    /** 找出接下来要出的牌(非跟牌) */
    findOutCardNumbers () {
        // 牌组优先级: 双顺 -> 单顺 -> 三带 > 对子 > 单牌 > 炸弹 > 火箭

        var findIndex = -1;
        var tmpCardCount = 0;
    
        // 双顺
        for (var i = 0; i < this.groupedCards.length; i++) {
            if (this.groupedCards[i].type == CardTypeInfo.CardType.sequence_pairs && tmpCardCount < this.groupedCards[i].cards.length) {
                findIndex = i;
                tmpCardCount = this.groupedCards[i].cards.length;
            }
        }
        if (findIndex != -1) {
            return this.groupedCards[findIndex].cards;
        }

        // 单顺
        for (var i = 0; i < this.groupedCards.length; i++) {
            if (this.groupedCards[i].type == CardTypeInfo.CardType.sequence && tmpCardCount < this.groupedCards[i].cards.length) {
                findIndex = i;
                tmpCardCount = this.groupedCards[i].cards.length;
            }
        }
        if (findIndex != -1) {
            return this.groupedCards[findIndex].cards;
        }

        // 3-0/3-1/3-2
        for (var i = 0; i < this.groupedCards.length; i++) {
            if (this.groupedCards[i].type == CardTypeInfo.CardType.triplet) {
                for (var j = 0; j < this.groupedCards.length; j++) {
                    if(this.groupedCards[j].type == CardTypeInfo.CardType.single) {
                       return [
                         this.groupedCards[i].cards[0],
                         this.groupedCards[i].cards[0],
                         this.groupedCards[i].cards[0],
                         this.groupedCards[j].cards[0]
                       ];
                    }
                }
            }

            return this.groupedCards[i].cards;
        }

        // 对子
        for (const key in this.groupedCards) {
            if (this.groupedCards.hasOwnProperty(key)) {
                const cardTypeInfo = this.groupedCards[key];
                if (cardTypeInfo.type == CardTypeInfo.CardType.pair) {
                    return cardTypeInfo.cards;
                }
            }
        }

        // 单牌
        for (const key in this.groupedCards) {
            if (this.groupedCards.hasOwnProperty(key)) {
                const cardTypeInfo = this.groupedCards[key];
                if (cardTypeInfo.type == CardTypeInfo.CardType.single) {
                    return cardTypeInfo.cards;
                }
            }
        }

        // 炸弹
        for (const key in this.groupedCards) {
            if (this.groupedCards.hasOwnProperty(key)) {
                const cardTypeInfo = this.groupedCards[key];
                if (cardTypeInfo.type == CardTypeInfo.CardType.bomb) {
                    return cardTypeInfo.cards;
                }
            }
        }

        // 火箭
        for (const key in this.groupedCards) {
            if (this.groupedCards.hasOwnProperty(key)) {
                const cardTypeInfo = this.groupedCards[key];
                if (cardTypeInfo.type == CardTypeInfo.CardType.rocket) {
                    return cardTypeInfo.cards;
                }
            }
        }

        return [];
    },

});
