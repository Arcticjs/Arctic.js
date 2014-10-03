Arctic.js
======

<img src="https://raw.githubusercontent.com/Arcticjs/Arctic.js/master/logo.png" width="347" height="287">

Canvas Framework for smartphone

- [Introduction](http://arcticjs.com/)
- [Google Groups](https://groups.google.com/group/arcticjs?hl=ja)


DOWNLOAD
-----------
- [arctic.js](https://raw.githubusercontent.com/Arcticjs/Arctic.js/master/src/arctic.js)
- [arctic.min.js](https://raw.githubusercontent.com/Arcticjs/Arctic.js/master/build/arctic.min.js)


GETTING STARTED
-----------
1. Download Arctic.js

2. Load Arctic.js
```html
<html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
    <title>Game</title>
</head>
<body>
    <canvas id="canvas"></canvas>
    <script type="text/javascript" src="js/arctic.js"></script>
    <script type="text/javascript" src="js/game.js"></script>
</body>
</html>
```

3. Create a game class in your JavaScript file
```js
var GameMain = arc.Class.create(arc.Game, {
    initialize:function(params){
        console.log(params.hp);
    },
    //This method is called in every frame
    update:function(){

    }
});
```

4. Use the game class
```js
window.addEventListener('DOMContentLoaded', function(e){
    //Pass the width and height of your game and id of the canvas element
    var system = new arc.System(320, 416, 'canvas');

    //The second parameter will be passed as a parameter of initialize method in the game class
    system.setGameClass(GameMain, {hp:100, mp:100});

    system.addEventListener(arc.Event.PROGRESS, function(e){
        console.log(e.loaded + ", " + e.total);
    });

    system.addEventListener(arc.Event.COMPLETE, function(){
        console.log('loaded');
    });

    //After finishing its loading, an instance of the game class will be created automatically
    system.load(['a.png', 'b.png']);
}, false);
```

PLATFORM
-----------
- Android2.1(can't rotate)
- Android2.2+
- iOS3(can't use arc.display.TextField)
- iOS4+
- Safari
- Google Chrome


LICENSE
-----------
- MIT License
