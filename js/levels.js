import {config} from './config.js';
import {Wall} from './Wall.js';
import {resources} from './loader.js';

class Level {
  constructor(name,walls,texture) {
    this.name = name;
    this.walls = walls;
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0xff0000);
    this.graphics.width = 800;
    this.graphics.height = 600;
    this.texture = texture
  }
  load(){

    for (var i = 0; i < this.walls.length; i++) {
      this.walls[i].load()
    }
    this.sprite = new PIXI.Sprite(resources[this.texture].texture);
    this.sprite.position.x = 0/config.zoom;
    this.sprite.position.y = -600/config.zoom;
    this.sprite.scale.x = 1/config.zoom;
    this.sprite.scale.y = 1/config.zoom
    console.log(this.sprite)
    this.graphics.addChild(this.sprite);
    config.container.addChild(this.graphics);
  }
}

const levels = {}
levels.test = new Level("Test",[new Wall(800,-300,20,600,0,config.container,config.world),
                new Wall(400,0,800,20,0,config.container,config.world),
                new Wall(400,-600,800,20,0,config.container,config.world),
                new Wall(0,-300,20,600,0,config.container,config.world)
              ], 'TestLevel')



export {levels}