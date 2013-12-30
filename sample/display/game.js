(function(){
	var GameMain = arc.Class.create(arc.Game, {
		initialize:function(params){
			var sp = new arc.display.Sprite(this._system.getImage('../../logo.png'));
			sp.setAlign(arc.display.Align.CENTER);
			sp.setRotation(45);
			console.log(sp.getAlignX());
			this.addChild(sp);
		}
	});
	window.addEventListener('DOMContentLoaded', function(){
		var system = new arc.System(320, 416, 'canvas');
		system.setGameClass(GameMain);
		system.load(['../../logo.png']);	
	}, false);
})();
