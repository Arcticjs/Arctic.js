describe('display', function(){
  var image;

  beforeEach(function(done){
    var img = new Image();
    img.src = "img/logo.png";
    img.onload = function(){
      image = new arc.display.Image(img);
      done();
    };
  });

  describe('DisplayObjectContainer', function(){
    it('should return an actual size even if the positions of the children was changed', function(){
      var display1 = new arc.display.DisplayObject(image);
      var display2 = new arc.display.DisplayObject(image);
      var group = new arc.display.DisplayObjectContainer();
      var width = image.getWidth();
      var height = image.getHeight();

      //TODO setX, setYとaddChildの順序を変えるとwidthとheightが正しくなくなる
      display2.setX(100);
      display2.setY(100);

      group.addChild(display1);
      group.addChild(display2);

      expect(group.getWidth()).to.eql(width + 100);
      expect(group.getHeight()).to.eql(height + 100);
    });
  });
});
