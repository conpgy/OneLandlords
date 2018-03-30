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

var PokeUtil = cc.Class({
    extends: cc.Component,

    properties: {
    },
});

PokeUtil.analysisCard = function(cards) {
    var numbers = [];
    for (const key in cards) {
        if (cards.hasOwnProperty(key)) {
            const card = cards[key];
            numbers.push(card.cardInfo.number);
        }
    }

    numbers.sort(function(a, b) {
        return a - b;
    });

    var cardTypeInfo = new CardTypeInfo();
    let length = numbers.length;

    for (var i = 0; i < numbers.length; i++) {
        cardTypeInfo.cards.push(numbers[i]);
    }

    if (length == 0) {
        return cardTypeInfo;
    }

    // 小于5张牌
    if (length > 0 && length < 5) {
        // 单张、对子、三不带、炸弹
        if (numbers[0] == numbers[length - 1]) {
            switch (length) {
                case 1:
                    cardTypeInfo.value = 0 + numbers[0];
                    cardTypeInfo.type = CardTypeInfo.CardType.single;
                    break;
                case 2:
                    cardTypeInfo.value = 20 + numbers[0];
                    cardTypeInfo.type = CardTypeInfo.CardType.pair;
                    break;
                case 3:
                    cardTypeInfo.value = 40 + numbers[0];
                    cardTypeInfo.type = CardTypeInfo.CardType.triplet;
                    break;
                case 4:
                    cardTypeInfo.value = 100 + numbers[0];
                    cardTypeInfo.type = CardTypeInfo.CardType.bomb;
                    break;
            }
            return cardTypeInfo;
        }

        // 火箭
        if (length == 2 && number[0] == CardInfo.CardNumber.littleJoker && numbers[1] == CardInfo.CardNumber.bigJoker) {
            cardTypeInfo.value = 120;
            cardTypeInfo.type = CardTypeInfo.cardType.rocket;
            return cardTypeInfo;
        }

        // 3带1
        if (length == 4 && (numbers[0] == numbers[length - 2] || numbers[1] == numbers[length -1])) {
            cardTypeInfo.type = CardTypeInfo.cardType.triplet_one;
            if (numbers[0] == numbers[length - 2]) {
                cardTypeInfo.value = 40 + numbers[0];
            } else {
                cardTypeInfo.value = 40 + numbers[1];
            }
            return cardTypeInfo;
        }
    } else {
        // 顺子
    }

}
