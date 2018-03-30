
var CardSuit = cc.Enum ({
    none: 0,
    heart: 1,
    spade: 2,
    club: 3,
    diamond: 4,
});

var CardNumber = cc.Enum ({
    none: 0,
    num_3: 1,
    num_4: 2,
    num_5: 3,
    num_6: 4,
    num_7: 5,
    num_8: 6,
    num_9: 7,
    num_10: 8,
    num_J: 9,
    num_Q: 10,
    num_K: 11,
    num_A: 12,
    num_2: 13,
    littleJoker: 14,
    bigJoker: 15,
});

var CardInfo = cc.Class ({
    extends: cc.Component,

    ctor: function() {
    },

    properties: {
        number: {
            default: CardNumber.none,
            type: CardNumber
        },
        suit: {
            default: CardSuit.none,
            type: CardSuit
        },
    },

    statics: {
        CardNumber: CardNumber,
        CardSuit: CardSuit
    },

    desc() {
        var desc = "";

        if (this.number == CardNumber.littleJoker) {
            return "小王";
        }
        if (this.number == CardNumber.bigJoker) {
            return "大王";
        }

        switch(this.suit) {
            case CardSuit.heart:
                desc = "红桃";
                break;
            case CardSuit.spade:
                desc = "黑桃";
                break;
            case CardSuit.club:
                desc = "梅花";
                break;
            case CardSuit.diamond:
                desc = "方块";
                break;
        }

        switch(this.number) {
            case CardNumber.num_2:
                desc += "2";
                break;
            case CardNumber.num_3:
                desc += "3";
                break;
            case CardNumber.num_4:
                desc += "4";
                break;
            case CardNumber.num_5:
                desc += "5";
                break;
            case CardNumber.num_6:
                desc += "6";
                break;
            case CardNumber.num_7:
                desc += "7";
                break;
            case CardNumber.num_8:
                desc += "8";
                break;
            case CardNumber.num_9:
                desc += "9";
                break;
            case CardNumber.num_10:
                desc += "10";
                break;
            case CardNumber.num_J:
                desc += "J";
                break;
            case CardNumber.num_Q:
                desc += "Q";
                break;
            case CardNumber.num_K:
                desc += "K";
                break;
            case CardNumber.num_A:
                desc += "A";
                break;
        }

        return desc;
    },
});