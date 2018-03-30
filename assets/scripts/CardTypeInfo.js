// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


var CardType = cc.Enum ({
    error: 0, // 错误的类型
    single: 1, // 单牌
    pair: 2,   // 对子
    triplet: 3, // 三不带
    bomb: 4, // 炸弹
    rocket: 5, // 王炸
    triplet_one: 6, // 3带1
    triplet_two: 7, // 3带2
    bomb_two: 8, // 4带2
    bomb_twooo: 9, // 4带2对
    sequence: 10, // 顺子
    sequence_pairs: 11, // 连对
    sequence_triplet: 12, // 飞机不带
    sequence_triplet_single: 13, // 飞机带单
    sequence_triplet_pair: 14, // 飞机带对子
});

var CardTypeInfo = cc.Class({
    extends: cc.Component,
    properties: {
        cards: [cc.Integer],
        type: {
            default: CardType.error,
            type: CardType
        },
        value: 0,
    },

    statics: {
        CardType: CardType
    }
});
