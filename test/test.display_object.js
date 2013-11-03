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

  describe('DisplayObject', function(){
    it('should return initial property', function(){
      var display = new arc.display.DisplayObject(image);
      expect(display.getWidth()).to.eql(347);
      expect(display.getHeight()).to.eql(287);
      expect(display.getAlpha()).to.eql(1);
      expect(display.getRotation()).to.eql(0);
      expect(display.getVisible()).to.eql(true);
    });

    it('should return its scale properly', function(){
      var display = new arc.display.DisplayObject(image);
      var width = image.getWidth();
      var height = image.getHeight();

      display.setWidth(500);
      expect(display.getWidth()).to.eql(500);
      expect(display.getScaleX()).to.eql(500 / width);

      display.setWidth(1000);
      expect(display.getWidth()).to.eql(1000);
      expect(display.getScaleX()).to.eql(1000 / width);

      display.setHeight(500);
      expect(display.getHeight()).to.eql(500);
      expect(display.getScaleY()).to.eql(500 / height);

      display.setHeight(1000);
      expect(display.getHeight()).to.eql(1000);
      expect(display.getScaleY()).to.eql(1000 / height);
    });

    it('should return its size properly', function(){
      var display = new arc.display.DisplayObject(image);
      var width = image.getWidth();
      var height = image.getHeight();
      display.setRotation(90);

      display.setScaleX(2);
      expect(display.getWidth()).to.eql(width * 2);

      display.setScaleY(2);
      expect(display.getHeight()).to.eql(height * 2);
    });
  });
});

