(function(){
var system;

//ゲームのメインクラス
var GameMain = arc.Class.create(arc.Game, {
	ROW_NUM:5, COL_NUM:5,
	TOP_MARGIN:5,
	LEFT_MARGIN:5,
	MARGIN:2,

	initialize:function(params){
		this._currentNumber = 0;
		this._btnArr = [];	//ボタン用配列
		this._numArr = [];	//数値並び替え用配列
		this._timer = new arc.Timer();

		//タイマー表示テキスト
		this._timeTxt = new arc.display.TextField();
		this._timeTxt.setX(160);
		this._timeTxt.setY(350);
		this._timeTxt.setAlign(arc.display.Align.CENTER);
		this._timeTxt.setFont("Helvetica", 30, true);
		this.addChild(this._timeTxt);

		//スタートボタン
		this._cover = new Cover();
		this._cover.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this._onClickCover, this));

		//ボタンの配置
		for(var i = 0, len = this.ROW_NUM * this.COL_NUM; i < len; i++){
			var btn = new NumberButton(),
			    colIndex = Math.floor(i / this.COL_NUM),
			    rowIndex = i % this.ROW_NUM;

			btn.setX(this.LEFT_MARGIN + rowIndex * (NumberButton.WIDTH + this.MARGIN));
			btn.setY(this.TOP_MARGIN + colIndex * (NumberButton.HEIGHT + this.MARGIN));
			btn.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this._onClickNumber, this));

			this.addChild(btn);
			this._btnArr.push(btn);
			this._numArr.push(i + 1);
		}
		this.addChild(this._cover);
	},

	//開始
	_start: function(){
		var btn;

		this._currentNumber = 1;
		this._timer.start();

		//シャッフル
		this._numArr = this._numArr.map(function(a){return {weight:Math.random(), value:a}})
        	.sort(function(a, b){return a.weight - b.weight})
        	.map(function(a){return a.value});
		
		//ランダムな数値をボタンにセット
		for(var i = 0, len = this._btnArr.length; i < len; i++){
			btn = this._btnArr[i];
			btn.setNumber(this._numArr[i]);
			btn.activate(true);
		}
	},

	//Coverのクリックハンドラ
	_onClickCover: function(event){
		this.removeChild(this._cover);
		this._start();
	},

	//数字ボタンのハンドラ
	_onClickNumber: function(event){
		var target = event.target;
		//現在のカウントがクリックした数字とマッチした場合カウントを進める
		if(target.getNumber() === this._currentNumber){
			target.activate(false);
			this._currentNumber++;
		}

		//全て押し切ったらタイマーをストップ
		if(this._currentNumber > this._numArr.length){
			this._timer.stop();
		}
	},

	update:function(){
		//時間経過
		var elapsed = this._timer.getElapsed(),
		    sec = ("00" + Math.floor(elapsed / 1000)).slice(-2),
		    msec =("00" + Math.floor((elapsed % 1000) / 10)).slice(-2);
		this._timeTxt.setText(sec + ":" + msec);
	}
});


//数字のボタン
var NumberButton = arc.Class.create(arc.display.DisplayObjectContainer, {
	initialize:function(){
		this._number = 0;

		//On表示
		this._bgOn = new arc.display.Shape();
		this._bgOn.beginFill(0x00ff00);
		this._bgOn.drawRect(0, 0, NumberButton.WIDTH, NumberButton.HEIGHT);
		this._bgOn.endFill();

		//Off表示
		this._bgOff = new arc.display.Shape();
		this._bgOff.beginFill(0x666666);
		this._bgOff.drawRect(0, 0, NumberButton.WIDTH, NumberButton.HEIGHT);
		this._bgOff.endFill();

		//数字表示テキスト
		this._numTxt = new arc.display.TextField();
		this._numTxt.setX(NumberButton.WIDTH / 2);
		this._numTxt.setY(NumberButton.HEIGHT / 2);
		this._numTxt.setAlign(arc.display.Align.CENTER);
		this._numTxt.setFont("Helvetica", 20, true);
		
		this.addChild(this._bgOn);
		this.addChild(this._bgOff);
		this.addChild(this._numTxt);

		this.activate(true);
	},

	setNumber:function(num){
		this._number = num;
		this._numTxt.setText(num);
	},

	getNumber:function(){
		return this._number;
	},

	activate: function(flg){
		this._bgOn.setVisible(flg);
		this._bgOff.setVisible(!flg);
	}
});
NumberButton.WIDTH = 60;
NumberButton.HEIGHT = 60;


//STARTボタン
var Cover = arc.Class.create(arc.display.DisplayObjectContainer, {
	initialize:function(){
		//黒背景
		this._bg = new arc.display.Shape();
		this._bg.beginFill(0x000000, 0.7);
		this._bg.drawRect(0, 0, system.getWidth(), system.getHeight());
		this._bg.endFill();

		//スタート表示のテキスト
		this._txt = new arc.display.TextField();
		this._txt.setAlign(arc.display.Align.CENTER);
		this._txt.setFont("Helvetica", 30, true);
		this._txt.setText("START");
		this._txt.setX(system.getWidth() / 2);
		this._txt.setY(system.getHeight() / 2);
		this._txt.setColor(0xffffff);

		this.addChild(this._bg);
		this.addChild(this._txt);
	}
});


window.addEventListener('DOMContentLoaded', function(e){
	system = new arc.System(320, 416, 'canvas');
	system.setGameClass(GameMain);
	system.start();
}, false);
})();
