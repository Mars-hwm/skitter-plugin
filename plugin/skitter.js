/**
 * Created by baidu on 15/12/19.
 */
/**
 * Skitter动画类
 * @param dom 动画图片的容器
 * @param options 配置参数
 * @constructor
 */
var finishedNum;
var animationId;
function Skitter(dom, options) {
    this.container = dom;
    this.context = {};
    this.options = options;
    this.images = [];
    this.currentImage = null;
    this.nextImage = {};
    this.scene = [];
    this.initialize(options);
}
Skitter.prototype.initialize = function (options) {
    var self = this;
    // 设置dom隐藏，并配置images
    var imageContainer = this.container.firstElementChild;
    imageContainer.style.display = 'none';
    var imagesNodes = imageContainer.children;
    for (var i = 0; i < imagesNodes.length; i++) {
        var imgNode = imagesNodes[i];
        var src = imgNode.getAttribute('src');
        var effect = imgNode.getAttribute('effect');
        var image = new Image();
        image.src = src;
        self.images.push({
            image: image,
            effect: effect
        });
    }
    // 添加canvas，设置canvas宽高，开启动画渲染
    self.images[0].image.onload = function () {
        var canvas = document.createElement('canvas');
        self.context = canvas.getContext('2d');
        canvas.width = this.width;
        canvas.height = this.height;
        self.container.appendChild(canvas);
        self.currentImage = null;
        self.nextImage = self.images[0];
        self.startAnimation(options);
    };
};
Skitter.prototype.startAnimation = function (options) {
    var self = this;
    self.scene = [];
    var animationTime = options.animationTime || 500;
    var intervalTime = options.intervalTime || 5000;
    if (self.nextImage.effect === 'cubeshow') {
         // 存在当前图片，动画绘制图片
         if (self.currentImage) {
             var tiles = createCubeTiles.apply(self, [self.nextImage.image, 12, 3, animationTime]);
             (function () {
                 var count = 0;
                 var timeoutId;
                 return function addCubeTiles () {
                     timeoutId = setTimeout(addCubeTiles, 50);
                     tiles[count].startTime = new Date().getTime();
                     tiles[count].endTime = new Date().getTime() + tiles[count].time;
                     self.scene.push(tiles[count]);
                     count++;
                     if (count > tiles.length - 1) {
                         window.clearTimeout(timeoutId);
                     }
                 }
             })()();
             self.render(self.renderCubeShow);
         }
         // 不存在当前图片，直接绘制图片
         else {
             self.context.drawImage(self.nextImage.image, 0, 0);
         }
     }
    if (self.nextImage.effect === 'circleinside') {
         if (self.currentImage) {
             var width = self.context.canvas.width;
             var height = self.context.canvas.height;
             var tile = {
                 source: self.currentImage.image,
                 sourceX: 0,
                 sourceY: 0,
                 sourceWidth: width,
                 sourceHeight: height,
                 targetX: 0,
                 targetY: 0,
                 targetWidth: width,
                 targetHeight: height,
                 time: 2000,
                 startTime: new Date().getTime(),
                 endTime: new Date().getTime() + 2000
             };
             self.scene.push(tile);
             self.context.save();
             self.render(self.renderCircleInside);
         }
         else {
             self.context.drawImage(self.nextImage.image, 0, 0);
         }
     }
    setTimeout(function (options) {
        return function () {
            self.currentImage = self.nextImage;
            for (var i = 0; i< self.images.length; i++) {
                if (self.nextImage == self.images[i]) {
                    if (i === self.images.length - 1) {
                        self.nextImage = self.images[0];
                    } else {
                        self.nextImage = self.images[i + 1];
                    }
                    break;
                }
            }
            console.log(self.currentImage);
            console.log(self.nextImage);
            self.startAnimation.apply(self, [options]);
        }
    }(options), intervalTime);
};
function createCubeTiles(image, xTiles, yTiles, time) {
    var tiles = [];
    var width = image.width / xTiles;
    var height = image.height / yTiles;
    for (var i = 0; i < xTiles; i++) {
        for (var j = 0; j < yTiles; j++) {
            var tile = {
                source: image,
                sourceX: width * i,
                sourceY: height * j,
                sourceWidth: width,
                sourceHeight: height,
                targetX: this.context.canvas.width,
                targetY: this.context.canvas.height,
                targetWidth: width,
                targetHeight: height,
                time: time,
                startTime: new Date().getTime(),
                endTime: new Date().getTime()
            };
            tile.deltaX = tile.targetX- tile.sourceX;
            tile.deltaY = tile.targetY - tile.sourceY;
            tiles.push(tile);
        }
    }
    return tiles;
}
Skitter.prototype.render = function (renderMethod) {
    renderMethod.apply(this);
};
Skitter.prototype.renderCubeShow = function () {
    var self = this;
    animationId = window.requestAnimationFrame((function () {
        return function () {
            self.renderCubeShow.apply(self);
        };
    })(self));
    self.context.clearRect(0, 0, self.context.canvas.width, self.context.canvas.height);
    if (self.currentImage) {
        self.context.drawImage(self.currentImage.image, 0, 0);
    }
    var tile;
    finishedNum = 0;
    for (var i = 0; i < self.scene.length; i++) {
        tile = self.scene[i];
        self.drawCubeTile(tile);
    }
    if (finishedNum >= 36) {
        cancelAnimationFrame(animationId);
    }
};
Skitter.prototype.drawCubeTile = function (tile) {
    var deltaX = 0;
    var deltaY = 0;
    var startTime, tempTime, deltaTime, time;
    time = tile.time;
    deltaX = tile.deltaX;
    deltaY = tile.deltaY;
    tempTime = new Date().getTime();
    deltaTime = (tempTime - tile.startTime);
    tile.targetX = tile.sourceX + deltaX * (1 - deltaTime / time);
    tile.targetY = tile.sourceY + deltaY * (1- deltaTime / time);
    if(deltaTime >= time) {
        tile.targetX = tile.sourceX;
        tile.targetY = tile.sourceY;
        finishedNum ++;
    }
    this.context.drawImage(tile.source, tile.sourceX, tile.sourceY, tile.sourceWidth, tile.sourceHeight, tile.targetX, tile.targetY, tile.sourceWidth, tile.sourceHeight);

};

Skitter.prototype.renderCircleInside = function () {
    var radius;
    var self = this;
    animationId = window.requestAnimationFrame((function () {
        return function () {
            self.renderCircleInside.apply(self);
        };
    })(self));
    self.context.clearRect(0, 0, self.context.canvas.width, self.context.canvas.height);
    if (self.nextImage) {
        self.context.drawImage(self.nextImage.image, 0, 0);
        for (var i = 0; i < self.scene.length; i++) {
            var tile = self.scene[i];
            var tempTime = new Date().getTime();
            var deltaTime = (tempTime - tile.startTime);
            var radius = tile.targetWidth * (1 - deltaTime / tile.time) * 0.5;
            if (radius < 0) {
                radius = 0;
            }
            self.context.restore();
            self.context.save();
            drawCircle(self.context, tile.targetWidth * 0.5, tile.targetHeight * 0.5, radius);
            self.context.clip();
            self.context.drawImage(tile.source, 0, 0);
        }
    }
    if (radius === 0) {
        cancelAnimationFrame(animationId);
        self.context.restore();
    }
};
function drawCircle(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.closePath();
}