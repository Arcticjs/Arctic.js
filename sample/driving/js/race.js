/**
 * This sample code works only on iOS devices.
 * You can drive the car by tilting your device.
 * Collect all coins in the field.
 */

(function(){
	var system, Class = arc.Class,
	    imagePath = {
		coin	: 'img/coin.png',
		coin_hit: 'img/coin_hit.png',
		cockpit	: 'img/cockpit.jpg',
		handle	: 'img/handle.png',
		bg	: 'img/bg.png'
	    };

	var time, coin, complete, coinOwnNum = 0;

	var CAMERA_Y = 20,
	    COIN_POS_ARR = [
			
	    ],
	    COIN_NUM = 10,
	    COIN_HIT_X_VOL = 180,
	    COIN_HIT_Z_MIN = -100,
	    COIN_HIT_Z_MAX = -10;

	function initialize(e){
		var images = document.getElementsByTagName('img'),
		    loadingView = document.getElementById('loading'),
		    loadingBar = document.getElementById('loading-bar'),
		    body = document.getElementsByTagName('body')[0],
		    resourceArr = [],
		    loading = new LoadingView(loadingView, loadingBar);
		
		system = new arc.System(480, 270, 'canvas', 60, 8);
		system.setGameClass(GameMain);
		var resourceArr = [];
		for(var prop in imagePath){
			resourceArr.push(imagePath[prop]);
		}
		//system.loadResources(resourceArr, new LoadingView(loadingView, loadingBar));
		system.addEventListener(arc.Event.PROGRESS, arc.util.bind(loading.onLoading, loading));
		system.addEventListener(arc.Event.COMPLETE, arc.util.bind(loading.onLoaded, loading));
		system.load(resourceArr);

		time = document.getElementById('time');
		coin = document.getElementById('coin');
		complete = document.getElementById('complete');

		body.style.webkitTransform = 'rotate(' + Number(90 - window.orientation) + 'deg)';
		window.addEventListener('orientationchange', function(e){
			body.style.webkitTransform = 'rotate(' + Number(90 - window.orientation) + 'deg)';
			console.log(window.orientation);
			
		},false);
	}

	var debug = document.getElementById('debug');
	function setDebug(msg){
		debug.innerHTML = msg;
	}

	var LoadingView = arc.Class.create({
		maxBarWidth:0,
		initialize:function(view, bar){
			this.view = view;
			this.bar = bar;
			this.maxBarWidth = 240;
			
			this.bar.style.width = '0px';
		},
		onLoading:function(percent){
			this.bar.style.width = Number(this.maxBarWidth * percent) + 'px'; 
		},
		onLoaded:function(){
			this.bar.style.width = this.maxBarWidth + 'px';
			setTimeout(arc.util.bind(function(){
				this.view.style.opacity = 0;
				this.clear();
			},this), 400);
		},
		clear:function(){
			var parent = this.view.parentNode;
			if(parent) parent.removeChild(this.view);	
		}
	});

	var GameMain = Class.create(arc.Game, (function(){        
		var _coinArr = [],
		    _fl = 250,
        	    _xpos = 0,
        	    _ypos = CAMERA_Y,
        	    _zpos = 0,
   		    _vx = 0,
		    _vy = 0,
		    _vz = 0,
		    _angleY = 0,
		    _vpX,
		    _vpY;

		var _accelX = 0, _accelY = 0, _accelZ = 0;
		
		var _bg,
		    _cockpit,
		    _handle,
		    _timer,
		    _coinLayer;

		var _FRICTION = 0.98,
		    _STAGE_WIDTH = 1000,
		    _STAGE_HEIGHT = 1000;

		function initialize(obj){
			_vpX = system.getWidth() / 2;
			_vpY = system.getHeight() / 2;
			_timer = new arc.Timer();

			_bg = new arc.display.Sprite(system.getImage(imagePath.bg));
			this.addChild(_bg);

			_setCoins.apply(this);
			_setCockpit.apply(this);
			
			var start = document.getElementById('start');
			start.addEventListener('touchend', _startGame, false);
		}
		
		function _setCockpit(){
			_cockpit = new arc.display.Sprite(system.getImage(imagePath.cockpit));
			_cockpit.setY(200);
			this.addChild(_cockpit);
			
			_handle = new arc.display.Sprite(system.getImage(imagePath.handle));
			_handle.setAlign(arc.display.Align.CENTER);
			_handle.setX(341);
			_handle.setY(271);
			this.addChild(_handle);
		}
		
		function _setCoins(){
			_coinLayer = new arc.display.DisplayObjectContainer();
			this.addChild(_coinLayer);

			var WIDTH = 300, DIST = 1000;
            
			for (var i = 0; i < COIN_NUM; i++) {
				var coin = new Coin();
				coin.xpos = (i % 2 === 0) ? -1 * WIDTH : WIDTH;
				coin.zpos = DIST * i + (i + 1) * 1500;
				coin.ypos = CAMERA_Y;
				_coinLayer.addChild(coin);
				_coinArr.push(coin);
			}
			setCoinNum(0, _coinArr.length);
		}
		
		function _startGame(e){
			if(e){
				e.currentTarget.removeEventListener(e.type, arguments.callee);
				e.preventDefault();
			}
			var start = e.currentTarget;
			start.parentNode.removeChild(start);
			_timer.start();
			window.addEventListener('devicemotion', _deviceMotionAction, false);
			window.addEventListener('orientationchange', function(e){
				e.preventDefault();
				console.log('orientationchange');
			}, false);
		}

		function _endGame(){
			complete.style.display = 'block';
			_timer.stop();
			window.removeEventListener('devicemotion', _deviceMotionAction, false);
		}
		
		function _deviceMotionAction(e){
			var gravity = e.accelerationIncludingGravity,
			    x = gravity.x,	//左右
			    y = gravity.y,	//前後
			    z = gravity.z;	//上下

			_vz += ~~(z / 5);
			_angleY = y * -0.5;

			_handle.setRotation(Math.floor(y * -5));
		}

		function getNoizeReductedValue(prev, current){
			return (Math.abs(prev - current) > 0.1) ? prev : prev * 0.5 + current * 0.5;
		}

		/*
		function _deviceMotionAction(e){
			var gravity = e.accelerationIncludingGravity;

			_accelX = getNoizeReductedValue(_accelX, gravity.x);
			_accelY = getNoizeReductedValue(_accelY, gravity.y);
			_accelZ = getNoizeReductedValue(_accelZ, gravity.z);

			_vz -= ~~(_accelZ / 8);
			_angleY = _accelY * -2;

			setDebug('origin : ' + gravity.y + ' diff : ' + Math.abs(_accelY - gravity.y));

			_handle.setRotation(Math.floor(_accelY * -5));
		}
		*/

		function start(){
			
		}

		function stop(){

		}

		function update(){
			_xpos += _vx;
			_ypos += _vy;
			_zpos += _vz;

			_vx *= _FRICTION;
			_vy *= _FRICTION;
			_vz *= _FRICTION;

			for (var i = 0, len = _coinArr.length; i < len; i++) {
				var coin = _coinArr[i];
				_move(coin);
			}

			time.innerHTML = _timer.getElapsed() / 1000;
 
			_sortZ();
		}

		function _move(coin){
			var cosY = Math.cos(_angleY / 180 * Math.PI),
			    sinY = Math.sin(_angleY / 180 * Math.PI);
		
			coin.xpos += _vx;
			coin.ypos += _vy;
			coin.zpos += _vz;
			
			coin.xpos = coin.xpos * cosY - coin.zpos * sinY;
			coin.zpos = coin.zpos * cosY + coin.xpos * sinY;
			
			var zHit = coin.zpos >= COIN_HIT_Z_MIN && coin.zpos <= COIN_HIT_Z_MAX,
			    xHit = coin.xpos >= -1 * COIN_HIT_X_VOL / 2 && coin.xpos <= COIN_HIT_X_VOL / 2;
			if(!coin.getHit() && zHit && xHit){
				console.log(coin.xpos + " " + coin.zpos);
				coin.setHit(true);
				coinOwnNum++;
				setCoinNum(coinOwnNum);
			}

			if (coin.zpos < -1 * _fl) {
				coin.setVisible(false);
			}
			else {
				coin.setVisible(true);
				
				var scale = _fl / (_fl + coin.zpos);
				coin.setScaleX(scale);
				coin.setScaleY(scale);
				coin.setX(_vpX + coin.xpos * scale);
				coin.setY(_vpY + coin.ypos * scale);
			}		
		}

		/*
		function _move(coin){
			var cosY = Math.cos(_angleY / 180 * Math.PI),
			    sinY = Math.sin(_angleY / 180 * Math.PI);
			var xpos, ypos, zpos;

			xpos = coin.xpos * cosY - coin.zpos * sinY - _xpos;
			zpos = coin.zpos * cosY - coin.xpos * sinY - _zpos;
			ypos = coin.ypos - _ypos;


			var zHit = zpos >= COIN_HIT_Z_MIN && zpos <= COIN_HIT_Z_MAX,
			    xHit = xpos >= -1 * COIN_HIT_X_VOL / 2 && zpos <= COIN_HIT_X_VOL / 2;
			if(!coin.getHit() && zHit && xHit){
				coin.setHit(true);
				coinOwnNum++;
				setCoinNum(coinOwnNum);
			}

			if (zpos < -1 * _fl) {
				coin.setVisible(false);
			}
			else {
				coin.setVisible(true);
				
				var scale = _fl / (_fl + zpos);
				coin.setScaleX(scale);
				coin.setScaleY(scale);
				coin.setX(_vpX + xpos * scale);
				coin.setY(_vpY + ypos * scale);
			}		
		}
		*/

		function _sortZ(){
			_coinArr.sort(function(a, b){
				return b.zpos - a.zpos;
			});
			for (var i = 0, len = _coinArr.length; i < len; i++) {
				var coin = _coinArr[i];
				_coinLayer.setChildIndex(coin, i);
			}
		}

		function setCoinNum(num){
			coin.innerHTML = 'coin : ' + num + '/' + COIN_NUM;
			if(num === COIN_NUM){
				_endGame();
			}
		}


		return {
			initialize	: initialize,
			start		: start,
			stop		: stop,
			update		: update
		};	
	})());

	var Coin = Class.create(arc.display.DisplayObjectContainer, (function(){
		function initialize(){
			this._isHit	= false;
			this._cont	= new arc.display.Sprite(system.getImage(imagePath.coin));
			this._contHit	= new arc.display.Sprite(system.getImage(imagePath.coin_hit));

			this._cont.setAlign(arc.display.Align.CENTER);
			this._cont.setScaleX(0.5);
			this._cont.setScaleY(0.5);
			this.addChild(this._cont);

			this._contHit.setAlign(arc.display.Align.CENTER);
			this._contHit.setScaleX(0.5);
			this._contHit.setScaleY(0.5);
			this._contHit.setVisible(false);
			this.addChild(this._contHit);
		}

		function setHit(flg){
			if(this._isHit === flg){
				return;
			}
			this._isHit = flg;
			this._cont.setVisible(!flg);
			this._contHit.setVisible(flg);

		}

		function getHit(){
			return this._isHit;
		}

		return {
			initialize	: initialize,
			setHit		: setHit,
			getHit		: getHit
		};
	})());
	
	window.addEventListener('DOMContentLoaded', initialize, false);
})();
