var renderer, stage, container, graphics, zoom,
world, boxShape, boxBody, planeBody, planeShape,chassisBody,player, cars=[],wall=[];

var carTexture,wheelTexture;

var PLAYER=Math.pow(2,1),
CAR=Math.pow(2,2),
WALL=Math.pow(2,3);

init();


function Car(x,y,w,h,angle,velX,velY,mass,world,container,collisionGroup,stage,texture){
  this.chassisBody = new p2.Body({
    position: [x,y],
    mass: mass,
    angle: angle,
    velocity: [velX, velY],
  });

  this.boxShape = new p2.Box({ width: w, height: h });
  this.boxShape.collisionGroup = collisionGroup;
  this.boxShape.collisionMask = PLAYER | CAR | WALL
  this.chassisBody.addShape(this.boxShape);
  world.addBody(this.chassisBody);
  // Create the vehicle
  this.vehicle = new p2.TopDownVehicle(this.chassisBody);
  // Add one front wheel and one back wheel - we don't actually need four :)

  this.chassisBody.frontWheel = this.vehicle.addWheel({
    localPosition: [0, 0.5] // front
  });

  this.chassisBody.frontWheel.setSideFriction(200);
  // Back wheel
  this.chassisBody.backWheel = this.vehicle.addWheel({
    localPosition: [0, -0.5] // back
  });
  this.chassisBody.backWheel.setSideFriction(200); // Less side friction on back wheel makes it easier to drift
  this.vehicle.addToWorld(world);

  this.graphics = new PIXI.Graphics();
  this.graphics.beginFill(0xff0000);
  this.wheelSprite = [];

  for (var i = 3; i >= 0; i--) {
    this.wheelSprite[i] = new PIXI.Sprite(wheelTexture);
    this.graphics.addChild(this.wheelSprite[i]);
    this.wheelSprite[i].scale.x = 0.016
    this.wheelSprite[i].scale.y = 0.016
    this.wheelSprite[i].anchor = new PIXI.Point(1,0.5)

  };
  //FL
  this.wheelSprite[0].position={x:-0.25, y:0.15}
  this.boxShape1 = new p2.Box({ width: this.wheelSprite[0].width, height: this.wheelSprite[0].height });

  this.boxShape1.anchor = new PIXI.Point(1,0.5)
  this.boxShape1.position[0] = -0.25
  this.boxShape1.position[1] = 0.15
  this.chassisBody.addShape(this.boxShape1);

  //FR
  this.wheelSprite[1].position={x:0.4-this.wheelSprite[1].width, y:0.15}

  //BL
  this.wheelSprite[2].position={x:-0.25, y:-0.35}
  //BR
  this.wheelSprite[3].position={x:0.4-this.wheelSprite[3].width, y:-0.35}
  this.sprite = new PIXI.Sprite(texture);
  this.graphics.addChild(this.sprite);

  this.graphics.drawRect(-this.boxShape.width/2, -this.boxShape.height/2, this.boxShape.width, this.boxShape.height);
  this.sprite.width = -this.boxShape.width;
  this.sprite.height = -this.boxShape.height;
  this.sprite.position={x:-this.boxShape.width/2, y:this.boxShape.height/2}
  this.sprite.scale.x = -this.sprite.scale.x


  //wheel sprites


  // Add the box to our container
  container.addChild(this.graphics);

  this.update = function(){
    this.graphics.position.x = this.chassisBody.position[0];
    this.graphics.position.y = this.chassisBody.position[1];
    this.graphics.rotation =   this.chassisBody.angle;
  }
}

function Wall(x,y,w,h,angle,container,world){
  this.wallBody = new p2.Body({
    position: [x,y],
    mass: 0,
    angle: angle,
  });

  this.boxShape = new p2.Box({ width: w, height: h });
  this.boxShape.collisionGroup = WALL;
  this.boxShape.collisionMask = PLAYER | CAR ;
  this.wallBody.addShape(this.boxShape);
  world.addBody(this.wallBody);
  this.graphics = new PIXI.Graphics();
  this.graphics.beginFill(0xff0000);

  this.graphics.drawRect(-this.boxShape.width/2, -this.boxShape.height/2, this.boxShape.width, this.boxShape.height);

  this.graphics.position.x = this.wallBody.position[0];
  this.graphics.position.y = this.wallBody.position[1];

  container.addChild(this.graphics);

}

function init(){

  // Init p2.js
  // Create a dynamic body for the chassis
  world = new p2.World({
    gravity : [0,0]
  });

  zoom = 50;

  // Initialize the stage
  renderer =  PIXI.autoDetectRenderer(800, 600),
  stage = new PIXI.Stage(0x282B2A);
  renderer.backgroundColor = 0x282B2A;
  container = new PIXI.Container(),
  PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
  PIXI.loader
  .add('car', 'assets/car1.png')
  .add('wheel', 'assets/wheel.png')
  .load(function (loader, resources) {
    carTexture = resources.car.texture;
    wheelTexture = resources.wheel.texture;
    wall[0] = new Wall(800/zoom,-300/zoom,20/zoom,600/zoom,0,container,world)
    wall[1] = new Wall(400/zoom,0/zoom,800/zoom,20/zoom,0,container,world)
    wall[2] = new Wall(400/zoom,-600/zoom,800/zoom,20/zoom,0,container,world)
    wall[4] = new Wall(0/zoom,-300/zoom,20/zoom,600/zoom,0,container,world)

    player = new Car(50/zoom,-30/zoom,0.5,0.875,-1.5708,15,0,2,world,container,PLAYER,stage,carTexture);
    animate();
  });
  stage.addChild(container);
  document.body.appendChild(renderer.view);
  // Add transform to the container
  container.position.x =  0; // center at origin
  container.position.y =  0;
  container.scale.x =  zoom;  // zoom in
  container.scale.y = -zoom; // Note: we flip the y axis to make "up" the physics "up"





  world.on("impact",function(evt){
    var bodyA = evt.bodyA,
    bodyB = evt.bodyB;

    if(bodyA.shapes[0].collisionGroup == CAR || bodyA.shapes[0].collisionGroup == PLAYER) {
      bodyA.frontWheel.setSideFriction(3);
      bodyA.backWheel.setSideFriction(3);
    }
    if(bodyB.shapes[0].collisionGroup == CAR || bodyB.shapes[0].collisionGroup == PLAYER) {
      bodyB.frontWheel.setSideFriction(3);
      bodyB.backWheel.setSideFriction(3);
    }

    if(bodyB.shapes[0].collisionGroup == WALL && bodyA.shapes.collisionGroup == PLAYER) {
      window.setTimeout(function(){
        bodyA.frontWheel.setSideFriction(200);
        bodyA.backWheel.setSideFriction(200);}, 100)
      }
      if(bodyA.shapes[0].collisionGroup == WALL && bodyB.shapes.collisionGroup == PLAYER) {
        window.setTimeout(function(){
          bodyB.frontWheel.setSideFriction(200);
          bodyB.backWheel.setSideFriction(200);}, 100)
        }


      });0



      // Draw the box.


      var keys = {
        '37': 0, // left
        '39': 0, // right
        '38': 0, // up
        '40': 0 // down
      };
      var maxSteer = 20000;
      window.addEventListener("keydown",function (evt){
        keys[evt.keyCode] = 1;
        onInputChange();
      });
      window.addEventListener("keyup",function (evt){
        keys[evt.keyCode] = 0;
        onInputChange();
      });
      function onInputChange(){
        // Steer value zero means straight forward. Positive is left and negative right.
        player.chassisBody.frontWheel.steerValue = maxSteer * (keys[37] - keys[39]);
        player.wheelSprite[0].rotation = player.wheelSprite[1].rotation = 0.5*(keys[37] - keys[39])
        player.chassisBody.backWheel.setBrakeForce(0);
        if(keys[40]){
          if(player.chassisBody.backWheel.getSpeed() > 0.1){
            // Moving forward - add some brake force to slow down
            player.chassisBody.backWheel.setBrakeForce(2);
          } else {
            // Moving backwards - reverse the engine force
            player.chassisBody.backWheel.setBrakeForce(2);
          }
        }
      }
    }

    // Animation loop
    function animate(t){
      t = t || 0;
      requestAnimationFrame(animate);

      // Move physics bodies forward in time
      world.step(1/60);

      // Transfer positions of the physics objects to Pixi.js

      player.update();
      for (var i = cars.length - 1; i >= 0; i--) {
        cars[i].update()
      };
      // console.log(p2.vec2.length(player.chassisBody.velocity))
      if(p2.vec2.length(player.chassisBody.velocity) <= 0.05){
        player.chassisBody.backWheel.setBrakeForce(2);
        player.boxShape.collisionGroup = CAR;
        cars.push(player);
        player = new Car(50/zoom,-30/zoom,0.5,0.875,-1.5708,15,0,2,world,container,PLAYER,stage,carTexture);

      }
      // Render scene
      renderer.render(stage);
    }
