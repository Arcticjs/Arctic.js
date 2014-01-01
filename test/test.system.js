describe('System', function(){
	var system;
	var isStarted = false;
	var count = 0;
	var GameMain = arc.Class.create(arc.Game, {
		initialize:function(params){
			isStarted = true;
		},
		update:function(){
			count++;
		}
	});

  before(function(done){
		var canvas = document.createElement('canvas');
		canvas.id = 'canvas';
		document.getElementsByTagName('body')[0].appendChild(canvas);
		system = new arc.System(320, 320, 'canvas');
		system.setGameClass(GameMain);
		done();
  });

  describe('Basics', function(){
    it('should start', function(){
			system.start();
			expect(isStarted).to.be.true;
    });

		it('should run', function(done){
			setTimeout(function(){
				expect(count).to.at.least(2);
				done();
			}, 200);
		});

		it('should stop', function(done){
			system.stop();
			var currentCount = count;
			setTimeout(function(){
				expect(count).to.eql(currentCount);
				done();
			}, 200);
		});
  });
});
