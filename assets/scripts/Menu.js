// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
       bgAudio: {
           default: null,
           url: cc.AudioClip
       }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.bgAudioID = cc.audioEngine.playEffect(this.bgAudio, true);
    },

    startGame () {
        cc.audioEngine.stopEffect(this.bgAudioID);
        cc.director.loadScene("game");
    },

    start () {
    },

    // update (dt) {},
});
