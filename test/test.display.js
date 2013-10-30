describe('display', function(){
  var img;

  beforeEach(function(done){
    img = new Image();
    img.src = "img/logo.png";
    img.onload = function(){
      done();
    };
  });

  describe('Image', function(){

    it('returns actual size', function(){
      var image = new arc.display.Image(img);
      expect(image.getWidth()).to.eql(347);
      expect(image.getHeight()).to.eql(287);
    });

    it('changes its scale', function(){
      var image = new arc.display.Image(img);
      image.changeSize(500, 500);
      expect(image.getWidth()).to.eql(500);
      expect(image.getHeight()).to.eql(500);
    });
  });
});
