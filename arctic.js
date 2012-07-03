/**
 * Arctic.js v0.1.8
 * Copyright (c) 2012 DeNA Co., Ltd. 
 */
(function(global){
	/**
	 * 引数をカンマ区切りで表示。console.logのラッパー
	 * @memberOf arc.util
	 */
	function trace(){
		try{
			if(arguments.length == 1){
				console.log(arguments[0]);
			}else{
				var str = "";
				for(var i = 0; i < arguments.length; i++){
					if(i != 0) str += ",";
					str += arguments[i];
				}
				console.log(str);
			}
		}catch(e){
		}
	}
	
	/**
	 * bind
	 * @memberOf arc.util
	 */ 
	function bind(func, scope){
		return function(){
			return func.apply(scope, arguments);
		}
	}
	
	/**
	 * 配列にコピー。配列ではないものも配列にして返す
	 * @memberOf arc.util
	 */ 
	function copyArray(src){
		var length = src.length, result = [];
		while(length--){
			result[length] = src[length];
		}
		return result;	
	}
	
	function getRotatedPos(x, y, rotation){
		if(arc.ua.isAndroid2_1){
			return [x, y];
		}
		var theta = rotation * Math.PI / 180;
		var returnX = x * Math.cos(theta) - y * Math.sin(theta);
		var returnY = x * Math.sin(theta) + y * Math.cos(theta);
		return [returnX, returnY];
	}

	function getRotatedRect(x, y, width, height, rotation){
		if(arc.ua.isAndroid2_1){
			return [x, y, width, height];
		}
		var pos0 = getRotatedPos(x, y, rotation),
		    pos1 = getRotatedPos(x + width, y, rotation),
		    pos2 = getRotatedPos(x, y + height, rotation),
		    pos3 = getRotatedPos(x + width, y + height, rotation);

		var minX = Math.min(pos0[0], pos1[0], pos2[0], pos3[0]),
		    minY = Math.min(pos0[1], pos1[1], pos2[1], pos3[1]),
		    maxX = Math.max(pos0[0], pos1[0], pos2[0], pos3[0]),
		    maxY = Math.max(pos0[1], pos1[1], pos2[1], pos3[1]);
			
		return [minX, minY, maxX - minX, maxY - minY];	
	}
	
	function getColorStyle(color){
		var red = color >> 16;
		var green = color >> 8 & 0xff;
		var blue = color & 0xff;
		return 'rgb(' + red + ', ' + green + ', ' + blue + ')';
	}

	/**
	 * @name arc.util
	 * @namespace 汎用関数
	 */
	var util = {
		trace	: trace,
		bind	: bind,
		copyArray : copyArray
	};
	
	
	/**
	 * @name arc.ua
	 * @namespace ユーザーエージェントから機種を判別する
	 */
	var ua = {};
	/**
	 * iPhoneからのアクセスかどうか
	 * @name isiPhone
	 * @constant {String} isiPhone
	 * @memberOf arc.ua
	 */
	ua.isiPhone	= /iPhone/i.test(navigator.userAgent);
	/**
	 * iPhone4からのアクセスかどうか
	 * @name isiPhone4
	 * @constant {String} isiPhone4
	 * @memberOf arc.ua
	 */
	ua.isiPhone4	= (ua.isiPhone && window.devicePixelRatio == 2);
	/**
	 * iPadからのアクセスかどうか
	 * @name isiPad
	 * @constant {String} isiPad
	 * @memberOf arc.ua
	 */
	ua.isiPad	= /iPad/i.test(navigator.userAgent);
	/**
	 * iOSからのアクセスかどうか
	 * @name isiOS
	 * @constant {String} isiOS
	 * @memberOf arc.ua
	 */
	ua.isiOS	= ua.isiPhone || ua.isiPad;
	/**
	 * iOS3代からのアクセスかどうか
	 * @name isiOS3
	 * @constant {String} isiOS3
	 * @memberOf arc.ua
	 */
	ua.isiOS3	= ((ua.isiPhone || ua.isiPad) && /OS\s3/.test(navigator.userAgent));
	/**
	 * Androidからのアクセスかどうか
	 * @name isAndroid
	 * @constant {String} isiAndroid
	 * @memberOf arc.ua
	 */
	ua.isAndroid	= /android/i.test(navigator.userAgent);
	/**
	 * Android2.1からのアクセスかどうか
	 * @name isAndroid2_1
	 * @constant {String} isAndroid2_1
	 * @memberOf arc.ua
	 */
	ua.isAndroid2_1	= /android\s2\.1/i.test(navigator.userAgent);
	/**
	 * モバイル端末からのアクセスかどうか
	 * @name isMobile
	 * @constant {String} isMobile
	 * @memberOf arc.ua
	 */
	ua.isMobile	= ua.isiOS || ua.isAndroid;
	
	
	var SCREEN_NORMAL_WIDTH = 320;
	
	
	/**
	 * @name arc.Class
	 * @class クラスを作成するクラス
	 */
	var Class = (function(){
		var newclass = function(){};
		/**
		 * クラスを生成する
		 * @name create
	 	 * @param {Object} definition クラス定義
	 	 * @memberof arc.Class
	 	 */ 
		/**
		 * クラスを生成する
		 * @name create^2
		 * @param {Object} parent　親クラス
	 	 * @param {Object} definition クラス定義
	 	 * @memberof arc.Class
	 	 */ 
		function create(){
			var superclass = (typeof arguments[0] == 'function') ? arguments[0].prototype : {};
			if(!arguments[0]){
				throw new Error("define class");
			}
			
			function klass(){
				this.initialize.apply(this, arguments);
			}
	
			function argumentNames(body)
			{
				var names = body.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
					.replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
					.replace(/\s+/g, '').split(',');
				return names.length == 1 && !names[0] ? [] : names;
			}
			
			function overrideMethod(childMethod, parentMethod){
				var method = function(){
					var childScope = this;
					var $super = (parentMethod !== undefined) ? function(){ return parentMethod.apply(childScope, arguments); } : undefined;
					var args = copyArray(arguments);
					args.unshift($super);
					return childMethod.apply(childScope, args);
				}
				method.valueOf = bind(childMethod.valueOf, childMethod);
				method.toString = bind(childMethod.toString, childMethod);
				return method;		
			}
			
			if(typeof arguments[0] == 'function'){
				newclass.prototype = superclass;
				klass.prototype = new newclass;
				Array.prototype.shift.apply(arguments);
			}
			var def = arguments[0];
			for(var prop in def){
				var value = def[prop];
				if(typeof value == 'function'){
					if(argumentNames(value)[0] == '$super'){
						value = overrideMethod(value, superclass[prop]);
					}else if(prop == 'initialize'){
						if(superclass.initialize){
							var childInitialize = value;
							value = function(){
								superclass.initialize.apply(this, arguments);
								childInitialize.apply(this, arguments);
							}
						}
					}
				}
				klass.prototype[prop] = value;
			}
			klass.prototype.constructor = klass;
			
			return klass;
		}
	
		return {
			create:create
		};	
	})();
	
	
	
	var Event = Class.create(
	/** @lends arc.Event.prototype */
	{
		type:null, target:null,
		/**
		 * @class イベント発生時にリスナーに渡されるイベントオブジェクトを生成する基本クラス
		 * @constructs
		 * @description イベントオブジェクトを生成
		 * @param {String} type イベント種別
		 * @param {Object} params イベントオブジェクトに加えたいプロパティ
		 */ 
		initialize:function(type, params){
			this.type = type;
			for(var prop in params){
				if(params.hasOwnProperty(prop)){
					if(prop == 'type' || prop == 'target'){
						continue;
					}
					this[prop] = params[prop];
				}
			}
		}
	});
	/**
	 * @name PROGRESS
	 * @constant {String} PROGRESS
	 * @memberOf arc.Event
	 */
	Event.PROGRESS	= 'PROGRESS';
	/**
	 * @name COMPLETE
	 * @constant {String} COMPLETE
	 * @memberOf arc.Event
	 */
	Event.COMPLETE	= 'COMPLETE';
	/**
	 * @name ENTER_FRAME
	 * @constant {String} ENTER_FRAME
	 * @memberOf arc.Event
	 */
	Event.ENTER_FRAME	= 'ENTER_FRAME';
	/**
	 * @name ERROR
	 * @constant {String} ERROR
	 * @memberOf arc.Event
	 */
	Event.ERROR	= 'ERROR';
	/**
	 * @name TIMER
	 * @constant {String} TIMER
	 * @memberOf arc.Event
	 */
	Event.TIMER	= 'TIMER';
	/**
	 * @name TIMER_COMPLETE
	 * @constant {String} TIMER_COMPLETE
	 * @memberOf arc.Event
	 */
	Event.TIMER_COMPLETE = 'TIMER_COMPLETE';
	/**
	 * @name TOUCH_START
	 * @constant {String} TOUCH_MOVE
	 * @memberOf arc.Event
	 */ 
	Event.TOUCH_START = 'TOUCH_START';
	/**
	 * @name TOUCH_MOVE
	 * @constant {String} TOUCH_MOVE
	 * @memberOf arc.Event
	 */
	Event.TOUCH_MOVE = 'TOUCH_MOVE';
	/**
	 * @name TOUCH_END
	 * @constant {String} TOUCH_END;
	 * @memberOf arc.Event
	 */
	Event.TOUCH_END = 'TOUCH_END';
	
	
	/**
	 * @name arc.EventDispatcher
	 * @class イベントを送出するすべての基本クラス
	 */
	var EventDispatcher = Class.create(
	/** @lends arc.EventDispatcher.prototype */
	{
		/**
		 * イベントリスナーオブジェクトを EventDispatcher オブジェクトに登録し、リスナーがイベントの通知を受け取るようにする
		 * @param {String} type イベントのタイプ
		 * @param {Function} callback コールバック関数
		 */
		addEventListener:function(type, callback){
			var arr = EventDispatcher.listenHash[type];
			if(!arr){
				arr = EventDispatcher.listenHash[type] = [];
			}
	
			EventDispatcher.listenHash[type].push({target : this, callback : callback});
		},
		/**
		 * EventDispatcher オブジェクトからリスナーを削除
		 * @param {String} type イベントのタイプ
		 * @param {Function} callback コールバック関数
		 */
		removeEventListener:function(type, callback){
			var arr = EventDispatcher.listenHash[type];
			if(!arr) return;
	
			var succeed = false;
	
			for(var i = 0; i < arr.length; i++){
				var obj = arr[i];
				if(obj.target == this){
					if(callback && obj.callback == callback || !callback){
						arr.splice(i, 1);
						succeed = true;
					}
				}
			}
			if(arr.length == 0){
				delete EventDispatcher.listenHash[type];
				succeed = true;
			}
		},
		/**
		 * イベントをイベントフローに送出
		 * @param {arc.Event} イベントオブジェクト
		 */ 
		dispatchEvent:function(type, params){
			if(!EventDispatcher.listenHash[type]) return;
			
			var arr = [];
			var tmp = EventDispatcher.listenHash[type];
			for(var i = 0; i < tmp.length; i++){
				arr[i] = tmp[i];
			}
			var len = arr.length;
			for(var i = 0; i < len; i++){
				var obj = arr[i];
				if(obj.target == this){
					var e = new Event(type, params);
					e.target = this;
					obj.callback.call(this, e);
				}
			}
		}
	});
	EventDispatcher.listenHash = {};
	
	
	var Timer = Class.create(
	/** @lends arc.Timer.prototype */
	{
		_startTime:0, _isCounting:false, _elapsedTime:0,
		/**
		 * @class ランループを制御するタイマークラス。クラスメソッドtickを実行する事で時間を進め、生成されたインスタンスはその時間を元に動作する。
		 * @description タイマーインスタンスを生成
		 * @constructs
		 */
		initialize:function(){
			
		},
		/**
		 * タイマーを開始
		 */ 
		start:function(){
			this._isCounting = true;
			this._startTime = Timer.time;	
		},
		/**
		 * タイマーを停止
		 */ 
		stop:function(){
			this._isCounting = false;
		},
		/**
		 * タイマーをリセット
		 */ 
		reset:function(){
			this._isCounting = true;
			this._startTime = Timer.time;	
		},
		/**
		 * startしてからの経過時間を取得。
		 */ 
		getElapsed:function(){
			if(this._isCounting){
				this._elapsedTime = Timer.time - this._startTime;
			}
			return this._elapsedTime;
		}
	});
	Timer.time = 0;
	/**
	 * タイマーの時間を進める
	 * @name tick
	 * @memberOf arc.Timer
	 */
	Timer.tick = function(){
		Timer.time = Date.now();
	};
	
	
	var CountTimer = Class.create(EventDispatcher, 
	/** @lends arc.CountTimer.prototype */
	{
		_timer:null,
		_currentCount:0, _repeatCount:0, _delay:0, _isRunning:false,
		_updateFunc:null,
	
		/**
		 * @class Timerオブジェクトをベースに指定した遅延時間にイベントを発行するCountTimerオブジェクトを生成するクラス
		 * @constructs
		 * @augments arc.EventDispatcher
		 * @description CountTimerオブジェクトを生成
		 * @param {Number} delay ミリ秒単位で指定したタイマーイベント間の遅延
		 * @param {int} repeatCount 繰り返しの回数を指定。ゼロを指定すると、タイマーは無限に繰り返される。
		 */ 	
		initialize:function(delay, repeatCount){
			this._timer = new Timer();
			this._delay = delay;
			this._repeatCount = (repeatCount) ? repeatCount : 0;
		},
		/**
		 * タイマーをリセット
		 */ 
		reset:function(){
			this._currentCount = 0;
			this.stop();
		},
		/**
		 * タイマーを開始
		 */
		start:function(){
			this._timer.start();
			if(this._updateFunc) CountTimer.system.removeEventListener(Event.ENTER_FRAME, this._updateFunc);
			this._updateFunc = bind(this._update, this);
			CountTimer.system.addEventListener(Event.ENTER_FRAME, this._updateFunc);
		},
		_update:function(e){
			var elapsed = this._timer.getElapsed();
			if(elapsed >= this._delay){
				this._currentCount++;
				this._timer.reset();
				this.dispatchEvent(Event.TIMER);
				if(this._repeatCount && this._currentCount >= this._repeatCount){
					this.reset();
					this.dispatchEvent(Event.TIMER_COMPLETE);
				}
			}
		},
		/**
		 * タイマーを停止
		 */ 
		stop:function(){
			this._timer.stop();
			if(this._updateFunc){
				CountTimer.system.removeEventListener(Event.ENTER_FRAME, this._updateFunc);
				this._updateFunc = null;
			}
		},
		/**
		 * 遅延時間を設定
		 * @param {Number} value ミリ秒単位で指定したタイマーイベント間の遅延
		 */
		setDelay:function(value){
			this._delay = value;
		},
		/**
		 * 遅延時間を取得
		 * @returns {Number} タイマーイベント間の遅延（ミリ秒）
		 */
		getDelay:function(){
			return this._delay;
		},
		/**
		 * 繰り返しの回数を設定
		 * @param {int} repeatCount 繰り返しの回数を指定。ゼロを指定すると、タイマーは無限に繰り返される。
		 */
		setRepeatCount:function(value){
			this._repeatCount = value;
		},
		/**
		 * 繰り返しの回数を取得
		 * @returns {int} 繰り返しの回数
		 */
		getRepeatCount:function(){
			return this._repeatCount;
		}
	});
	CountTimer.system = null;
	
	
	var Ajax = Class.create(EventDispatcher,
	/** @lends arc.Ajax.prototype */
	{
		_method:'GET', _params:null, _url:null,
		_request:null, _jsonResponse:null, _loadedCallBack:null,
	
		/**
		 * @class Ajax通信を行う
		 * @constructs
		 * @augments arc.EventDispatcher
		 * @description Ajaxオブジェクトを生成
		 */ 
		initialize:function(){
			this._request = new XMLHttpRequest();
			this._loadedCallBack = bind(this._loaded, this);
		},
		/**
		 * 通信を開始。終了時にEvent.COMPLETEが送出される
		 * @param {String} url 通信先のURL
		 * @param {Object} params パラメーター
		 */ 
		load:function(url, params){
			this._url = url;
			this._params = params;
			this._request.open(this._method, this._url, true);
			//this._request.onreadystatechange = bind(this._loaded, this);
			this._request.addEventListener('readystatechange', this._loadedCallBack, false);
			this._request.send(this._params);
		},
		_loaded:function(){
			if(this._request.readyState == 4){
				if(this._request.status == 200 || this._request.status == 0){
					this.dispatchEvent(Event.COMPLETE);
				}else{
					this.dispatchEvent(Event.ERROR);
					throw new Error("Load Error : " + this._url);
				}
			}
		},
		unload:function(){
			this._request.abort();
			this._jsonResponse = null;
			this._request.removeEventListener('readystatechange', this._loadedCallBack, false);
		},
		/**
		 * 通信のメソッドGET/POSTを設定
		 * @param {String} method メソッド
		 */ 
		setMethod:function(method){
			this._method = method;
		},
		/**
		 * responseTextを取得
		 * @returns {String} AjaxのreponseText
		 */ 
		getResponseText:function(){
			return this._request.responseText;
		},
		/**
		 * responseをJSONとして取得
		 * @returns {Object} JSONオブジェクト
		 */
		getResponseJSON:function(){
			if(!this._jsonResponse){
				this._jsonResponse = JSON.parse(this._request.responseText);
			}
			return this._jsonResponse;
		},
		/**
		 * URLを取得
		 * @returns {String} 読み込んだURL
		 */
		getURL:function(){
			return this._url;
		}
	});


	function getScreenWidth(){
		if(window.orientation == 90 || window.orientation == -90){
			return screen.height;
		}else{
			return screen.width;
		}
	}	
	
	/**
	 * @name arc.display
	 * @namespace
	 */
	var display = {};
	display.Image = Class.create(EventDispatcher,
	/** @lends arc.display.Image.prototype */
	{
		_data:null, _path:null, _width:null, _height:null, _frameWidth:null,
		_lx:null, _ly:null, _lwidth:null, _lheight:null, _hasLocalPos:false,
	
		/**
		 * @class 画像を扱う
		 * @constructs
		 * @augments arc.EventDispatcher
		 * @description Imageオブジェクトを生成
		 * @param {HTMLImageElement} data HTMLImageElementまたは画像パス
		 * @param {Number} localPosArr 利用するローカル座標とサイズを配列で指定します。(オプション）
		 *
		 */ 
		initialize:function(data, localPosArr){
			if(!data && data.constructor != HTMLImageElement){
				throw new Error('set HTMLImageElement');
			}
			
			this._data = data;
			this._path = data.src;
	
			if(localPosArr && localPosArr.length == 4){
				this._lx = localPosArr[0];
				this._ly = localPosArr[1];
				this._lwidth = localPosArr[2];
				this._lheight = localPosArr[3];
				this._hasLocalPos = true;

				this._width = this._lwidth;
				this._height = this._lheight;
			}else{
				this._width = this._data.width;
				this._height = this._data.height;
			}
		},
		/**
		 * 画像を複製
		 * @returns {Image} 複製された画像
		 */ 
		duplicate:function(){
			var newImg = new display.Image();
			newImg._setData(this._data);
			return newImg;
		},
		/**
		 * 画像の拡大させる
		 * @param {Number} xscale x方向拡大率
		 * @param {Number} yscale y方向拡大率
		 * @returns {Image} 拡大後のImageオブジェクト
		 */ 
		changeScale:function(xscale, yscale){
			return this.changeSize(this._width * xscale, this._height * yscale);
		},
		/**
		 * 画像のサイズを変化させる
		 * @param {Number} width 変化後の幅
		 * @param {Number} height 変化後の高さ
		 * @returns {Image} 拡大後のImageオブジェクト
		 */ 
		changeSize:function(nwidth, nheight){
			var canvas = document.createElement('canvas'),
			    x = 0, y = 0, width = this._width, height = this._height;
			
			canvas.width = nwidth;
			canvas.height = nheight;
	
			if(this._hasLocalPos){
				x = this._lx;
				y = this._ly;
				width = this._lwidth;
				height = this._lheight;
	
				this._hasLocalPos = false;
			}
	
			if(arc.ua.isAndroid2_1 && getScreenWidth() != SCREEN_NORMAL_WIDTH){
				var scale = SCREEN_NORMAL_WIDTH /getScreenWidth();
	
				x = ~~(x * scale);
				y = ~~(y * scale);
				width = ~~(width * scale);
				height = ~~(height * scale);
				nwidth = ~~(nwidth * scale);
				nheight = ~~(nheight * scale);
			}
	
			canvas.getContext('2d').drawImage(this._data, x, y, width, height, 0, 0, nwidth, nheight);
			this._data = canvas;
			this._width = this._data.width;
			this._height = this._data.height;
	
			return this;
	
		},
		/**
		 * 色を変える
		 * @param {int} color カラー
		 * @param {Number} density カラーの適用率
		 */ 
		changeColor:function(color, density){
			var width = this._data.width;
			var height = this._data.height;
			var canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(this._data, 0, 0);
	
			var originData = ctx.getImageData(0, 0, width, height);
			var newData = ctx.createImageData(width, height);
	
			var red = color >> 16;
			var green = color >> 8 & 0xff;
			var blue = color & 0xff;		
			
			for(var i = 0; i < height; i++){
				for(var j = 0; j < width; j++){
					var index = j * 4 + i * 4 * width;
					
					newData.data[index] = (red - originData.data[index]) * density + originData.data[index];
					newData.data[index + 1] = (blue - originData.data[index + 1]) * density + originData.data[index + 1];
					newData.data[index + 2] = (green - originData.data[index + 2]) * density + originData.data[index + 2];
					newData.data[index + 3] = originData.data[index + 3];
				}
			}
			ctx.putImageData(newData, 0, 0);
			this._data = canvas;
	
			return this;
		},
		/**
		 * 描画を行う
		 * @param {Number} x 描画を行うx座標
		 * @param {Number} y 描画を行うy座標
		 * @param {Number} rotation 回転角度
		 */ 
		draw:function(x, y, rotation){
			//ローカル座標が指定されていたらクロップする
			if(this._hasLocalPos){
				this.drawCrop(this._lx, this._ly, this._lwidth, this._lheight, x, y, this._width, this._height, rotation);
				return;
			}
	
			if(arc.ua.isAndroid2_1 && getScreenWidth() != SCREEN_NORMAL_WIDTH){
				var scale = SCREEN_NORMAL_WIDTH /getScreenWidth();
				x *= scale;
				y *= scale;
			}
			x = ~~(x); y = ~~(y);
			var ctx = display.Image.context;
			ctx.save();
			ctx.translate(x, y);
			if(rotation % 360 != 0) ctx.rotate(rotation);
			ctx.drawImage(this._data, 0, 0);
			ctx.restore();
		},
		/**
		 * サイズを指定して描画
		 * @param {Number} x 描画を行うx座標
		 * @param {Number} y 描画を行うy座標
		 * @param {Number} width 描画する横幅
		 * @param {Number} height 描画する高さ
		 * @param {Number} rotation 回転角度
		 */
		drawSize:function(x, y, width, height, rotation){
			//ローカル座標が指定されていたらクロップする
			if(this._hasLocalPos){
				this.drawCrop(this._lx, this._ly, this._lwidth, this._lheight, x, y, width, height, rotation);
				return;
			}
	
			var scaleX = width / this._width;
			var scaleY = height / this._height;
			var ctx = display.Image.context;
	
			if(arc.ua.isAndroid2_1){
				var scale = SCREEN_NORMAL_WIDTH /getScreenWidth();
				x = ~~(x * scale);
				y = ~~(y * scale);
				width = ~~(width * scale);
				height = ~~(height * scale);
	
				ctx.drawImage(this._data, x, y, width, height);
				return;
			}
			x = ~~(x); y = ~~(y); width = ~~(width); height = ~~(height);
			ctx.save();
			ctx.translate(x, y);
			if(rotation % 360 != 0) ctx.rotate(rotation * Math.PI / 180);
			if(scaleX != 1 || scaleY != 1) ctx.scale(scaleX, scaleY);
	
			ctx.drawImage(this._data, 0, 0, this._width, this._height);
			ctx.restore();
		},
		/**
		 * 切り取りエリアとサイズを指定して描画
		 * @param {Number} x1 切り取りを行うx座標
		 * @param {Number} y1 切り取りを行うy座標
		 * @param {Number} width1 切り取る横幅
		 * @param {Number} height1 切り取る高さ
		 * @param {Number} x2 描画を行うx座標
		 * @param {Number} y2 描画を行うy座標
		 * @param {Number} width2 描画する横幅
		 * @param {Number} height2 描画する高さ
		 * @param {Number} rotation 回転角度
		 */	
		drawCrop:function(x1, y1, width1, height1, x2, y2, width2, height2, rotation){
			if(this._hasLocalPos && this._frameWidth){
				x1 += this._lx;
				y1 += this._ly;
			}
	
			var width = (this._frameWidth) ? this._frameWidth : this._width;
			var scaleX = width2 / width;
			var scaleY = height2 / this._height;
			var ctx = display.Image.context;
	
			if(arc.ua.isAndroid2_1){
				var scale = SCREEN_NORMAL_WIDTH /getScreenWidth();
	
				if(this._data.constructor != HTMLCanvasElement){
					x1 = ~~(x1 * scale);
					y1 = ~~(y1 * scale);
					width1 = ~~(width1 * scale);
					height1 = ~~(height1 * scale);
				}
				x2 = ~~(x2 * scale);
				y2 = ~~(y2 * scale);
				width2 = ~~(width2 * scale);
				height2 = ~~(height2 * scale);
	
				ctx.drawImage(this._data, x1, y1, width1, height1, x2, y2, width2, height2);
				return;
			}
	
	
			x1 = ~~(x1); y1 = ~~(y1); width1 = ~~(width1); height1 = ~~(height1); x2 = ~~(x2); y2 = ~~(y2); width2 = ~~(width2); height2 = ~~(height2);
			ctx.save();
			ctx.translate(x2, y2);
			if(rotation % 360 != 0) ctx.rotate(rotation * Math.PI / 180);
			if(scaleX != 1 || scaleY != 1) ctx.scale(scaleX, scaleY);
			ctx.drawImage(this._data, x1, y1, width1, height1, 0, 0, width, this._height);
			ctx.restore();
		},
		/**
		 * 連続フレームPNGの場合１フレームの横幅を指定する
		 * @param {Number} frameWidth １フレームの横幅
		 */ 
		setFrameWidth:function(value){
			this._frameWidth = value;
		},
		/**
		 * 連続フレームPNGの場合１フレームの横幅を返す
		 * @returns {Number} １フレームの横幅
		 */
		getFrameWidth:function(){
			return this._frameWidth;
		},
		/**
		 * 横幅を取得
		 * @returns {Number} 横幅
		 */ 
		getWidth:function(){
			return this._width;
		},
		/**
		 * 高さを取得
		 * @returns {Number} 高さ
		 */ 
		getHeight:function(){
			return this._height;
		},
		/**
		 * 画像のURLを取得
		 * @returns {Number} 画像のURL
		 */ 
		getPath:function(){
			return this._path;
		}
	});
	display.Image.context = null;
	
	
	display.DisplayObject = Class.create(EventDispatcher, 
	/** @lends arc.display.DisplayObject.prototype */
	{
		_data:null, _parent:null,
		_x:0, _y:0, _width:null, _height:null, _visible:true, _scaleX:1, _scaleY:1, _alpha:1, _rotation:0, _alignX:0, _alignY:0, _screenRect:[],
		/**
		 * @class 表示オブジェクトの基本クラス
		 * @constructs
		 * @param {Image} data 表示するImageオブジェクト
		 * @augments arc.EventDispatcher
		 * @description 表示オブジェクト生成
		 */
		initialize:function(data){
			if(!data) return;
			this._data = data;
			this._width = this._data.getWidth();
			this._height = this._data.getHeight();
			this._screenRect = [0, 0, this._width, this._height];
		},
		/**
		 * ローカルの座標系からグローバルの座標系に変換
		 * @param {Number} x x座標
		 * @param {Number} y y座標
		 * @return {Array} グローバルの座標系に変換したx座標とy座標を内包した配列
		 */ 
		localToGlobal:function(x, y){
			var targ = this, targX = x, targY = y;
			var returnX = 0, returnY = 0;
			while(targ){
				var pos = getRotatedPos(targX, targY, targ.getRotation());
				returnX += pos[0];
				returnY += pos[1];
	
				targX = targ.getX();
				targY = targ.getY();
				targ = targ.getParent();
			}
			return [returnX, returnY];
		},
		/**
		 * グローバルの座標系からローカルの座標系に変換
		 * @param {Number} x x座標
		 * @param {Number} y y座標
		 * @return {Array} ローカルの座標系に変換したx座標とy座標を内包した配列
		 */ 
		globalToLocal:function(x, y){
			var parentArr = [];
			var targ = this, returnX = x, returnY = y, targX = x, targY = y;
	
			while(targ){
				parentArr.unshift(targ);
				targ = targ.getParent();
			}
			for(var i = 0; i < parentArr.length; i++){
				var tParent = parentArr[i];
				
				targX -= tParent.getX();
				targY -= tParent.getY();

				var pos = getRotatedPos(targX, targY, -1 * tParent.getRotation());
				var tX = pos[0];
				var tY = pos[1];
	
				targX = tX;
				targY = tY;
			}
			
			return [targX, targY];
		},
		hitTestObject:function(targ){
			
		},
		/**
		 * 描画を行う
		 */ 
		draw:function(){
					
		},
		/**
		 * x座標を指定
		 * @param {Number} x x座標
		 */ 
		setX:function(value){
			this._x = value;
			this._updateScreenRect();
		},
		/**
		 * x座標を取得
		 * @returns {Number} x座標
		 */
		getX:function(){
			return this._x;
		},
		/**
		 * y座標を指定
		 * @param {Number} y y座標
		 */ 
		setY:function(value){
			this._y = value;
			this._updateScreenRect();
		},
		/**
		 * y座標を取得
		 * @returns {Number} y座標
		 */
		getY:function(){
			return this._y;
		},
		/**
		 * 幅を指定
		 * @param {Number} width 幅
		 */
		setWidth:function(value){
			if(!value) value = 0;
			this._width = value;
			if(this._data){
				this._scaleX = this._width / this._data.getWidth();
			}
			this._updateScreenRect();
		},
		/**
		 * 幅を取得
		 * @returns {Number} 幅
		 */
		getWidth:function(){
			return this._width;
		},
		/**
		 * 高さを指定
		 * @param {Number} height 高さ
		 */
		setHeight:function(value){
			if(!value) value = 0;
			this._height = value;
			if(this._data){
				this._scaleY = this._height / this._data.getHeight();
			}
			this._updateScreenRect();
		},
		/**
		 * 高さを取得
		 * @returns {Number} 高さ
		 */ 
		getHeight:function(){
			return this._height;
		},
		/**
		 * 横の拡大率を指定
		 * @param {Number} scaleX 横の拡大率
		 */
		setScaleX:function(value){
			if(!value) value = 0;
			//if(value > 1) trace("exceed scale 1 :" + value);
			this._scaleX = value;
			this._width = this._data.getWidth() * this._scaleX;
			this._updateScreenRect();
		},
		/**
		 * 横の拡大率を取得
		 * @returns {Number} 横の拡大率
		 */ 
		getScaleX:function(){
			return this._scaleX;
		},
		/**
		 * 縦の拡大率を指定
		 * @param {Number} scaleX 縦の拡大率
		 */
		setScaleY:function(value){
			//if(value > 1) trace("exceed scale 1 :" + value);
			if(!value) value = 0;
			this._scaleY = value;
			this._height = this._data.getHeight() * this._scaleY;
			this._updateScreenRect();
		},
		/**
		 * 縦の拡大率を取得
		 * @returns {Number} 縦の拡大率
		 */ 
		getScaleY:function(){
			return this._scaleY;
		},
		/**
		 * 可視を指定
		 * @param {Boolean} value
		 */
		setVisible:function(value){
			this._visible = value;
		},
		/**
		 * 可視を取得
		 * @returns {Boolean} 可視
		 */
		getVisible:function(){
			return this._visible;
		},
		/**
		 * 表示オブジェクトの親を取得
		 * @returns
		 */ 
		getParent:function(){
			return this._parent;
		},
		/**
		 * アルファ値を指定
		 * @param {Number} alpha アルファ値
		 */ 
		setAlpha:function(value){
			if(!value) value = 0;
			this._alpha = value;
		},
		/**
		 * アルファ値を取得
		 * @returns {Number} アルファ値
		 */ 
		getAlpha:function(){
			return this._alpha;
		},
		/**
		 * 回転角度を指定
		 * @param {Number} rotation 回転角度
		 */
		setRotation:function(value){
			if(!value) value = 0;
			this._rotation = value;
		},
		/**
		 * 回転角度を取得
		 * @returns {Number} 回転角度
		 */
		getRotation:function(){
			return this._rotation;
		},
		/**
		 * 原点からのx座標を取得
		 * @returns {Number}　原点からのx座標
		 */
		getAlignX:function(){
			return this._alignX;
		},
		/**
		 * 原点からのy座標を取得
		 * @returns {Number}　原点からのy座標
		 */ 
		getAlignY:function(){
			return this._alignY;
		},

		_updateScreenRect:function(){
			var tX = this._x + this._alignX * this._scaleX,
			    tY = this._y + this._alignY * this._scaleY,
			    tWidth = this._width,
			    tHeight = this._height;
			
			this._screenRect = getRotatedRect(tX, tY, tWidth, tHeight, this._rotation);
		}
	});
	
	
	display.DisplayObjectContainer = Class.create(display.DisplayObject, 
	/** @lends arc.display.DisplayObjectContainer.prototype */
	{
		_displayArr:null, _originWidth:0, _originHeight:0, _maskObj:null,
	
		/**
		 * @class 表示オブジェクトを包括する表示オブジェクトを生成するクラス
		 * @constructs
		 * @augments arc.display.DisplayObject
		 * @description 表示オブジェクト生成
		 */
		initialize:function($super){
			$super(null);
			this._displayArr = [];
			this._minX = this._maxX = this._minY = this._maxY = 0;
		},
		/**
		 * 表示リストにDisplayObjectオブジェクトを追加
		 * @param {DisplayObject} targ 追加するDisplayObjectオブジェクト
		 */
		addChild:function(targ){
			var len = this._displayArr.length;
			for(var i = 0; i < len; i++){
				if(this._displayArr[i] == targ) return;
			}
			
			this._displayArr.push(targ);
			targ._parent = this;
			this._updateSize();
		},
		/**
		 * 表示リストの指定の深度にDisplayObjectオブジェクトを追加
		 * @param {DisplayObject} targ 追加するDisplayObjectオブジェクト
		 * @param {int} index 深度
		 */
		addChildAt:function(targ, index){
			this._displayArr.splice(index, 0, targ);
			targ._parent = this;
			this._updateSize();
		},
		/**
		 * 表示リストからDisplayObjectオブジェクトを削除
		 * @param {DisplayObject} targ 削除するDisplayObjectオブジェクト
		 */
		removeChild:function(targ){
			var len = this._displayArr.length;
			for(var i = 0; i < len; i++){
				if(this._displayArr[i] == targ){
					this._displayArr.splice(i, 1);
					targ._parent = null;
					if(targ._removeAllChild){
						targ._removeAllChild();
					}
					break;
				}
			}
			this._updateSize();
		},
		_removeAllChild:function(){
			var i, len, targ;
			for(i = 0, len = this._displayArr.length; i < len; i++){
				targ = this._displayArr[i];
				targ._parent = null;
				if(targ._removeAllChild){
					targ._removeAllChild();
				}
			}
			this._displayArr = [];
		},
		/**
		 * DisplayObjectオブジェクトが表示リストに含まれているか否か
		 * @param {DisplayObject} targ チェックするDisplayObjectオブジェクト
		 * @returns {Boolean} 表示リストに含まれているか否か
		 */
		contains:function(targ){
			var len = this._displayArr.length;
			for(var i = 0; i < len; i++){
				if(this._displayArr[i] == targ){
					return true;
				}
			}
			return false;
		}, 
	
        /**
         * 子DisplayObjectの深度を変更する
         * @param {DisplayObject} child 変更したい子DisplayObject
         * @param {Number} index 変更後の深度
         */
        setChildIndex:function(child, index){
            for(var i = 0, len = this._displayArr.length; i < len; i++){
                var disp = this._displayArr[i];
                if(disp == child){
                    this._displayArr.splice(i, 1);
                    this._displayArr.splice(index, 0, child);
                }
            }
        },

		draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			if(!this.getVisible()) return;
	
			pX = (pX | 0);
			pY = (pY | 0);
			pScaleX = (!isNaN(pScaleX)) ? pScaleX : 1;
			pScaleY = (!isNaN(pScaleY)) ? pScaleY : 1;
			pAlpha = (!isNaN(pAlpha)) ? pAlpha : 1;
			pRotation = (pRotation) ? pRotation : 0;
	
			var tx = pX;
			var ty = pY;
			var tScaleX = pScaleX * this._scaleX;
			var tScaleY = pScaleY * this._scaleY;
			var tAlpha = pAlpha * this._alpha;
			var tRotation = pRotation + this._rotation;
			var context = display.Image.context;
	
			var dispArr = copyArray(this._displayArr);
			var len = dispArr.length;
			for(var i = 0; i < len; i++){
				var disp = dispArr[i];
				var posX = disp.getX() * tScaleX;  //local position in reality
				var posY = disp.getY() * tScaleY;
	
				if(tRotation % 360 != 0){
					var tmpX = posX;
					var tmpY = posY;
					var pos = getRotatedPos(tmpX, tmpY, tRotation);
					posX = pos[0];
					posY = pos[1];
				}
				var localX = disp.getAlignX() * tScaleX * disp.getScaleX();
				var localY = disp.getAlignY() * tScaleY * disp.getScaleY();
				var pos = getRotatedPos(localX, localY, (disp.getRotation() + tRotation));
				posX += pos[0] + tx;
				posY += pos[1] + ty;
				
				if(!disp.getVisible()) continue;
				if(this._maskObj){
					context.save();
					context.beginPath();
					context.rect(this._maskObj.x * tScaleX + tx, this._maskObj.y * tScaleY + ty, this._maskObj.width * tScaleX, this._maskObj.height * tScaleY);
					context.closePath();
					context.clip();
				}
				disp.draw(posX, posY, tScaleX, tScaleY, tAlpha, tRotation);
	
				if(this._maskObj){
					context.restore();
				}
			}
			
			this._updateSize();
		},
		_updateSize:function(){
			var minX = 0, minY = 0, maxX = 0, maxY = 0;
			var len = this._displayArr.length;
			for(var i = 0; i < len; i++){
				var disp = this._displayArr[i];

				var tminX = disp._screenRect[0],
				    tminY = disp._screenRect[1],
				    tmaxX = disp._screenRect[0] + disp._screenRect[2],
				    tmaxY = disp._screenRect[1] + disp._screenRect[3];

				if(i == 0){
					minX = tminX;
					minY = tminY;
					maxX = tmaxX;
					maxY = tmaxY;
				}
				if(tminX < minX) minX = tminX;
				if(tmaxX > maxX) maxX = tmaxX;
				if(tminY < minY) minY = tminY;
				if(tmaxY > maxY) maxY = tmaxY;
				
			}
	
			this._originWidth = maxX - minX;
			this._originHeight = maxY - minY;
			this._width = this._originWidth * this._scaleX;
			this._height = this._originHeight * this._scaleY;

			this._screenRect = getRotatedRect(
				minX * this._scaleX + this._x,
				minY * this._scaleY + this._y,
				this._width,
				this._height,
				this._rotation
			);
		},
		
		setWidth:function(value){
			this._width = value;
			this._scaleX = this._width / this._originWidth;
		},
		setHeight:function(value){
			this._height = value;
			this._scaleY = this._height / this._originHeight;
		},
		setScaleX:function(value){
			//if(value > 1) trace("exceed scale 1 :" + value);
			this._scaleX = value;
			this._width = this._originWidth * this._scaleX;
		},
		setScaleY:function(value){
			//if(value > 1) trace("exceed scale 1 :" + value);
			this._scaleY = value;
			this._height = this._originHeight * this._scaleY;
		},
		/**
		 * マスクをセットする
		 * @param {Number} x マスクのx座標
		 * @param {Number} y マスクのy座標
		 * @param {Number} width マスクの横幅
		 * @param {Number} height マスクの高さ
		 */ 
		setMask:function(x, y, width, height){
			this._maskObj = {x:x, y:y, width:width, height:height};
		},
		/**
		 * マスクを解除する
		 */
		clearMask:function(){
			this._maskObj = null;
		},

		_updateScreenRect:function(){
			this._updateSize();
		}
	});
	
	
	/**
	 * @name arc.display.Align
	 * @namespace
	 */
	display.Align = {
		/**
		 * @name TOP
		 * @constant {String} TOP
		 * @memberOf arc.display.Align
		 */
		TOP		:'TOP',
		/**
		 * @name TOP_LEFT
		 * @constant {String} TOP_LEFT
		 * @memberOf arc.display.Align
		 */
		TOP_LEFT	:'TOP_LEFT',
		/**
		 * @name TOP_RIGHT
		 * @constant {String} TOP_RIGHT
		 * @memberOf arc.display.Align
		 */
		TOP_RIGHT	:'TOP_RIGHT',
		/**
		 * @name CENTER
		 * @constant {String} CENTER
		 * @memberOf arc.display.Align
		 */
		CENTER		:'CENTER',
		/**
		 * @name LEFT
		 * @constant {String} LEFT
		 * @memberOf arc.display.Align
		 */
		LEFT		:'LEFT',
		/**
		 * @name RIGHT
		 * @constant {String} RIGHT
		 * @memberOf arc.display.Align
		 */
		RIGHT		:'RIGHT',
		/**
		 * @name BOTTOM
		 * @constant {String} BOTTOM
		 * @memberOf arc.display.Align
		 */
		BOTTOM		:'BOTTOM',
		/**
		 * @name BOTTOM_LEFT
		 * @constant {String} BOTTOM_LEFT
		 * @memberOf arc.display.Align
		 */
		BOTTOM_LEFT	:'BOTTOM_LEFT',
		/**
		 * @name BOTTOM_RIGHT
		 * @constant {String} BOTTOM_RIGHT
		 * @memberOf arc.display.Align
		 */
		BOTTOM_RIGHT	:'BOTTOM_RIGHT'
		
	};
	
	
	
	display.Shape = Class.create(display.DisplayObject, 
	/** @lends arc.display.Shape.prototype */
	{
		_funcStack:null, _minX:0, _maxX:0, _minY:0, _maxY:0, _firstFlg:true, _willBeFilled:false, _willBeStroked:false,
	
		/**
		 * @class canvasにベクタを描画する表示オブジェクト
		 * @constructs
		 * @augments arc.display.DisplayObject
		 * @description Shapeオブジェクト生成
		 */
		initialize:function(){
			this._funcStack = new Array();
		},
		/**
		 * 塗りの開始
		 * @param {int} color 色
		 * @param {alpha} alpha アルファ値
		 */ 
		beginFill:function(color, alpha){
			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				self._willBeFilled = true;
				var ctx = display.Image.context;
				ctx.fillStyle = getColorStyle(color);
				ctx.globalAlpha = alpha * pAlpha;
			});
		},
		/**
		 * 塗りの終了
		 */
		endFill:function(){
			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				self._willBeFilled = false;
				var ctx = display.Image.context;
			});
		},
		/**
		 * ストロークの開始
		 * @param {Number} thickness　線の太さ
		 * @param {int} color 色
		 * @param {Number} alpha アルファ値
		 */
		beginStroke:function(thickness, color, alpha){
			var self = this;
			if(!alpha) alpha = 1;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				self._willBeStroked = true;
				
				var ctx = display.Image.context;
				ctx.lineWidth = thickness;
				ctx.strokeStyle = getColorStyle(color);
				ctx.globalAlpha = alpha * pAlpha;
			});
		},
		/**
		 * ストロークの終了
		 */
		endStroke:function(){
			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				self._willBeStroked = false;
			});
		},
		/**
		 * 現在の描画位置を移動
		 * @param {Number} x 移動先のx座標
		 * @param {Number} y 移動先のy座標
		 */
		moveTo:function(x, y){
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				var ctx = display.Image.context;
				ctx.moveTo((x + pX) / pScaleX, (y + pY) / pScaleY);
			});
		},
		/**
		 * 現在の描画位置から線を描画して描画位置を変更
		 * @param {Number} x 移動先のx座標
		 * @param {Number} y 移動先のy座標
		 */
		lineTo:function(x, y){
			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				var ctx = display.Image.context;
				ctx.lineTo((x + pX) / pScaleX, (y + pY) / pScaleY);
				if(self._willBeStroked) ctx.stroke();
			});
		},
		_updateSize: function(x, y, width, height){
			if(this._firstFlg){
				this._firstFlg = false;
				this._minX = x;
				this._maxX = x + width;
				this._minY = y;
				this._maxY = y + height;
			}
			if(x < this._minX) this._minX = x;
			if(x + width > this._maxX) this._maxX = x + width;
			if(y < this._minY) this._minY = y;
			if(y + height > this._maxY) this._maxY = y + height;
	
			this._originWidth = this._maxX - this._minX;
			this._originHeight = this._maxY - this._minY;

			this._width = this._originWidth * this._scaleX;
			this._height = this._originHeight * this._scaleY;

			this._updateScreenRect();
		},
		/**
		 * 矩形を描画
		 * @param {Number} x 矩形のx座標
		 * @param {Number} y 矩形のy座標
		 * @param {Number} width 矩形の横幅
		 * @param {Number} height 矩形の高さ
		 */ 
		drawRect:function(x, y, width, height){
			this._updateSize(x, y, width, height);

			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				var ctx = display.Image.context;
				ctx.beginPath();
				ctx.rect((x + pX) / pScaleX, (y + pY) / pScaleY, width, height);
				if(self._willBeFilled) ctx.fill();
				if(self._willBeStroked) ctx.stroke();
			});
		},
		/**
		 * 円を描画
		 * @param {Number} x 円の中心のx座標
		 * @param {Number} y 円の中心のy座標
		 * @param {Number} radius 円の半径
		 */
		drawCircle:function(x, y, radius){
			this._updateSize(x - radius, y - radius, radius * 2, radius * 2);

			var self = this;
			this._funcStack.push(function(pX, pY, pScaleX, pScaleY, pAlpha){
				var ctx = display.Image.context;
				ctx.beginPath();
				ctx.arc((x + pX) / pScaleX, (y + pY) / pScaleY, radius, 0, 360, false);
				if(self._willBeFilled) ctx.fill();
				if(self._willBeStroked) ctx.stroke();
			});
		},
		draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			pX = (pX | 0);
			pY = (pY | 0);
			pScaleX = (!isNaN(pScaleX)) ? pScaleX : 1;
			pScaleY = (!isNaN(pScaleY)) ? pScaleY : 1;
			pAlpha = (!isNaN(pAlpha)) ? pAlpha : 1;
			pRotation = (pRotation) ? pRotation : 0;
	
			var tX = pX;
			var tY = pY;
			var tScaleX = pScaleX * this._scaleX;
			var tScaleY = pScaleY * this._scaleY;
			var tAlpha = pAlpha * this._alpha;
			var tRotation = pRotation + this._rotation;
			
			var len = this._funcStack.length;
			var ctx = display.Image.context;
			
			ctx.save();
			ctx.scale(tScaleX, tScaleY);
			for(var i = 0; i < len; i++){
				var func = this._funcStack[i];
				func.call(this, tX, tY, tScaleX, tScaleY, tAlpha, tRotation);
			}
			ctx.restore();
		},
		setWidth:function(value){
			//this._scaleX = value / this._width;
			this._width = value;
			this._scaleX = this._width / this._originWidth;
			this._updateScreenRect();
		},
		getWidth:function(){
			return this._width * this._scaleX;
		},
		setHeight:function(value){
			//this._scaleY = value / this._height;
			this._height = value;
			this._scaleY = this._height / this._originHeight;
			this._updateScreenRect();
		},
		getHeight:function(){
			return this._height * this._scaleY;
		},
		setScaleX:function(value){
			//this._scaleX = value;
			this._scaleX = value;
			this._width = this._originWidth * this._scaleX;
			this._updateScreenRect();
		},
		setScaleY:function(value){
			//this._scaleY = value;
			this._scaleY = value;
			this._height = this._originHeight * this._scaleY;
			this._updateScreenRect();
		},
		_updateScreenRect:function(){
			var tX = this._x + this._minX * this._scaleX,
			    tY = this._y + this._minY * this._scaleY,
			    tWidth = this._width,
			    tHeight = this._height;
			
			this._screenRect = getRotatedRect(tX, tY, tWidth, tHeight, this._rotation);
		}
	});
	
	
	display.ImageContainer = Class.create(display.DisplayObject, 
	/** @lends arc.display.ImageContainer.prototype */
	{
		_align:display.Align.TOP_LEFT, _alignX:0, _alignY:0,
	
		/**
		 * @class dataにImageオブジェクトをとる表示オブジェクト。Alignを設定できる
		 * @constructs
		 * @augments arc.display.DisplayObject
		 * @param {Image} data 表示するImageオブジェクト
		 * @description 
		 */
		initialize:function(data){
			
		},
		/**
		 * Alignを設定
		 * @param {String} Alignの文字列
		 */
		setAlign:function(align){
			var dataWidth = (this._data.getFrameWidth()) ? this._data.getFrameWidth() : this._data.getWidth();
			switch(align){
				case display.Align.TOP :
					this._alignX = -1 * dataWidth / 2;
					this._alignY = 0;
					break;
				case display.Align.TOP_LEFT :
					this._alignX = 0;
					this._alignY = 0;
					break;
				case display.Align.TOP_RIGHT :
					this._alignX = -1 * dataWidth;
					this._alignY = 0;
					break;
				case display.Align.CENTER :
					this._alignX = -1 * dataWidth / 2;
					this._alignY = -1 * this._data.getHeight() / 2;
					break;
				case display.Align.LEFT :
					this._alignX = 0;
					this._alignY = -1 * this._data.getHeight() / 2;
					break;
				case display.Align.RIGHT :	
					this._alignX = -1 * dataWidth;
					this._alignY = -1 * this._data.getHeight() / 2;
					break;
				case display.Align.BOTTOM :
					this._alignX = -1 * dataWidth / 2;
					this._alignY = -1 * this._data.getHeight();
					break;
				case display.Align.BOTTOM_LEFT :
					this._alignX = 0;
					this._alignY = -1 * this._data.getHeight();
					break;
				case display.Align.BOTTOM_RIGHT :
					this._alignX = -1 * dataWidth;
					this._alignY = -1 * this._data.getHeight();
					break;
				default :
					throw new Error('Specify align');
					break;
			}
			this._align = align;
		},
		/**
		 * Alignを取得
		 * @returns {String} Alignの文字列
		 */
		getAlign:function(){
			return this._align;
		}
	});
	
	
	display.Sprite = Class.create(display.ImageContainer, 
	/** @lends arc.display.Sprite.prototype */
	{
		/**
		 * @class 通常の画像を扱う表示オブジェクト
		 * @constructs
		 * @augments arc.display.ImageContainer
		 * @param {Image} data 表示するImageオブジェクト
		 * @description 
		 */
		initialize:function(data){
	
		},
		draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			pX = (pX | 0);
			pY = (pY | 0);
			pScaleX = (!isNaN(pScaleX)) ? pScaleX : 1;
			pScaleY = (!isNaN(pScaleY)) ? pScaleY : 1;
			pAlpha = (!isNaN(pAlpha)) ? pAlpha : 1;
			pRotation = (pRotation) ? pRotation : 0;
	
			var rotation = this._rotation + pRotation;
			var tScaleX = this._scaleX * pScaleX;
			var tScaleY = this._scaleY * pScaleY;
			
			var ctx = display.Image.context;
			ctx.globalAlpha = this._alpha * pAlpha;
	
			this._data.drawSize(pX, pY, this._width * pScaleX, this._height * pScaleY, rotation);
	
			ctx.globalAlpha = 1;
		}
	});
	
	display.MovieClip = Class.create(display.DisplayObjectContainer,
	/** @lends arc.display.MovieClip.prototype */
	{
		_shouldLoop:false,
		_fps:0,
		_timer:null,
		_currentFrame:0,
		_isPlaying:false,
		_isShowed:false,
		_timelineArr:null,
		_totalFrame:0,
		_shouldAutoPlay:false,
	
		/**
		 * @class FlashのMovieClipを再現したオブジェクト。addChildの際にタイムライン定義のオブジェクトを指定することで、キーフレームアニメーションが実現できる。
		 * @constructs
		 * @augments arc.display.DisplayObjectContainer
		 * @param {Number} fps FPS
		 * @param {Boolean} shouldLoop ループするか否か
		 * @param {Boolean} shouldAutoPlay スクリーンに表示されたタイミングで再生を開始するか否か
		 * @description 
		 * @example var mc = new arc.display.MovieClip();
		 * mc.addChild(this._yellowImg, {
		 *	1 : {visible:true},
		 *	3 : {visible:false}
		 *});
		 *mc.addChild(this._orangeImg, {
		 *	1 : {scaleX:0.5, scaleY:0.5, transition:arc.anim.Transition.SINE_OUT},
		 *	5 : {scaleX:3, scaleY:3}
		 *});
		 */
		initialize:function(fps, shouldLoop, shouldAutoPlay){
			this._fps		= fps;
			this._shouldLoop	= (shouldLoop);
			this._timer		= new Timer();
			this._currentFrame	= 1;
			this._timelineArr	= [];
			this._totalFrame	= 0;
			this._shouldAutoPlay	= (shouldAutoPlay == undefined) ? true : (shouldAutoPlay);
		},
		draw:function($super, pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			if(!this._isShowed && this._shouldAutoPlay){
				this._isShowed = true;
				this.play();
			}
			if(this._isPlaying){
				this._update();
			}
			
			$super(pX, pY, pScaleX, pScaleY, pAlpha, pRotation);
		},
		_update:function(){
			var elapsed = this._timer.getElapsed();
			var dist = 1000 / this._fps;
			if(elapsed >= dist){
				this._step();
				elapsed = this._timer.getElapsed();
			}
	
			for(var i = 0; i < this._timelineArr.length; i++){
				var timeline = this._timelineArr[i];
				timeline.update(this._currentFrame, elapsed);
			}
		},
		_step:function(){
			var timeline, target;
			this._timer.reset();
			this._currentFrame ++;
	
			this._executeKeyFrame(this._currentFrame);
	
			if(this._currentFrame == this._totalFrame){
				if(!this._shouldLoop){
					this.stop();
					return;
				}
				this._currentFrame = 0;
			}
		},
		_executeKeyFrame:function(index){
			var timeline, target;
			for(var i = 0, len = this._timelineArr.length; i < len; i++){
				timeline = this._timelineArr[i];
				target = timeline.getTarget();
				
				if(index == timeline.getFirstFrame() && target.gotoAndPlay){
					target.gotoAndPlay(1);
				}
				timeline.executeKeyFrame(index);
			}
		},
	
		removeChild:function($super, targ){
			$super(targ);
			this._isPlaying = false;
			this._timer.stop();
			
			for(var i = 0, len = this._timelineArr.length; i < len; i++){
				var timeline = this._timelineArr[i];
				if(timeline.getTarget() === targ){
					this._timelineArr.splice(i, 1);
					break;
				}
			}
		},
	
		_setTimeline:function(targ, keyframeObj){
			timeline = new anim.Timeline(targ, keyframeObj, this._fps);
			this._timelineArr.push(timeline);
			totalFrame = timeline.getTotalFrames();
			if(this._totalFrame < totalFrame){
				this._totalFrame = totalFrame;
			}
		},
	
		addChild:function($super, targ, keyframeObj){
			var timeline, totalFrame;
			$super(targ);
			if(keyframeObj){
				this._setTimeline(targ, keyframeObj);
			}
		},
	
		addChildAt:function($super, targ, index, keyframeObj){
			var timeline, totalFrame;
			$super(targ, index);
			if(keyframeObj){
				this._setTimeline(targ, keyframeObj);
			}
	
		},
	
		/**
		 * 再生
		 * @param {Boolean} shouldLoop ループするか否か
		 */
		play:function(){
			this._isPlaying = true;
			this._timer.start();
			this._executeKeyFrame(this._currentFrame);
		},
		/**
		 * 停止
		 */
		stop:function(){
			this._isPlaying = false;
			this._timer.stop();
		},
		/**
		 * 指定のフレームから再生
		 * @param {int} index 再生を開始するフレーム
		 */
		gotoAndPlay:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.play();
		},
		/**
		 * 指定のフレームで停止
		 * @param {int} index　停止するフレーム
		 */
		gotoAndStop:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.stop();
		}
	});

	display.JSONMovieClip = Class.create(display.MovieClip,
	/** @lends arc.display.JSONMovieClip.prototype */
	{
		/**
		 * @class JSONデータからMovieClipを作成するクラス
		 * @constructs
		 * @augments arc.display.MovieClip
		 * @param {Object} obj JSONオブジェクト
		 * @description 
		 */
		initialize:function($super, obj){
			var Sprite = arc.display.Sprite,
			    System = arc.System,
			    MovieClip = arc.display.MovieClip;

			var lib = obj.lib,
			    fps = obj.fps,
			    mainInfo = getInfo(obj.main);

			$super(fps);

			function getDisplayObject(id, disp){
				var i, info, img, len, timeline, child, disp;
				
				info = getInfo(id);
				if(!info){
					throw new Error("invalid animation");
				}
				
				if(info.type == "data"){
					if(info.pos){
						return new Sprite(arc._system.getImage(info.data, info.pos));
					}else{
						return new Sprite(arc._system.getImage(info.data));
					}
				}

				if(!disp){
					disp = new MovieClip(fps, info.loop);
				}
				for(i = 0, len = info.timelines.length; i < len; i++){
					timeline = info.timelines[i];
					child = getDisplayObject(timeline.target);
					if((child.constructor === Sprite) && timeline.align){
						child.setAlign(timeline.align);
					}
					disp.addChildAt(child, 0, timeline.keyframes);
				}
				return disp;
			}
			function getInfo(id){
				var i, len, info;
				for(i = 0, len = lib.length; i < len; i++){
					info = lib[i];
					if(info.id == id){
						break;
					}
				}
				return info;
			}
			
			this._shouldLoop = (mainInfo.loop);
			getDisplayObject(obj.main, this);
		}
	});	
	
	display.SheetMovieClip = Class.create(display.ImageContainer, 
	/** @lends arc.display.SheetMovieClip.prototype */
	{
		_currentFrame:1, _totalFrame:1, _frameWidth:0, _frameTime:0, _isPlaying:false, _timer:null, _shouldLoop:false, _shouldHide:false,
	
		/**
		 * @class 連続PNGを扱う表示オブジェクト
		 * @constructs
		 * @augments arc.display.ImageContainer
		 * @param {Image} data 表示するImageオブジェクト
		 * @param {Number} frameWidth １フレームのwidth
		 * @param {Number} fps 何fpsでアニメーションするか
		 * @param {Boolean} shouldLoop ループするか否か
		 * @param {Boolean} shouldHide 再生していない間は表示を消すか否か
		 * @description 
		 */
		initialize:function(data, frameWidth, fps, shouldLoop, shouldHide){
			this._timer = new Timer();
			this._frameWidth = frameWidth;
			this._totalFrame = Math.floor(this._data.getWidth() / frameWidth);
			this._width = frameWidth;
			this._frameTime = 1000 / fps;
			this._shouldLoop = shouldLoop;
			this._shouldHide = shouldHide;
	
			this._data.setFrameWidth(this._frameWidth);
	
			if(this._shouldHide) this._visible = false;
	
			this.stop();
		},
		/**
		 * 再生
		 * @param {Boolean} shouldLoop ループするか否か
		 */
		play:function(shouldLoop){
			this._isPlaying = true;
			if(shouldLoop != undefined) this._shouldLoop = shouldLoop;
			if(this._shouldHide && !this._visible) this._visible = true;
			this._timer.start();
		},
		/**
		 * 停止
		 */
		stop:function(){
			this._isPlaying = false;
			this._timer.stop();
			if(this._shouldHide) this._visible = false;
		},
		/**
		 * 指定のフレームから再生
		 * @param {int} index 再生を開始するフレーム
		 */
		gotoAndPlay:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.play();
		},
		/**
		 * 指定のフレームで停止
		 * @param {int} index　停止するフレーム
		 */
		gotoAndStop:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.stop();
		},
		draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			pX = (pX | 0);
			pY = (pY | 0);
			pScaleX = (!isNaN(pScaleX)) ? pScaleX : 1;
			pScaleY = (!isNaN(pScaleY)) ? pScaleY : 1;
			pAlpha = (!isNaN(pAlpha)) ? pAlpha : 1;
			pRotation = (pRotation) ? pRotation : 0;
				
			if(!this._visible) return;
			if(this._isPlaying){
				var elapsed = this._timer.getElapsed();
				if(elapsed >= this._frameTime){
					this._currentFrame++;
					this._timer.reset();
					if(this._currentFrame > this._totalFrame){
						if(this._shouldLoop) this._currentFrame = this._currentFrame % this._totalFrame;
						else{
							this._currentFrame = this._totalFrame;
							this.stop();
							this.dispatchEvent(Event.COMPLETE);
						}
					}
				}
			}
	
			var posX = (this._x + this._alignX * this._scaleX) * pScaleX + pX;
			var posY = (this._y + this._alignY * this._scaleY) * pScaleY + pY;
			var tScaleX = this._scaleX * pScaleX;
			var tScaleY = this._scaleY * pScaleY;
			var tRotation = this._rotation + pRotation;
			var ctx = display.Image.context;
	
			ctx.globalAlpha = this._alpha;
			this._data.drawCrop((this._currentFrame - 1) * this._frameWidth, 0, this._frameWidth, this._data.getHeight(), pX, pY, this._width * pScaleX, this._height * pScaleY, tRotation);
			ctx.globalAlpha = 1;
		},
		setWidth:function(value){
			this._width = value;
			this._scaleX = this._width / this._frameWidth;
		},
		setScaleX:function(value){
			this._scaleX = value;
			this._width = this._frameWidth * this._scaleX;
		}
	});
	
	
	display.SequenceMovieClip = Class.create(display.DisplayObjectContainer,
	/** @lends arc.display.SequenceMovieClip.prototype */
	{
		_spriteArr:null,
		_frameTime:0,
		_shouldLoop:false,
		_shouldHide:false,
		_isPlaying:false,
		_totalFrame:0,
		_currentIndex:0,
		_timer:null,
	
		/**
		 * @class 複数イメージをアニメーションする表示オブジェクト
		 * @constructs
		 * @augments arc.display.DisplayObjectContainer
		 * @param {Array} imgArr アニメーションするImageオブジェクトの配列
		 * @param {Number} frameTime １フレームのミリ秒
		 * @param {Boolean} shouldLoop ループするか否か
		 * @param {shouldHide} shouldHide 再生していない間は表示を消すか否か
		 * @description 
		 */
		initialize:function(imgArr, frameTime, shouldLoop, shouldHide){
			var i = 0, len = imgArr.length, sprite;
			
			this._spriteArr = [];
			this._frameTime = frameTime;
			this._shouldLoop = shouldLoop;
			this._shouldHide = shouldHide;
			this._totalFrame = imgArr.length;
			this._timer = new Timer();
	
			for(i = 0; i < len; i++){
				sprite = new display.Sprite(imgArr[i]);
				sprite.setVisible(false);
				this._spriteArr.push(sprite);
				this.addChild(sprite);
			}
	
			if(shouldHide){
				this._visible = false;
			}
		},
		draw:function($super, pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			$super(pX, pY, pScaleX, pScaleY, pAlpha, pRotation);
	
			var i, len = this._spriteArr.length, sprite;
			
			if(this._isPlaying){
				var index = Math.floor(this._timer.getElapsed() / this._frameTime);
				if(index > this._totalFrame - 1){
					if(this._shouldLoop) index = index % this._totalFrame;
					else{
						index = this._totalFrame;
						this.stop();
						this.dispatchEvent(Event.COMPLETE);
					}
				}
				this._currentFrame = index;
			}
	
			for(i = 0; i < len; i++){
				sprite = this._spriteArr[i];
				if(i == this._currentFrame){
					sprite.setVisible(true);
				}else{
					sprite.setVisible(false);
				}
			}
		},
		/**
		 * 再生
		 * @param {Boolean} shouldLoop ループするか否か
		 */
		play:function(shouldLoop){
			this._isPlaying = true;
			if(shouldLoop) this._shouldLoop = shouldLoop;
			if(this._shouldHide && !this._visible) this._visible = true;
			this._timer.start();
		},
		/**
		 * 停止
		 */
		stop:function(){
			this._isPlaying = false;
			this._timer.stop();
			if(this._shouldHide) this._visible = false;
		},
		/**
		 * 指定のフレームから再生
		 * @param {int} index 再生を開始するフレーム
		 */
		gotoAndPlay:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.play();
		},
		/**
		 * 指定のフレームで停止
		 * @param {int} index　停止するフレーム
		 */
		gotoAndStop:function(index){
			if(index < 1 || index > this._totalFrame) throw new Error("Invalid frame index");
			this._currentFrame = index;
			this.stop();
		}
	});
	
	
	display.TextField = Class.create(display.DisplayObject,
	/** @lends arc.display.TextField.prototype */	
	{
		_font:null, _family:'sans-serif', _textArr:null, _color:0x000000, _align:'left', _baseline:'top', _size:10,
	
		/**
		 * @class テキストを扱う表示オブジェクト
		 * @constructs
		 * @augments arc.display.DisplayObject
		 * @description 
		 */
		initialize:function(){
			if(ua.isiOS3){
				throw new Error("Your can't use TextField in iOS3");
			}
			this._font = this._size + 'px ' + this._family;
			this._textArr = [];
		},
	
		draw:function(pX, pY, pScaleX, pScaleY, pAlpha, pRotation){
			pX = (pX | 0);
			pY = (pY | 0);
			pScaleX = (!isNaN(pScaleX)) ? pScaleX : 1;
			pScaleY = (!isNaN(pScaleY)) ? pScaleY : 1;
			pAlpha = (!isNaN(pAlpha)) ? pAlpha : 1;
			pRotation = (pRotation) ? pRotation : 0;
	
			var rotation = this._rotation + pRotation;
			var tScaleX = this._scaleX * pScaleX;
			var tScaleY = this._scaleY * pScaleY;
	
			var ctx = display.Image.context;
			ctx.globalAlpha = this._alpha * pAlpha;
	
			ctx.save();
			ctx.fillStyle = getColorStyle(this._color);
			ctx.textBaseline = 'top';
			ctx.font = this._font;
			ctx.textAlign = this._align;
			ctx.textBaseline = this._baseline;
			var posY = pY;
			for(var i = 0, len = this._textArr.length; i < len; i++){
				var text = this._textArr[i];
				ctx.fillText(text, pX, posY);
				posY += this._size;
			}
			ctx.restore();
	
			ctx.globalAlpha = 1;
		},
	
		/**
		 * Alignを設定
		 * @param {String} Alignの文字列
		 */
		setAlign:function(align){
			switch(align){
				case display.Align.TOP :
					this._align = 'center';
					this._baseline = 'top';
					break;
				case display.Align.TOP_LEFT :
					this._align = 'left';
					this._baseline = 'top';
					break;
				case display.Align.TOP_RIGHT :
					this._align = 'right';
					this._baseline = 'top';
					break;
				case display.Align.CENTER :
					this._align = 'center';
					this._baseline = 'middle';
					break;
				case display.Align.LEFT :
					this._align = 'left';
					this._baseline = 'middle';
					break;
				case display.Align.RIGHT :
					this._align = 'right';	
					this._baseline = 'middle';
					break;
				case display.Align.BOTTOM :
					this._align = 'center';
					this._baseline = 'bottom';
					break;
				case display.Align.BOTTOM_LEFT :
					this._align = 'left';
					this._baseline = 'bottom';
					break;
				case display.Align.BOTTOM_RIGHT :
					this._align = 'right';
					this._baseline = 'bottom';
					break;
				default :
					throw new Error('Specify align');
					break;
			}
		},
		/**
		 * テキストをセット
		 * @param {String} text 表示するテキスト
		 */	
		setText:function(text){
			if(!(text instanceof String)){
				text = String(text);
			}
			this._textArr = text.split('\n');

			if(this._width){
				this._adjustWidth();
			}
		},
		_adjustWidth:function(){
			var ctx = display.Image.context;
			ctx.font = this._font;

			for(var i = 0; i < this._textArr.length; i++){
				var text = this._textArr[i];
				var metrics = ctx.measureText(text);
				if(metrics.width <= this._width){
					continue;
				}
				for(var j = 0, len = text.length; j < len; j++){
					var word = text.substr(0, j + 1);
					metrics = ctx.measureText(word);
					if(metrics.width > this._width){
						this._textArr[i] = text.substr(0, j);
						this._textArr.splice(i + 1, 0, text.substr(j));
						break;
					}
				}
			}
		},
		/**
		 * フォントをセット
		 * @param {String} family フォントファミリー
		 * @param {Number} size フォントサイズ
		 * @param {Boolean} isBold ボールドするか
		 */
		setFont:function(family, size, isBold){
			this._family = family;
			this._size = size;
			
			this._font = size + 'px ' + family;
			if(isBold){
				this._font = 'bold ' + this._font;
			}

			if(this._textArr.length && this._width){
				this._adjustWidth();
			}
		},
	
		/**
		 * 文字色をセット
		 * @param {int} color 16進数で指定された色
		 */
		setColor:function(color){
			this._color = color;
		}
	});
	
	
	/**
	 * @name arc.anim
	 * @namespace
	 */
	var anim = {};
	anim.Animation = Class.create(EventDispatcher, 
	/** @lends arc.anim.Animation.prototype */
	{
		_timer:null, _target:null, _system:null, _animObjArr:null, _shouldReplay:false, _isPlaying:false,
		_currentIndex:0, _currentAnim:null, _currentTransFunc:null, _firstParams:null, _currentDuration:null,
		_updateFunc:null,
		_HALF_PI:Math.PI / 2,
	
		/**
		 * @class ASのTweenerライクに、指定したtargetに対して指定された複数のオブジェクトのプロパティの値に対してアニメーションを行う
		 * @constructs
		 * @augments arc.EventDispatcher
		 * @param {Object} target 変化させるtarget。変化させるプロパティのgetter/setterが実装されている必要がある。getterはgetProp1、setterはsetProp1といったような形式
		 * @param {Object} params 変化させるパラメーター。複数指定した場合順番に実行する
		 * @description 
		 * @example
		 * //0.5秒かけてxを10、yを10にSINE_OUTの関数を使って変化させたのち、1秒かけてxを20、yを30に変化させる。
		 * var anim = new arc.anim.Animation(target, 
		 * 					{x:10, y:10, time:500, transition:arc.anim.Transition.SINE_OUT},
		 *					{x:20, y:30, time:1000, transition:arc.anim.Transition.SINE_OUT});
		 */
		initialize:function(target){
			if(!target) throw new Error('Specify target');
			if(arguments.length < 2) throw new Error('Specify Animaiton Objects');
	
			this._target = target;
			this._timer = new Timer();
			this._animObjArr = new Array();
			for(var i = 1; i < arguments.length; i++){
				this._animObjArr.push(arguments[i]);
			}
		},
		/**
		 * 再生
		 * @param {Boolean} shouldReplay ループするか否か
		 */
		play:function(shouldReplay){
			if(this._isPlaying) return;
	
			var system = anim.Animation.system;
			this._isPlaying = true;
			this._shouldReplay = (shouldReplay);
	
			this._timer.start();
			this._currentIndex = -1;
			if(this._changeAnim()){
				if(this._updateFunc) system.removeEventListener(Event.ENTER_FRAME, this._updateFunc);
				this._updateFunc = bind(this._update, this);
				system.addEventListener(Event.ENTER_FRAME, this._updateFunc);
			}
		},
		/**
		 * 停止
		 */
		stop:function(){
			if(!this._isPlaying) return;
	
			var system = anim.Animation.system;
			this._isPlaying = false;
			if(this._updateFunc){
				system.removeEventListener(Event.ENTER_FRAME, this._updateFunc);
				this._updateFunc = null;
			}
			this.dispatchEvent(Event.COMPLETE);
		},
		_changeAnim:function(){
			this._currentIndex++;
			if(this._currentIndex >= this._animObjArr.length){
				if(!this._shouldReplay){
					this.stop();
					return false;
				}else{
					this._currentIndex = 0;
				}
			}
			
			this._timer.reset();
			var animObj = this._animObjArr[this._currentIndex];
			this._currentAnim = {}; this._firstParams = {};
			for(var prop in animObj){
				if(prop == 'time' || prop == 'transition') continue;
				this._currentAnim[prop] = animObj[prop];
				this._firstParams[prop] = this._getProperty(this._target, prop);
			}
			
			this._currentDuration = (animObj.time == undefined) ? 1000 : animObj.time;
			this._currentTransFunc = anim.Transition.getTransFunc(animObj.transition);
	
			return true;
		},
		_getProperty:function(target, prop){
			prop.match(/^([a-z])(.*)/);
			var funcName = 'get' + RegExp.$1.toUpperCase() + RegExp.$2;
			if(target[funcName])	return target[funcName]();
			return undefined;
		},
		_setProperty:function(target, prop, value){
			prop.match(/^([a-z])(.*)/);
			var funcName = 'set' + RegExp.$1.toUpperCase() + RegExp.$2;
			if(target[funcName]) target[funcName](value);
		},
		_update:function(){
			var elapsed = this._timer.getElapsed();
			var progress = this._currentTransFunc(elapsed / this._currentDuration);
			if(elapsed >= this._currentDuration){
				for(var prop in this._currentAnim){
					this._setProperty(this._target, prop, this._currentAnim[prop]);
				}	
				if(this._changeAnim()) this._update();
				return;
			}
			
			for(var prop in this._currentAnim){
				var value = (this._currentAnim[prop] - this._firstParams[prop]) * progress + this._firstParams[prop];
				if(prop == 'visible') value = this._firstParams[prop];
				this._setProperty(this._target, prop, value);
			}		
		},
		/**
		 * 再生中かどうか
		 * @returns {Boolean} 再生中かどうか
		 */ 
		isPlaying:function(){
			return this._isPlaying;
		}
	});
	anim.Animation.system = null;
	
	
	(function(packageName){
		/**
		 * @name arc.anim.Transition
		 * @namespace
		 */
		var Transition = {
			/**
			 * @name SINE_IN
			 * @constant {String} SINE_IN
			 * @memberof arc.anim.Transition
			 */
			SINE_IN		: 'SINE_IN',
			/**
			 * @name SINE_OUT
			 * @constant {String} SINE_OUT
			 * @memberof arc.anim.Transition
			 */
			SINE_OUT	: 'SINE_OUT',
			/**
			 * @name SINE_INOUT
			 * @constant {String} SINE_INOUT
			 * @memberof arc.anim.Transition
			 */
			SINE_INOUT	: 'SINE_INOUT',
			/**
			 * @name LINEAR
			 * @constant {String} LINEAR
			 * @memberof arc.anim.Transition
			 */
			LINEAR		: 'LINEAR',
			/**
			 * @name CIRC_IN
			 * @constant {String} CIRC_IN
			 * @memberof arc.anim.Transition
			 */
			CIRC_IN		: 'CIRC_IN',
			/**
			 * @name CIRC_OUT
			 * @constant {String} CIRC_OUT
			 * @memberof arc.anim.Transition
			 */
			CIRC_OUT	: 'CIRC_OUT',
			/**
			 * @name CIRC_INOUT
			 * @constant {String} CIRC_INOUT
			 * @memberof arc.anim.Transition
			 */
			CIRC_INOUT	: 'CIRC_INOUT',
			/**
			 * @name CUBIC_IN
			 * @constant {String} CUBIC_IN
			 * @memberof arc.anim.Transition
			 */
			CUBIC_IN	: 'CUBIC_IN',
			/**
			 * @name CUBIC_OUT
			 * @constant {String} CUBIC_OUT
			 * @memberof arc.anim.Transition
			 */
			CUBIC_OUT	: 'CUBIC_OUT',
			/**
			 * @name CUBIC_INOUT
			 * @constant {String} CUBIC_INOUT
			 * @memberof arc.anim.Transition
			 */
			CUBIC_INOUT	: 'CIRC_INOUT',
			/**
			 * @name ELASTIC_IN
			 * @constant {String} ELASTIC_IN
			 * @memberof arc.anim.Transition
			 */
			ELASTIC_IN	: 'ELASTIC_IN',
			/**
			 * @name ELASTIC_OUT
			 * @constant {String} ELASTIC_OUT
			 * @memberof arc.anim.Transition
			 */
			ELASTIC_OUT	: 'ELASTIC_OUT',
			/**
			 * @name ELASTIC_INOUT
			 * @constant {String} ELASTIC_INOUT
			 * @memberof arc.anim.Transition
			 */
			ELASTIC_INOUT	: 'ELASTIC_INOUT',
			getTransFunc	: getTransFunc
		};
	
		var HALF_PI = Math.PI / 2;
		/**
		 * Transitionタイプを指定して対応するTransition関数を取得する
		 * @memberof arc.anim.Transition
		 * @param {String} type Transitionタイプ
		 * @returns {Function} 指定したTransitionタイプに対応する関数
		 */
		function getTransFunc(type){
			switch(type){
				case Transition.LINEAR :
					return getLinear;
				case Transition.SINE_IN :
					return getSineIn;
				case Transition.SINE_OUT :
					return getSineOut;
				case Transition.SINE_INOUT:
					return getSinInOut;
				case Transition.CIRC_IN:
					return getCircIn;
				case Transition.CIRC_OUT:
					return getCircOut;
				case Transition.CIRC_INOUT:
					return getCircInOut;
				case Transition.CUBIC_IN:
					return getCubicIn;
				case Transition.CUBIC_OUT:
					return getCubicOut;
				case Transition.CUBIC_INOUT:
					return getCubicInOut;
				case Transition.ELASTIC_IN:
					return getElasticIn;
				case Transition.ELASTIC_OUT:
					return getElasticOut;
				case Transition.ELASTIC_INOUT:
					return getElasticInOut;
				default :
					return getLinear;
			}
		}
	
		function getLinear(t){
			return t;
		}
	
		/** Sine **/
		function getSineIn(t){
			return 1.0 - Math.cos(t * HALF_PI);	
		}
	
		function getSineOut(t){
			return 1.0 - getSineIn(1.0 - t);
		}
		function getSineInOut(t){
			return (t < 0.5) ? getSineIn(t * 2.0) * 0.5 : 1 - getSineIn(2.0 - t * 2.0) * 0.5;
		}
	
		/** Circ **/
		function getCircIn(t){
			return 1.0 - Math.sqrt(1.0 - t * t);
		}
		function getCircOut(t){
			return 1.0 - getCircIn(1.0 - t);
		}
		function getCircInOut(t){
			return (t < 0.5) ? getCircIn(t * 2.0) * 0.5 : 1 - getCircIn(2.0 - t * 2.0) * 0.5;
		}
	
		/** Cubic **/
		function getCubicIn(t){
			return t * t * t;
		}
		function getCubicOut(t){
			return 1.0 - getCubicIn(1.0 - t);
		}
		function getCubicInOut(t){
			return (t < 0.5) ? getCubicIn(t * 2.0) * 0.5 : 1 - getCubicIn(2.0 - t * 2.0) * 0.5;
		}
	
		/** Elastic **/
		function getElasticIn(t){
			return 1.0 - getElasticOut(1.0 - t);
		}
		function getElasticOut(t){
			var s = 1 - t;
			return 1 - Math.pow(s, 8) + Math.sin(t * t * 6 * Math.PI) * s * s;
		}
		function getElasticInOut(t){
			return (t < 0.5) ? getElasticIn(t * 2.0) * 0.5 : 1 - getElasticIn(2.0 - t * 2.0) * 0.5;
		}
		
		packageName.Transition = Transition;
	})(anim);
	
	
	anim.Timeline = Class.create(
	/** @lends arc.anim.Timeline.prototype */
	{
		_target:null, _keyFrameObj:null, _totalFrame:0, _fps:0, _baseFrame:null, _firstFrame:0,
	
		/**
		 * @class Flashのタイムラインを再現するクラス。KeyFrameAnimationで使われる
		 * @constructs
		 * @param {Object} target 変化させるtarget。変化させるプロパティのgetter/setterが実装されている必要がある。getterはgetProp1、setterはsetProp1といったような形式
		 * @param {Object} keyFrameObj 各フレームにおけるプロパティの値を定義したObject
		 * @description 
		 */
		initialize:function(target, keyFrameObj, fps){
			var frameNum;
			this._target = target;
			this._keyFrameObj = keyFrameObj;
			
			if(fps){
				this._fps = fps;
			}
			
			for(var prop in this._keyFrameObj){
				var keyFrame = keyFrameObj[prop];
				var index = parseInt(prop, 10);
				if(this._firstFrame == 0 || this._firstFrame > index){
					this._firstFrame = index;
				}
				
				keyFrame.index = prop;
				frameNum = parseInt(prop, 10);
				if(this._totalFrame < frameNum){
					this._totalFrame = frameNum;
				}
			}
		},
		/**
		 * KeyFrameAnimationがENTER_FRAME毎に叩く。経過時間に応じてプロパティの値を適切に変化させる
		 * @param {int} index フレームインデックス
		 * @param {Number} elapsed 経過時間
		 */ 
		update:function(index, elapsed){
			if(!this._baseFrame || !this._baseFrame.transition || !this._baseFrame.nextFrame) return;
	
			elapsed += (index - this._baseFrame.index) * 1000 / this._fps;
			var duration = (this._baseFrame.nextFrame.index - this._baseFrame.index) * 1000 / this._fps;
			var progress = anim.Transition.getTransFunc(this._baseFrame.transition)(elapsed / duration);
	
			for(var prop in this._baseFrame){
				if(prop == 'transition' || prop == 'action' || prop == 'index' || prop == 'nextFrame' || this._baseFrame.nextFrame[prop] == undefined) continue;
	
				var value = (this._baseFrame.nextFrame[prop] - this._baseFrame[prop]) * progress + this._baseFrame[prop];
				if(prop == 'visible') value = this._baseFrame[prop];
				this._setProperty(this._target, prop, value);
			}
		},
		/**
		 * 指定したフレームのにおけるプロパティの値をセット
		 * @param {int} index フレームインデックス
		 */ 	
		executeKeyFrame:function(index){
			var keyframe = this._keyFrameObj[index];
			if(!keyframe) return;
	
			this._baseFrame = keyframe;
	
			for(var prop in keyframe){
				if(prop == 'transition' || prop == 'action' || prop == 'index' || prop == 'nextFrame') continue;
				this._setProperty(this._target, prop, keyframe[prop]);
			}
	
			if(keyframe.action && keyframe.action instanceof Function) keyframe.action.apply(this._target);
	
			if(keyframe.transition && !keyframe.nextFrame){
				var indexCount = index;
				while(indexCount <= this._totalFrame){
					indexCount++;
					if(this._keyFrameObj[indexCount]){
						var nextFrame = this._keyFrameObj[indexCount];
						for(var prop in nextFrame){
							if(!keyframe[prop]) keyframe[prop] = this._getProperty(this._target, prop);
						}
						keyframe.nextFrame = nextFrame
						break;
					}
				}
			}
		},
		/**
		 * 総フレーム数をセット
		 * @param {int} totalFrames 総フレーム数
		 */ 
		setTotalFrames:function(value){
			this._totalFrame = value;
		},
		/**
		 * 総フレーム数を取得
		 * return {Number} 総フレーム数
		 */
		getTotalFrames:function(value){
			return this._totalFrame;
		},
		/**
		 * fpsをセット
		 * @param {Number} fps fps
		 */ 
		setFps:function(value){
			this._fps = value;
		},
		getTarget:function(){
			return this._target;
		},
		getFirstFrame:function(){
			return this._firstFrame;
		},
		_getProperty:function(target, prop){
			prop.match(/^([a-z])(.*)/);
			var funcName = 'get' + RegExp.$1.toUpperCase() + RegExp.$2;
			if(target[funcName])	return target[funcName]();
			return undefined;
		},
		_setProperty:function(target, prop, value){
			prop.match(/^([a-z])(.*)/);
			var funcName = 'set' + RegExp.$1.toUpperCase() + RegExp.$2;
			if(target[funcName]) target[funcName](value);
		}
	});
	
	anim.KeyFrameAnimation = Class.create(EventDispatcher,
	/** @lends arc.anim.KeyFrameAnimation.prototype */
	{
		_fps:0, _totalFrame:0, _timelineArr:null, _timer:null, _updateFunc:null, _shouldLoop:false, _currentFrame:1,
	
		/**
	  	 * @class Flashのタイムラインアニメーションを再現するクラス
		 * @constructs
		 * @param {Number} fps fps
		 * @param {int} totalFrame 総フレーム数
		 * @param {Array} timeLineArr Timelineオブジェクトの配列
		 * @description 
		 * @example var keyFrame = new arc.anim.KeyFrameAnimation(12, 5, [
				new arc.anim.Timeline(this._yellowImg, {
					1 : {visible:true},
					3 : {visible:false}
				}),
				new arc.anim.Timeline(this._orangeImg, {
					1 : {visible:true},
					5 : {visible:false}
				}),
				new arc.anim.Timeline(this, {
					1 : {scaleX:0.5, scaleY:0.5, transition:arc.anim.Transition.SINE_OUT},
					5 : {scaleX:3, scaleY:3}
				})
			]);
		 */
		initialize:function(fps, totalFrame, timelineArr){
			this._fps = fps;
			this._totalFrame = totalFrame;
			this._timer = new Timer();
	
			for(var i = 0; i < timelineArr.length; i++){
				var timeline = timelineArr[i];
				if(timeline.constructor != anim.Timeline){
					throw new Error('set an instance of anim.Timeline');
				}
				timeline.setTotalFrames(totalFrame);
				timeline.setFps(this._fps);
			}
			this._timelineArr = (timelineArr) ? timelineArr : [];
		},
		/**
		 * Timelineオブジェクトを追加
		 * @param {Timeline} timeline 追加するタイムラインオブジェクト
		 */
		addTimeline:function(timeline){
			this._timelineArr.push(timeline);
		},
		/**
		 * 再生開始
		 * @param {Boolean} shouldLoop ループするか否か
		 */
		play:function(shouldLoop){
			this.gotoAndPlay(1, shouldLoop);
		},
		/**
		 * 停止
		 */
		stop:function(){
			var system = anim.Animation.system;
			if(this._updateFunc){
				system.removeEventListener(Event.ENTER_FRAME, this._updateFunc);
				this._updateFunc = null;
			}
			this.dispatchEvent(Event.COMPLETE);
		},
		/**
		 * 指定フレームから再生を開始
		 * @param {int} frame 再生開始フレーム
		 * @param {Boolean} shouldLoop ループするか否か
		 */
		gotoAndPlay:function(frame, shouldLoop){
			if(frame > this._totalFrame) throw new Error("invalid frame index");
	
			if(shouldLoop) this._shouldLoop = shouldLoop;
			this._updateFunc = bind(this._update, this);
	
			this._currentFrame = frame;
			this._executeKeyFrame(this._currentFrame);
	
			this._timer.start();
			var system = anim.Animation.system;
			system.addEventListener(Event.ENTER_FRAME, this._updateFunc);
	
		},
		_update:function(){
			var elapsed = this._timer.getElapsed();
			var dist = 1000 / this._fps;
			if(elapsed >= dist){
				this._step();
				elapsed = this._timer.getElapsed();
			}
	
			for(var i = 0; i < this._timelineArr.length; i++){
				var timeline = this._timelineArr[i];
	
				timeline.update(this._currentFrame, elapsed);
			}	
		},
		_step:function(){
			this._timer.reset();
			this._currentFrame ++;
	
			this._executeKeyFrame(this._currentFrame);
	
			if(this._currentFrame == this._totalFrame){
				if(!this._shouldLoop){
					this.stop();
					return;
				}
				this._currentFrame = 0;
			}
		},
		_executeKeyFrame:function(index){
			for(var i = 0; i < this._timelineArr.length; i++){
				var timeline = this._timelineArr[i];
				timeline.executeKeyFrame(index);
			}
		},
		/**
		 * 現在再生しているフレームを取得
		 * @returns {int} 現在再生しているフレーム
		 */
		getCurrentFrame:function(){
			return this._currentFrame;
		},
		/**
		 * 総フレーム数を取得
		 * @returns {int} 総フレーム数
		 */
		getTotalFrame:function(){
			return this._totalFrame;
		}
	});
		
	

	/**
	 * @name arc.ImageManager
	 * @class 画像の読み込みを管理する
	 */
	var ImageManager = Class.create(EventDispatcher, 
	(function(){
		var _TYPE_IMAGE = 0,
		    _TYPE_STRING = 1;
		
		function initialize(){
			this._loadImgNum = 0;
			this._loadedImgNum = 0;
			this._imageHash = {};
			this._loadingImgArr = [];
			this._srcArr = [];
		}
		/**
		 * 画像の一括読み込みを開始する
		 * @memberOf arc.ImageManager.prototype
		 * @param {Array} srcArr パスが格納された配列
		 */
		function load(srcArr){
			this._srcArr = srcArr;
			this._loadedImgNum = 0;
			this._loadImgNum = srcArr.length;
			this._loadingImgArr = [];
	
			if(len === 0){
				this.dispatchEvent(Event.COMPLETE);
				return;
			}
	
			for(var i = 0, len = this._srcArr.length; i < len; i++){
				var src = this._srcArr[i];
				var img;
				if(src.constructor == HTMLImageElement){
					img = src;
					if(img.complete){
						_loadingImages.call(this, {target:img});
					}else{
						src.onload = bind(_loadingImages, this);
						src.onerror = bind(_errorImages, this);
					}
				}else if(src.constructor == String){
					img = document.createElement('img');
					img.src = src;
					img.onload = bind(_loadingImages, this);
					img.onerror = bind(_errorImages, this);
					this._imageHash[src] = img;
				}
	
				this._loadingImgArr.push(img);
			}
	
			this._srcArr = [];
		}
	
		function _loadingImages(e){
			var percent;
			e.target.onload = null;
			e.target.onerror = null;
			
			this._loadedImgNum++;
	
			this.dispatchEvent(Event.PROGRESS);
			
			if(this._loadedImgNum == this._loadImgNum){
				this.dispatchEvent(Event.COMPLETE);
			}
		}
			
		function _errorImages(e){
			var i, len, img;
			for(i = 0, len = this._loadingImgArr.length; i < len; i++){
				img = this._loadingImgArr[i];
				img.onload = null;
				img.onerror = null;
			}
	
			this.dispatchEvent(Event.ERROR);
			
			throw new Error("Load Error : " + e.target.src);
		}
	
		function _timeOutImage(){
			
		}
		/**
		 * 読み込まれた画像を取得します。
		 * @memberOf arc.ImageManager.prototype
		 * @param {String} path 画像パス
		 * @param {Array} localPosArr 画像のローカル座標とサイズを[x, y, width, height]の配列で指定します。スプライトシートから一部の画像を使いたい時等に利用します。（オプション）
		 * @returns {arc.Image} 読み込まれたImageオブジェクト
		 * @example
		 * var img = system.getImage('a.png', [10, 10, 100, 100]);
		 */
		function getImage(path, localPosArr){
			if(!this._imageHash[path]){
				return null;
			}

			if(localPosArr && localPosArr.length == 4){
				return new display.Image(this._imageHash[path], localPosArr);
			}else{
				return new display.Image(this._imageHash[path]);
			}
		}

		/**
		 * 読み込む画像数を取得
		 * @memberOf arc.ImageManager.prototype
		 * @returns {Number} 読み込む画像数
		 */
		function getTotal(){
			return this._loadImgNum;
		}

		/**
		 * 読み込みが終了した画像数
		 * @memberOf arc.ImageManager.prototype
		 * @returns {Number} 読み込みが終了した画像数
		 */
		function getLoaded(){
			return this._loadedImgNum;
		}
	
		return {
			initialize	: initialize,
			load		: load,
			getImage	: getImage,
			getTotal	: getTotal,
			getLoaded	: getLoaded
		};
	})());

	
	var System = Class.create(EventDispatcher, 
	/** @lends arc.System.prototype */
	{
		_fps:60, _originFps:0, _width:0, _height:0, _canvas:null, _context:null, _disableClearRect:false,
		_game:null, _gameClass:null, _gameParams:null, _intervalId:null,
		_stage:null, _imageManager:null,
		_realFps:0, _runTime:0, _runCount:0, _prevTime:0, _fpsElem:null,
		_maxFps:0, _adjustCount:1, _timer:null,
        _canvasScale: 1,
	
		_ADJUST_FPS_TIME:10000, _ADJUST_FACTOR:2.5,
		
		/**
		 * @class ゲームを制御するメインクラス
		 * @constructs
		 * @param {Number} width ゲームの横幅
		 * @param {Number} height ゲームの高さ
		 * @param {String} canvasId htmlで指定されてcanvas要素のid
		 * @param {Boolean} disableClearRect clearRectを無効にするかどうか。背景がある場合は無効にしたほうがパフォーマンスがあがる。
		 * @description 
		 */	
		initialize:function(width, height, canvasId, disableClearRect){
			this._width = width;
			this._height = height;
			this._canvas = document.getElementById(canvasId);
			this._context = this._canvas.getContext('2d');
			this._stage = new display.DisplayObjectContainer();
			this._timer = new Timer();
			this._disableClearRect = (disableClearRect) ? true : false;
	
			this._canvas.width = this._width;
			this._canvas.height = this._height;
			
			anim.Animation.system = this;
			CountTimer.system = this;
			display.Image.context = this._context;
			arc._system = this;
	
			this._fpsElem = document.getElementById('fps');

			this._setEvent();
			this._setScroll();
		},
		/**
		 * 指定したフルスクリーンモードにする。デバイスを回転させた時にも適用される。
		 * @param {String} mode フルスクリーンモード
		 * @param {Boolean} shouldShrink 縮小を許可するか
		 * @example
		 * system.setFullScreen("width");		//アスペクト比は保ったまま、コンテンツの横幅を画面の横幅に合わせる
		 * system.setFullScreen("height");		//アスペクト比は保ったまま、コンテンツの縦幅を画面の縦幅に合わせる
		 * system.setFullScreen("all", true);	//アスペクト比は保ったまま、コンテンツを必ず画面内におさめる
		 */ 
		setFullScreen:function(mode, shouldShrink){
			this._fullScreenMode = (mode) ? mode : 'width';
			this._shouldShrink = shouldShrink;

			this._setViewport();

			if(ua.isiOS){
				window.addEventListener('orientationchange', bind(this._setViewport, this), true);
			}else{
				window.addEventListener('resize', bind(this._setViewport, this), true);
			}

		},
		_setViewport:function(e){
			var width = window.innerWidth,
			    height = window.innerHeight;
				
			if(!this._shouldShrink && width < this._canvas.width){
				width = this._canvas.width;
			}

			if(!this._shouldShrink && height < this._canvas.height){
				height = this._canvas.height;
			}

			var widthScale = width / this._canvas.width,
				heightScale = height / this._canvas.height;

			switch(this._fullScreenMode){
				case 'width':
					this._canvasScale = widthScale;
					break;

				case 'height':
					this._canvasScale = heightScale;
					break;

				case 'all':
					this._canvasScale = (widthScale < heightScale) ? widthScale : heightScale;
					break;

			}

			this._canvas.style.width = Math.floor(this._canvas.width * this._canvasScale) + 'px';
			this._canvas.style.height = Math.floor(this._canvas.height * this._canvasScale) + 'px';
		},
		_setEvent:function(){
			var self = this, touchObj = {};

			function getPos(obj){
				return {x:obj.pageX / self._canvasScale - self._canvas.offsetLeft, y:obj.pageY / self._canvasScale - self._canvas.offsetTop};
			}
			function dispatchTarget(targ, type, object){
				var tparent = targ.getParent();
				targ.dispatchEvent(type, object);
				if(tparent){
					dispatchTarget(tparent, type, object);
				}
			}
			function findTarget(cont, x, y){
				var list = cont._displayArr, disp, pos;
				for(var i = list.length - 1; i >= 0; i--){
					disp = list[i];
                    if(!disp.getVisible()){
                        continue;
                    }
					pos = cont.localToGlobal(disp._screenRect[0], disp._screenRect[1]);
					
					if(pos[0] <= x && pos[0] + disp._screenRect[2] >= x && pos[1] <= y && pos[1] + disp._screenRect[3] >= y){
						if(disp._displayArr){
                            var target = findTarget(disp, x, y);
                            if(target){
                                return target;
                            }
						}else{
							return disp;
						}
					}
				}
				return null;
			}
			
			function touchStart(e){
				e.preventDefault();

				function doEvent(obj, id){
					var pos = getPos(obj),
					    target = findTarget(self._stage, pos.x, pos.y);

					touchObj[id] = target;
					if(target){
						dispatchTarget(target, Event.TOUCH_START, {x:pos.x, y:pos.y});
					}
				}

				if(e.type == 'mousedown'){
					window.addEventListener('mousemove', touchMove, true);
					window.addEventListener('mouseup', touchEnd, true);
					doEvent(e, 0);
				}else{
					for(var i = 0, len = e.changedTouches.length; i < len; i++){
						var touch = e.changedTouches[i];
						doEvent(touch, touch.identifier);
					}
				}

			}

			function touchMove(e){
				e.preventDefault();

				function doEvent(obj, id){
					var target = touchObj[id],
					    pos = getPos(obj);
					
					if(target){
						dispatchTarget(target, Event.TOUCH_MOVE, {x:pos.x, y:pos.y});	
					}
				}

				if(e.type == 'mousemove'){
					doEvent(e, 0);

				}else{
					for(var i = 0, len = e.changedTouches.length; i < len; i++){
						var touch = e.changedTouches[i];
						doEvent(touch, touch.identifier);
					}
				}
			}

			function touchEnd(e){
				e.preventDefault();
				function doEvent(obj, id){
					var target = touchObj[id],
					    pos = getPos(obj);

					delete touchObj[id];

					if(target){
						dispatchTarget(target, Event.TOUCH_END, {x:pos.x, y:pos.y});	
					}
				}
				if(e.type == 'mouseup'){
					window.removeEventListener('mousemove', touchMove, true);
					window.removeEventListener('mouseup', touchEnd, true);
					doEvent(e, 0);
				}else{
					for(var i = 0, len = e.changedTouches.length; i < len; i++){
						var touch = e.changedTouches[i];
						doEvent(touch, touch.identifier);
					}
				}
			}
			
			if(ua.isMobile){
				this._canvas.addEventListener('touchstart', touchStart, true);
				this._canvas.addEventListener('touchmove', touchMove, true);
				this._canvas.addEventListener('touchend', touchEnd, true);
			}else{
				this._canvas.addEventListener('mousedown', touchStart, true);
			}
		},
		_setScroll:function(){
			function doScroll(){
				if (window.pageYOffset <= 1) {						
					setTimeout(bind(function () {
						scrollTo(0, 1);
						setTimeout(bind(this._setViewport, this), 1000);
					}, this), 10);
				}
			}
			if(didLoad){
				window.addEventListener("load", bind(doScroll, this), false);
			}else{
				doScroll.call(this);
			}
		},
		/**
		 * 画像のロードを行う
		 * @param {Array} resourceArr ImageManagerに渡すリソース配列
		 */ 
		load:function(resourceArr){
			this._isStartedWithLoad = true;
			if(!this._imageManager){
				this._imageManager = new ImageManager();
			}
			this._imageManager.addEventListener(Event.PROGRESS, bind(this._loading, this));
			this._imageManager.addEventListener(Event.COMPLETE, bind(this._loaded, this));
			this._imageManager.load(resourceArr);
		},
		_loading:function(){
			this.dispatchEvent(Event.PROGRESS, {total:this._imageManager.getTotal(), loaded:this._imageManager.getLoaded()});
		},
		_loaded:function(){
			this._imageManager.removeEventListener(Event.PROGRESS);
			this._imageManager.removeEventListener(Event.COMPLETE);
			this.dispatchEvent(Event.COMPLETE);
			this._startGame();	
		},
		/**
		 * Gameのメインクラスを指定
		 * @param {Function} gameClass Gameのメインクラス
		 * @param {Object} gameParams Gameのパラメーターオブジェクト 
		 */ 
		setGameClass:function(gameClass, gameParams){
			this._gameClass = gameClass;
			this._gameParams = gameParams;
		},
		/**
		 * Gameをスタートさせる
		 */
		start:function(){
			if(this._game || this._isStartedWithLoad){
				throw new Error('do not call System.start or System.load again');
			}
			this._startGame();
		},

		_startGame: function(){
			Timer.tick();
			this._game = new this._gameClass(this._gameParams, this);
			this._stage.addChild(this._game);
	
			this._prevTime = Timer.time;
	
			this._timer.start();
			this._intervalId = setInterval(bind(this.run, this), 1000 / this._fps);
		},
		/**
		 * Gameを停止する
		 */ 
		stop:function(){
			clearInterval(this._intervalId);
		},
		run:function(){
			Timer.tick();
			
			this._runTime += (Timer.time - this._prevTime);
			this._runCount ++;
			if(this._runTime >= 1000){
				this._realFps = this._runCount * 1000 / this._runTime;
				this._runCount = this._runTime = 0;
				if(this._fpsElem) this._fpsElem.innerHTML = this._realFps;
				if(this._realFps > this._maxFps) this._maxFps = this._realFps;
			}
			this._prevTime = Timer.time;

			if(!this._disableClearRect){
				this._context.clearRect(0, 0, this._width, this._height);
			}
	
			this._game.update();
			this._stage.draw();
	
			this.dispatchEvent(Event.ENTER_FRAME);
		},
		/**
		 * Canvasの横幅を取得
		 * @returns {Number} Canvasの横幅
		 */
		getWidth:function(){
			return this._width;
		},
		/**
		 * Canvasの高さを取得
		 * @returns {Number} Cnavasの高さ
		 */
		getHeight:function(){
			return this._height;
		},
		/**
		 * 読み込まれた画像を取得します。内部的にImageManagerを使っているので使い方は同様です。
		 * @param {String} path 画像パス
		 * @param {Array} localPosArr 画像のローカル座標とサイズを[x, y, width, height]の配列で指定します。スプライトシートから一部の画像を使いたい時等に利用します。（オプション）
		 * @returns {arc.Image} 読み込まれたImageオブジェクト
		 * @example
		 * var img = system.getImage('a.png', [10, 10, 100, 100]);
		 */
		getImage:function(path, localPosArr){
			return this._imageManager.getImage(path, localPosArr);
		},
		/**
		 * canvasを取得
		 * @returns {HTMLCanvasElement} Gameのcanvas
		 */
		getCanvas:function(){
			return this._canvas;
		},
		/**
		 * すべての表示オブジェクトの親であるStageの表示オブジェクトを取得
		 * @returns {DisplayObject} Stageの表示オブジェクト
		 */
		getStage:function(){
			return this._stage;
		},
		/**
		 * 実測FPSを取得
		 * @returns {Number} FPS
		 */ 
		getFps:function(){
			return this._realFps;
		}
	});
	
	
	
	//abstract classes
	var Game = Class.create(display.DisplayObjectContainer, {
		_system:null,
		initialize:function(params, system){
			this._system = system;
		},
		update:function(){
			
		}
	});

	var didLoad = false;
	window.addEventListener("load", function () {
		didLoad = true;
		/*
		if (window.pageYOffset <= 1) {						
			setTimeout (function () {
				scrollTo(0, 1);
			}, 10);
		}
		*/
	}, false);

	
	/**
	 * @name arc
	 * @namespace arc
	 */
	global.arc = {
		ua		: ua,
		display		: display,
		anim		: anim,
		util		: util,
		Class		: Class,
		Event		: Event,
		EventDispatcher	: EventDispatcher,
		Timer		: Timer,
		CountTimer	: CountTimer,
		Ajax		: Ajax,
		ImageManager	: ImageManager,
		System		: System,
		Game		: Game
	};
})(window);
