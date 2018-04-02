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

PokeUtil.analysisCards = function(cards) {
    var numbers = [];
    for (const key in cards) {
        if (cards.hasOwnProperty(key)) {
            const card = cards[key];
            numbers.push(card.cardInfo.number);
        }
    }
    return PokeUtil.analysisCardNumbers(numbers);
}

PokeUtil.analysisCardInfos = function(cardInfos) {
    var numbers = [];
    for (const key in cardInfos) {
        if (cardInfos.hasOwnProperty(key)) {
            const cardInfo = cardInfos[key];
            numbers.push(cardInfo.number);
        }
    }
    return PokeUtil.analysisCardNumbers(numbers);
}


PokeUtil.analysisCardNumbers = function(numbers) {
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
        if (length == 2 && numbers[0] == CardInfo.CardNumber.littleJoker && numbers[1] == CardInfo.CardNumber.bigJoker) {
            cardTypeInfo.value = 120;
            cardTypeInfo.type = CardTypeInfo.CardType.rocket;
            return cardTypeInfo;
        }

        // 3带1
        if (length == 4 && (numbers[0] == numbers[length - 2] || numbers[1] == numbers[length -1])) {
            cardTypeInfo.type = CardTypeInfo.CardType.triplet_one;
            if (numbers[0] == numbers[length - 2]) {
                cardTypeInfo.value = 40 + numbers[0];
            } else {
                cardTypeInfo.value = 40 + numbers[1];
            }
            return cardTypeInfo;
        }
    } else {
        // 顺子
        if (PokeUtil.isContinous(numbers) && PokeUtil.isLessThan2(numbers)) {
            cardTypeInfo.type = CardTypeInfo.CardType.sequence;
            cardTypeInfo.value = 60 + numbers[0];
            return cardTypeInfo;
        }

        // 连对
        if (length >= 6 && length % 2 == 0) {
            var allPair = false;
            for (var i = 0; i < length; i+=2) {
                if (numbers[i] != numbers[i+1]) {
                    allPair = false;
                    break;
                }
            }

            if (allPair) {
                var singleNumbers = [];
                for (var i = 0; i < length; i+=2) {
                    singleNumbers.push(numbers[i]);
                }
               
                if (PokeUtil.isContinous(singleNumbers) && PokeUtil.isLessThan2(singleNumbers)) {
                    cardTypeInfo.type = CardTypeInfo.CardType.sequence_pairs;
                    cardTypeInfo.value = 80 + singleNumbers[0];
                    return cardTypeInfo;
                }

            }
        }

        // 将牌分到4个数组中, 得到单张、对子、三条、炸弹及其数量
        var singleArray   = [];   // 单张
        var pairArray     = [];   // 对子
        var tripletArray  = [];   // 三条
        var bombArray     = [];   // 炸弹
        var index = 0;
        while(index < length) {
            if (index + 1 < length && numbers[index] == numbers[index+1]) {
                if (index + 2 < length && numbers[index+1] == numbers[index+2]) {
                    if (index + 3 < length && numbers[index+2] == numbers[index+3]) {
                        bombArray.push(numbers[index]);
                        index += 4;
                    } else {
                        tripletArray.push(numbers[index]);
                        index += 3;
                    }
                } else {
                    pairArray.push(numbers[index]);
                    index += 2;
                }
            } else {
                singleArray.push(numbers[index]);
                index += 1;
            }
        }

        // 3带对子
        if (tripletArray.length == 1 && pairArray.length == 1 && singleArray.length == 0 && bombArray.length == 0) {
            cardTypeInfo.type = CardTypeInfo.CardType.triplet_two;
            cardTypeInfo.value = 80 + cards[0];
            return cardTypeInfo;
        }

        // 飞机
        if (bombArray.length == 0 && tripletArray.length == 2 && tripletArray[0] + 1 == tripletArray[1]) {
            // 333444
            if (singleArray.length == 0 && pairArray.length == 0) {
                cardTypeInfo.type = CardTypeInfo.cardType.sequence_triplet;
                cardTypeInfo.value = 80 + cards[0];
                return cardTypeInfo;
            }

            // 33344456
            if (singleArray.length == 2 && pairArray.length == 0) {
                cardTypeInfo.type = CardTypeInfo.cardType.sequence_triplet_single;
                cardTypeInfo.value = 80 + cards[0];
                return cardTypeInfo;
            }

            // 33344455
            if (singleArray.length == 0 && pairArray.length == 1) {
                cardTypeInfo.type = CardTypeInfo.cardType.sequence_triplet_single;
                cardTypeInfo.value = 80 + cards[0];
                return cardTypeInfo;
            }

            // 3334445566
            if(singleArray.length == 0 && pairArray.length == 2) {
                cardTypeInfo.type = CardTypeInfo.cardType.sequence_triplet_pair;
                cardTypeInfo.value = 80 + cards[0];
                return cardTypeInfo;
            }
        }

        // 4带2
        if (bombArray.length == 1 && length % 2 == 0 && tripletArray.length == 0) {
            // 444423
            if (singleArray.length == 2 && pairArray.length == 0) {
                cardTypeInfo.type = CardTypeInfo.CardType.bomb_two;
                cardTypeInfo.value = 80 + cards[0];
                return cardTypeInfo;
            }

            // 444422
            if (pairArray.length == 1 && singleArray.length == 0) {
                cardTypeInfo.type = CardTypeInfo.CardType.bomb_two;
                cardTypeInfo.value = 80 + cards[0];
                return cardTypeInfo;
            }

            // 44442233
            if (pairArray.length == 2 && singleArray.length == 0) {
                cardTypeInfo.type = CardTypeInfo.CardType.bomb_twooo;
                cardTypeInfo.value = 80 + cards[0];
                return cardTypeInfo;
            }
        }
    }

    return cardTypeInfo;

}

/** 判断牌是否连续 */
PokeUtil.isContinous = function (numbers) {
    numbers.sort(function(a, b) {
        return a-b;
    });

    for (var i = 0; i < numbers.length - 1; i++) {
        if (numbers[i+1] - numbers[i] != 1) {
            return false;
        }
    }
    return true;
}

/** 判断牌是否都小于2 */
PokeUtil.isLessThan2 = function(numbers) {
    for (const key in numbers) {
        if (numbers.hasOwnProperty(key)) {
            const number = numbers[key];
            if (number >= CardInfo.CardNumber.num_2) {
                return false;
            }
        }
    }
    return true;
}