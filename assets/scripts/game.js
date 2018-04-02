// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var GLOBAL = require("global");
var CardInfo = require("CardInfo");
var CardTypeInfo = require("CardTypeInfo");
var Card = require("Card");
var PokeUtil = require("PokeUtil");

cc.Class({
    extends: cc.Component,

    properties: {
        bgAudio: {
            default: null,
            url: cc.AudioClip
        },

        readyBtn: {
            default: null,
            type: cc.Node,
        },

        qiangDizhuLayout: {
            default: null,
            type: cc.Node,
        },

        discardLayout: {
            default: null,
            type: cc.Node,
        },

        buchuButton: {
            default: null,
            type: cc.Button,
        },

        tipsButton: {
            default: null,
            type: cc.Button,
        },

        discardButton: {
            default: null,
            type: cc.Button,
        },

        playerPrefab: {
            default: null,
            type: cc.Prefab
        },

        player1: {
            default: null,
            type: cc.Sprite,
        },

        player2: {
            default: null,
            type: cc.Sprite,
        },

        player3: {
            default: null,
            type: cc.Sprite,
        },

        deckCards: [CardInfo],

        selectedCards: {
            default: [],
            type: [cc.Component]
        },

        isGameStart: false,
        isWin: false,
    },

    ctor: function() {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this.bgAudioID = cc.audioEngine.playEffect(this.bgAudio, true);

        this.initDeckCards();
        this.loadPlayerInfo();
    },


    start () {

    },

    // EVENT

    backEvent () {
        // cc.audioEngine.stopEffect(this.bgAudioID);
        cc.director.loadScene("menu");
    },

    readyEvent () {
        this.readyBtn.active = false;
        this.deal();
    },

    qiangDiZhuEvent() {
        this.gameStart();
        this.player1.isDiZhu = true;
        this.goPlayer(this.player1);
    },

    buqiangEvent() {
        this.gameStart();
        var randomIndex = Math.floor(Math.random() * 100) % 2;
        if (randomIndex == 0) {
            this.player2.isDiZhu = true;
            this.goPlayer(this.player2);
        } else {
            this.player3.isDiZhu = true;
            this.goPlayer(this.player3);
        }
    },

    discardEvent() {
         
        if (!this.checkSelectedCards()) {
            cc.log("所选的牌不符合出牌规则");
            return;
        }

        var selectCardTypeInfo = PokeUtil.analysisCards(this.selectedCards);
        var isFollow = true;

        var lastOutCards = this.player3.getOutCards();
        var lastCardTypeInfo = PokeUtil.analysisCardInfos(lastOutCards);
        if (lastOutCards.length == 0) {
            lastOutCards = this.player2.getOutCards();
            lastCardTypeInfo = PokeUtil.analysisCardInfos(lastOutCards);
            if (lastOutCards.length == 0) {
                isFollow = false;
            }
        }

        if (isFollow && selectCardTypeInfo.value <= lastCardTypeInfo.value) {
            // 要不起啊
            cc.log("所选的牌不符合出牌规则");
            return;
        }

        this.player1.playerDiscard(isFollow, lastCardTypeInfo, this.selectedCards);
        this.selectedCards = [];
        this.goPlayer(this.player2);
    },

    buchuEvent() {
        for (const key in this.selectedCards) {
            if (this.selectedCards.hasOwnProperty(key)) {
                const card = this.selectedCards[key];
                card.unselect();
            }
        }
        this.selectedCards = [];
        this.player1.clearOutCards();
        this.goPlayer(this.player2);
    },

    tipsEvent() {
        // 获取上家出的牌型
        var player3OutCards = this.player3.getOutCards();
        var player3CardTypeInfo = PokeUtil.analysisCardInfos(player3OutCards);

        if (player3OutCards.length == 0) {
            // 上家没有出牌。获取上上家出的牌
            var player2OutCards = this.player2.getOutCards();
            var player2CardTypeInfo = PokeUtil.analysisCardInfos(player2OutCards);

            if (player2OutCards.length == 0) {
                this.player1.showTips(false, player2CardTypeInfo);
            } else {
                this.player1.showTips(true, player2CardTypeInfo);
            }

        } else {
            this.player1.showTips(true, player3CardTypeInfo);
        }
    },


    initDeckCards() {
        for (var suit = 1; suit <= 4; suit++) {
            for (var number = 1; number <= 13; number++) {
                var cardInfo = new CardInfo();
                cardInfo.suit = suit;
                cardInfo.number = number;
                cardInfo.name = cardInfo.desc();

                let index = (number - 1) + (suit - 1) * 13;
                this.deckCards[index] = cardInfo;
            }
        }

        
        var litterJoker = new CardInfo();
        litterJoker.suit = 0;
        litterJoker.number = CardInfo.CardNumber.littleJoker;
        litterJoker.name = litterJoker.desc();
        this.deckCards[52] = litterJoker;

        var bigJoker = new CardInfo();
        bigJoker.suit = 0;
        bigJoker.number = CardInfo.CardNumber.bigJoker;
        bigJoker.name = bigJoker.desc();
        this.deckCards[53] = bigJoker;

    },

    loadPlayerInfo () {
        var self = this;
        cc.loader.loadRes("strings", function(err, res) {
            var names = res["name_list"];

            var index1 = Math.ceil(Math.random() * 10000) % names.length;
            var index2 = Math.ceil(Math.random() * 10000) % names.length;
            var index3 = Math.ceil(Math.random() * 10000) % names.length;

            while(index2 == index1) {
                index2 = Math.ceil(Math.random() * 10000) % names.length;
            }
            while(index3 == index2 || index3 == index1) {
                index3 = Math.ceil(Math.random() * 10000) % names.length;
            }

            GLOBAL.playerInfo1.name = names[index1];
            GLOBAL.playerInfo1.score = 5000;
            GLOBAL.playerInfo2.name = names[index2];
            GLOBAL.playerInfo2.score = 5000;
            GLOBAL.playerInfo3.name = names[index3];
            GLOBAL.playerInfo3.score = 5000;

            cc.log("names size: " + names.length);
            cc.log("index1:" + index1 + " index2:" + index2 + " index3:" + index3);
            cc.log(GLOBAL.playerInfo1.name);
            cc.log(GLOBAL.playerInfo2.name);
            cc.log(GLOBAL.playerInfo3.name);

            GLOBAL.isReady = true;

            self.initPlayers();

        });
    },

    /** 初始化玩家信息 */
    initPlayers() {
        this.player1 = this.buildPlayerComponent();
        this.player1.ID = 1;
        this.player1.title = GLOBAL.playerInfo1.name;
        this.player1.nameLabel.string = GLOBAL.playerInfo1.name;
        this.player1.scoreLabel.string = GLOBAL.playerInfo1.score;
        this.player1.isSelf = true;
        this.player1.node.setPosition(-470, -100);
        this.node.addChild(this.player1.node);

        this.player2 = this.buildPlayerComponent();
        this.player2.ID = 2;
        this.player2.title = GLOBAL.playerInfo2.name;
        this.player2.nameLabel.string = GLOBAL.playerInfo2.name;
        this.player2.scoreLabel.string = GLOBAL.playerInfo2.score;
        this.player2.isSelf = false;
        this.player2.node.setPosition(-470, 130);
        this.node.addChild(this.player2.node);

        this.player3 = this.buildPlayerComponent();
        this.player3.ID = 3;
        this.player3.title = GLOBAL.playerInfo3.name;
        this.player3.nameLabel.string = GLOBAL.playerInfo3.name;
        this.player3.scoreLabel.string = GLOBAL.playerInfo3.score;
        this.player3.isSelf = false;
        this.player3.node.setPosition(480, 130);
        this.node.addChild(this.player3.node);
    },

    buildPlayerComponent() {
        var playerNode = cc.instantiate(this.playerPrefab);
        playerNode.getComponent("Player").game = this;
        return playerNode.getComponent("Player");
    },


    /// 发牌
    deal () {
        this.suffle();
        this.dealCard(0);
    },

    /** 洗牌 */
    suffle () {
        let length = this.deckCards.length;
        for(var i = length - 1; i >= 0; i--) {
            var randomIndex = Math.floor(Math.random() * (i+1));
            var itemtAtIndex = this.deckCards[randomIndex];
            this.deckCards[randomIndex] = this.deckCards[i];
            this.deckCards[i] = itemtAtIndex;
        }
    },

    dealCard(index) {
        if (index >= 51) return;

        var players = [this.player1, this.player2, this.player3];
        var player = players[index%3];
        var cardInfo = this.deckCards[index];
        var game = this;

        setTimeout(function() {
            player.deal(game, cardInfo);
            if (index == 50) {
                game.qiangDizhuLayout.active = true;
            }
            game.dealCard(index+1);

       }, 50);
    },

    gameStart() {
        this.isGameStart = true;
        this.qiangDizhuLayout.active = false;
        // this.discardLayout.active = true;
    },

    
    appendSelectCard(card) {
        this.selectedCards.push(card);
        // if (this.selectedCards.length > 0) {
        //     this.enableDiscardButton();
        // }
    },

    removeSelectCard(card) {
        var index = this.selectedCards.indexOf(card);
        if (index != -1) {
            this.selectedCards.splice(index, 1);
        }
        // if (this.selectedCards.length == 0) {
        //     this.disableDiscardButton();
        // }
    },

    checkSelectedCards() {
        if (this.selectedCards.length == 0) {
            return false;
        }

        var cardTypeInfo = PokeUtil.analysisCards(this.selectedCards);
        if (cardTypeInfo.type == CardTypeInfo.CardType.error) {
            return false;
        }

        return true;
    },

    disableDiscardButton () {
        this.discardButton.getComponent(cc.Button).interactable = false;
    },
    enableDiscardButton() {
        this.discardButton.getComponent(cc.Button).interactable = true;
    },

    /** 轮到指定玩家出牌了 */
    goPlayer(player) {
        player.clearOutZone();
        if (player == this.player1) {
            this.discardLayout.active = true;
        } else {
            this.discardLayout.active = false;

            var curPlayer = null;
            var lastPlayer = null;
            var lastLastPlayer = null;
            var isFollow = true;
            
            if (player == this.player2) {
                curPlayer = this.player2;
                lastPlayer = this.player1;
                lastLastPlayer = this.player3;
            } else {
                curPlayer = this.player3;
                lastPlayer = this.player2;
                lastLastPlayer = this.player1;
            }

            var lastOutCards = lastPlayer.getOutCards();
            var lastCardTypeInfo = PokeUtil.analysisCardInfos(lastOutCards);
            if (lastOutCards.length == 0) {
                lastOutCards = lastLastPlayer.getOutCards();
                lastCardTypeInfo = PokeUtil.analysisCardInfos(lastOutCards);
                if (lastOutCards.length == 0) {
                    isFollow = false;
                }
            }

            var self = this;
            setTimeout(function() {
                curPlayer.robbotDiscard(isFollow, lastCardTypeInfo);
                self.goPlayer(lastLastPlayer);
           }, 1000);
        }
    },

    gameOver(player) {
        cc.log(player.title + "赢了！！！！");
        this.isGameStart = false;

        this.isWin = (player.ID == 1);

        // 计算分数
        var baseScore = 100;
        var landloardDelta = 0;
        var farmerDelta = 0;

        if (player.isDiZhu) {
            landloardDelta = baseScore * 2;
            farmerDelta = -baseScore;
        } else {
            landloardDelta = - (baseScore * 2);
            farmerDelta = baseScore;
        }

        GLOBAL.playerInfo1.score += (this.player1.isDiZhu ? landloardDelta : farmerDelta);
        GLOBAL.playerInfo2.score += (this.player2.isDiZhu ? landloardDelta : farmerDelta);
        GLOBAL.playerInfo3.score += (this.player3.isDiZhu ? landloardDelta : farmerDelta);
        this.player1.scoreLabel.string = GLOBAL.playerInfo1.score;
        this.player2.scoreLabel.string = GLOBAL.playerInfo2.score;
        this.player3.scoreLabel.string = GLOBAL.playerInfo3.score;

        var self = this;
        setTimeout(() => {
            self.settleAccount();
        }, 1000);
    },

    /** 结算 */
    settleAccount() {
        this.qiangDizhuLayout.active = false;
        this.discardLayout.active = false;

        
    },

});
