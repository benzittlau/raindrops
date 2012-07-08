var canvasWidth = 640;
var thisXPos = 0;
var canvasHeight = 400;
var thisYPos = 0;
var canvas = null;
var context = null;
var gLoop = null;
var rain = [];
var rainImg = "images/raindrop.gif";
var bgImg = null;
var i;



var avgRainHeight = 46;
var varRainHeight = 10;
var avgRainTrailHeight = 0;
var varRainTrailHeight = 0;
var rainWidth = 1;
var rainColour = "#BBB";
var rainTrailColour = "#CCC";

var howManyDrops = 20;

var avgYVelocity = 5;
var varYVelocity = 1;
var avgXVelocity = 0;
var varXVelocity = 0;

var renderTimeout = 100;

var varianceFactor = 6;

//a larger distance value means it's closer to the window
var maxDistance = varianceFactor;

var waterSlope = 50;

var splashScaleFactor = 0.5;

var lastGameCycleTime = 0;
var gameCycleDelay = 10; //1000 / 30; // aim for 30 fps for game logic

function splash() {
  this.x = 0;
  this.y = 0;

  this.velocity = 0;
  this.radius = 0;
  this.life = 0;

  this.colour = "#666";

  this.init = function(x,y){
    this.x = x;
    this.y = y;

    this.radius = 30;
    this.life = 300;
  };

  this.move = function(timeDelta) {
    if (this.life < 0 ) {
      return false;
    }
    else {
      this.life -= timeDelta;
      this.radius = 30 - this.life/10;
    }
  };

  this.draw = function() {
    context.save();
    context.beginPath();
    context.scale(1,splashScaleFactor);
    context.arc(this.x,this.y/splashScaleFactor,this.radius,0,Math.PI*2,true);
    context.restore();
    context.strokeStyle = this.colour;
    context.stroke();
  };
}

function rainDrop() {
  this.x = 0;
  this.y = 0;

  this.vx = 0;
  this.vy = 0;

  this.rainHeight = 0;
  this.rainTrailHeight = 0;

  this.rainColour = "black";
  this.rainTrailColour = "black";

  this.distance = 0;

  this.draw = function() {
    context.fillStyle = this.rainColour;
    context.fillRect(this.x, this.y, rainWidth, this.rainHeight);
    context.fillStyle = this.rainTrailColour;
    context.fillRect(this.x, this.y - this.rainTrailHeight, rainWidth, this.rainTrailHeight);
  };

  this.move = function(timeDelta) {
    if (this.y > ( canvasHeight - waterSlope * (maxDistance - this.distance))) {
      return false;
    }
    else {
      var mul = timeDelta / gameCycleDelay;

      this.y = this.y + this.vy * mul;
      this.x = this.x + this.vx * mul;
    }
  };

  this.init = function() {
    this.distance = Math.random() * varianceFactor;
    this.vy = avgYVelocity + (this.distance - 0.5)*varYVelocity;
    this.vx = avgXVelocity + (Math.random() - 0.5)*varXVelocity;

    this.rainHeight = avgRainHeight + (this.distance-0.5)*varRainHeight;
    this.rainTrailHeight = avgRainTrailHeight + (this.distance - 0.5)*varRainTrailHeight;

    this.rainColour = rainColour;
    this.rainTrailColour = rainTrailColour;

    this.y = -Math.random() * canvasHeight;
    this.x = Math.random() * canvasWidth;
  };
}

var clear = function() {
    context.beginPath();
    context.rect(0, 0, canvasWidth, canvasHeight);
    context.closePath();
    context.fillStyle = "white";
    context.fill();
};

function rainSystem() {

    this.drops = [];

    this.splashes = [];

    this.setup = function() {
      canvas = document.getElementById("gameCanvas");
      context = canvas.getContext("2d");

      //TODO: try to get rid of this offset
      canvasWidth = window.innerWidth - 15;
      canvasHeight = window.innerHeight - 15;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;


      for (i = 0; i < howManyDrops; i++) {
        this.drops.push( new rainDrop() );
        this.drops[i].init();
      }
    };

    this.rainCycle = function(timeDelta) {
      context.save();
      clear();

      for (i = 0; i < howManyDrops; i++) {
        //perform drops actions
        if (this.drops[i].move(timeDelta) === false) {
          var newSplash = new splash();
          newSplash.init(this.drops[i].x, this.drops[i].y);
          this.splashes.push(newSplash);

          this.drops[i].init();

        }
        this.drops[i].draw();
      }

      for (i = 0; i < this.splashes.length; i++) {
        //perform splashes actions
        if (this.splashes[i].move(timeDelta) === false) {
          this.splashes.splice(i, 1);
          //account for the removed item
          i = i - 1;
        }
        else {
          this.splashes[i].draw();
        }
      }


      context.restore();

    };
}

var startup = function() {
  rs = new rainSystem();
  rs.setup();

	var last_time;

	function timeManagement(rendering_time) {
		var time_delta;

		if (last_time === undefined) {
			last_time = new Date().getTime();
		}
		time_delta = rendering_time - last_time;
		last_time = rendering_time;

		rs.rainCycle(time_delta);

		window.requestAnimationFrame(timeManagement);
  }

	window.requestAnimationFrame(timeManagement);
};
