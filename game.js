'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }   
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  times(multi) {
    return new Vector(this.x * multi, this.y * multi);
  }
}

class Actor {
  constructor(position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(position instanceof Vector && size instanceof Vector && speed instanceof Vector)) {
      throw new Error('Один из параметров не является объектом типа Вектор');
    }  
    this.pos = position;
    this.size = size;
    this.speed = speed;
  }

  act() {

  }

   get type() {
    return 'actor';
  }

  get left(){
    return this.pos.x;  
  }

  get top(){
    return this.pos.y;  
  }

  get right(){
    return this.pos.x + this.size.x;  
  }

  get bottom(){
    return this.pos.y + this.size.y;  
  }

  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Метод принимает обязательный параметр типа Actor!');
    }

    if (actor === this) {
      return false;
    }

    return (this.left < actor.right && this.right > actor.left && this.top < actor.bottom && this.bottom > actor.top);  
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.status = null;
    this.finishDelay = 1;
    this.height = grid.length;
    this.player = this.actors.find((player) => player.type === 'player');
    this.width = Math.max(0, ...this.grid.map((el) => el.length));
  }

  isFinished() {
    return (this.status !== null && this.finishDelay < 0);
  }

  actorAt(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Метод принимает обязательный параметр типа Actor!');
    } 
    return this.actors.find((cross) => cross.isIntersect(actor));
  }

  obstacleAt(finalPos = new Vector(0, 0), sizeAct = new Vector(1, 1)) {
    if (!(finalPos instanceof Vector) && !(sizeAct instanceof Vector)) {
      throw new Error('Параметры должны быть класса Vector');
    }

    if ((finalPos.y + sizeAct.y) > this.height) {
      return 'lava';
    }

    if ((finalPos.x < 0) || (finalPos.y < 0) || ((finalPos.x + sizeAct.x) > this.width)) {
      return 'wall';
    }
    
    const top = Math.floor(finalPos.y);
    const left = Math.floor(finalPos.x);
    const bottom = Math.ceil(finalPos.y + sizeAct.y);
    const right = Math.ceil(finalPos.x + sizeAct.x);

    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        let cellValue = this.grid[y][x];
        if (cellValue) {
          return cellValue;
        } 
      }
    }
  }

  removeActor(actor) {
    this.actors = this.actors.filter((el) => el !== actor);
  }

  noMoreActors(actorType) {
    return !this.actors.some((actor) => actor.type === actorType);
  }

  playerTouched(obstacleOrType, touched) {
    if (!(this.status === null)) { 
      return;
    }
    
    if (obstacleOrType === 'lava' || obstacleOrType === 'fireball') {
      this.status = 'lost';
    }
    
    if (obstacleOrType === 'coin' && touched.type === 'coin') {
      this.removeActor(touched);
      if (this.noMoreActors(touched.type)) {
        this.status = 'won';
      }
    }
  }
}

class LevelParser {
  constructor(dictionary = {}) {
    this.dictionary = dictionary;
    this.mapping = {
      'x' : 'wall',
      '!' : 'lava'
    };
  }

  actorFromSymbol(char) {
    return this.dictionary[char];
  }

  obstacleFromSymbol(char) {
    return this.mapping[char];
  }

  createGrid(arrayStrings = []) {
    return arrayStrings.map((currString) => currString.split('').map((el) => this.obstacleFromSymbol(el)));
  }

  createActors(arrayStrings = []) {
    const arrayActors = [];
    for (let y = 0; y < arrayStrings.length; y++) {
      for (let x = 0; x < arrayStrings[y].length; x++) {
        const Constr = this.actorFromSymbol(arrayStrings[y][x]);
        if (typeof Constr === 'function') {
          const newObj = new Constr(new Vector(x, y));
          if ((newObj instanceof Actor)) {
            arrayActors.push(newObj);
          }
        }
      }
    }
    return arrayActors;  
  }

  parse(arrayStrings = []) {
    return new Level(this.createGrid(arrayStrings), this.createActors(arrayStrings));
  }
}

class Player extends Actor {
constructor(position = new Vector(0, 0), size, speed) {
    super(position.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), speed);
  }

  get type() {
    return 'player';
  }
}

class Fireball extends Actor {
  constructor(position = new Vector(0, 0), speed = new Vector(0, 0), size) {
    super(position, size, speed);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  } 

  act(time, level) {
    const newPosition = this.getNextPosition(time);
    const obstacle = level.obstacleAt(newPosition, this.size);
    if (obstacle) {
      this.handleObstacle();
    } else {
      this.pos = newPosition;
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(position = new Vector(0, 0), speed, size) {
    super(position, new Vector(2, 0), size);
  }
} 

class VerticalFireball extends Fireball {
  constructor(position = new Vector(0, 0), speed, size) {
    super(position, new Vector(0, 2), size);
  }
}

class FireRain extends Fireball {
  constructor(position = new Vector(0, 0), speed, size) {
    super(position, new Vector(0, 3), size);
    this.basePos = position;
  }

  handleObstacle() {
    this.pos = this.basePos;
  } 
}

class Coin extends Actor {
  constructor(position = new Vector(0, 0), size, speed) {
    super(position.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6), speed);
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = rand(0, 2*Math.PI);
    this.basePos = this.pos;
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring = this.spring + (this.springSpeed * time);
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.basePos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

function rand(max = 10, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const dictionary = {
  '@': Player,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'v': FireRain
}

const parser = new LevelParser(dictionary);
loadLevels().then(function(strJson) {
  const schemas = JSON.parse(strJson);
  runGame(schemas, parser, DOMDisplay).then(() => alert('Вы победили!'));
});