'use strict';

function rand(min, max) {
  // почему ceil?
  // зачем прибавлять единицу, а потом отнимать?
  return Math.ceil((max - min + 1) * Math.random()) + min - 1;
}

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
        // разное форматирование (4 пробела, а дальше 2)
        throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    // else можно убрать
    // если будет выброшено исключение,
    // то функция прекратит свою работу
    } else {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
  }

  times(multi) {
    return new Vector(this.x * multi, this.y * multi);
  }
}

class Actor {
  // не опускайте аргументы конструктора
  // если кто-нибудь изменит значения аргументов по-умолчанию,
  // ваш код перестанет работать
  constructor(position = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
    if ((position instanceof Vector) && (size instanceof Vector) && (speed instanceof Vector)) {
      this.pos = position;
      this.size = size;
      this.speed = speed;
    } else {
      // проверку аргументов лучше делать в начале функции,
      // а потом писать основной код
      throw new Error('Один из параметров не является объектом типа Вектор');
    }
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
    // переделать на if (непонятно зачем тут switch)
    switch (actor) {
      case undefined : 
        throw new Error('Метод принимает обязательный параметр!');
        // если в case throw или return, то break можно не писать
        break;
      case this :
        return false;
        break;
      default :
        
        if (!(actor instanceof Actor)) {
          throw new Error('Метод принимает параметр типа Actor!');
        // else можно убрать
        } else {

          // не форматируйте никогда так код
          // первый же автоформат убьёт всё это и будут лишние изменения в гите
          // зачем вычитать если можно просто сравнить числа?
          const toLeft   = ((this.left - actor.right) >= 0);
          // если объект левее, то уже понятно,
          // что он не пересекается с заданным и дальше считаь ничего не нужно
          const toRight  = ((actor.left - this.right) >= 0);
          const toTop    = ((this.top - actor.bottom) >= 0);
          const toBottom = ((actor.top - this.bottom) >= 0);
          // что это за проверка?
          const negative = ((actor.pos.x === this.pos.x && actor.pos.y === this.pos.y) && (Math.abs(actor.size.x + actor.size.y) !== (actor.size.x + actor.size.y)));
          /*const negative = ((actor.pos.x === this.pos.x && actor.pos.y === this.pos.y) && (actor.size.x < 0 || actor.size.y < 0));*/

          // тут нужно обратить условие и убрать if
          // (написать просто return ...)
          if (negative || toLeft || toRight || toTop || toBottom) {
            return false;
          } else {
            return true;
          }
        }
    }
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.status = null;
    this.finishDelay = 1;
    this.height = grid.length;
    // тут лучше использовать стрелочную функцию
    this.player = this.actors.find(function(player) {return player.type === 'player'});
    // не используйте ==
    // это можеет привести к ошибкам
    // используйте ===
    // вместо .apply можно использовать возможности ES6
    // вместо проверки this.grid.length
    // можно просто добавить 0 в список аргументов Math.max
    // Math.max и reduce тут используются неправильно, посмотрите внимательно
    this.width  = this.grid.length == 0 ? 0 : Math.max.apply(null, this.grid.reduce(function(memo, el) {
      memo.push(el.length); 
      return memo;
    }, []));
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0 ? true : false;
  }

  actorAt(actor) {
    // первая половина проверки лишняя
    if (actor === undefined || !(actor instanceof Actor)) {
      throw new Error('Метод принимает обязательный параметр типа Actor!');
    } 
    /*else if (this.grid.length === 0 || this.actors.length < 2) {
      return undefined;
    } else {*/
    // лучше стрелочная функция
    return this.actors.find(function(cross) {return cross.isIntersect(actor);});
    /*}*/
  }

  obstacleAt(finalPos = new Vector(), sizeAct = new Vector(1, 1)) {
    /* проверим на принадлежность классу */
    if (!(finalPos instanceof Vector) && !(sizeAct instanceof Vector)) {
      throw new Error('Параметры должны быть класса Vector');
    }

    // вы создаёте объект только для того, чтобы 2 раза сложить 2 числа
    // можно обойтись без него
    const finalActor = new Actor(finalPos, sizeAct);/* определим результирующий дв. объект */
    const outLeft = finalActor.left < 0; /* если выпирает слева */
    const outTop = finalActor.top < 0; /* если выпирает сверху */
    const outRight = finalActor.right > this.width; /* если выпирает справа */
    const outBottom = finalActor.bottom > this.height; /* если выпирает снизу */

    if (outBottom) { /* если выступает снизу - лава */
      return 'lava';
    // else можно убрать
    } else if (outLeft || outTop || outRight) { /* слева снизу справа - валл*/
      return 'wall';
    }

    // лишняя переменная
    let cellValue = undefined; /* сюда будем искать значение ячейки из grid */
    
    /* обойдем всю площадь по точкам и посмотрим нет ли в сетке препятствия */
    // округлённые значения лучше сохранить в переменных,
    // чтобы не округлять на каждой итерации
    for (let y = Math.floor(finalActor.top); y < Math.ceil(finalActor.bottom); y++) {
      for (let x = Math.floor(finalActor.left); x < Math.ceil(finalActor.right); x++) {
        // this.grid[y][x] лучше записать в переменную, чтобы 2 раза не писать
        if (this.grid[y][x]) { /* если что-то нашлось помимо undefined */
          // почему не вернуть значение здесь
          cellValue = this.grid[y][x]; /* запишем в переменную и прервем цикл */
          break;
        } 
      }
      if (cellValue) { /* т.к у нас есть верхнеуровневый цикл - надо и его прервать, тк мы нашли что искали */
        break;
      }
    }
    return cellValue; /* иначе либо валл либо лава  либо */
  }

  removeActor(actor) {
    // поиск объекта в массиве осуществляется 2 раза
    // нужно сделать, чтобы был 1
    if (this.actors.includes(actor)) {
      const indexDel = this.actors.indexOf(actor);
      this.actors.splice(indexDel, 1);
    }
  }

  noMoreActors(actorType) {
    // тут лучше использовать метод, который возвращает true/false
    const desired = this.actors.find(function(actor) {
      return actor.type === actorType;
    });
    return desired === undefined ? true : false;
  }

  // значение по-умолчанию по-моему лишнее
  playerTouched(obstacleOrType, touched = new Actor()) {
    // если обратить условие и написать в if return,
    // уменьшится вложенность кода
    if (this.status === null) {
      if (obstacleOrType === 'lava' || obstacleOrType === 'fireball') {
        this.status = 'lost';
      } else if (obstacleOrType === 'coin' && touched.type === 'coin') {
        this.removeActor(touched);
        if (this.noMoreActors(touched.type)) {
          this.status = 'won';
        }
      }
    }
  }
}

class LevelParser {
  constructor(dictionary = {}) {
    this.dictionary = dictionary;
  }

  actorFromSymbol(char) {
    return this.dictionary[char];
  }

  obstacleFromSymbol(char) {
    // лучше сделать полем класса, или вынести за его пределы,
    // чтобы при каждом вызове не создавать объект
    const mapping = {
      'x' : 'wall',
      '!' : 'lava'
    };
    return mapping[char];
  }

  createGrid(arrayStrings = []) {
    // этот метод можно упростить использовав метод map 2 раза
    const grid = [];
    for (let currString of arrayStrings) {
      // для преобразования строки в массив лучше использовать split
      // (так понятно, что работаем со строкой)
      grid.push(Array.from(currString, function(x, i) {
        // не нужно создавать новый объект
        return new LevelParser().obstacleFromSymbol(x);
      }));
    }
    return grid;
  }

  createActors(arrayStrings = []) {
    // плохое название переменной
    const mass = [];
    for (let y = 0; y < arrayStrings.length; y++) {
      for (let x = 0; x < arrayStrings[y].length; x++) {
        // если значение присваивается переменной 1 раз,
        // то лучше использовать const
        let Constr = this.actorFromSymbol(arrayStrings[y][x]);
        if (typeof Constr === 'function') {
          // const
          let newObj = new Constr(new Vector(x, y));
          if ((newObj instanceof Actor)) {
            mass.push(newObj);
          }
        }
      }
    }
    return mass;  
  }

  parse(arrayStrings = []) {
    return new Level(this.createGrid(arrayStrings), this.createActors(arrayStrings));
  }
}

class Player extends Actor {
  // не опускайте аргумента конструктоар Vector
  constructor(position = new Vector()) {
    super();
    // pos, size, speed должены задаваться через родительский конструктор
    this.pos = position.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
  }

  get type() {
    return 'player';
  }
}

class Fireball extends Actor {
  // не опускайте аргумента конструктоар Vector
  constructor(position = new Vector(), speed = new Vector()) {
    // pos, size, speed должены задаваться через родительский конструктор
    super();
    this.pos = position;
    this.speed = speed;
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    // лишнее создание вектора
    return new Vector(this.pos.x, this.pos.y).plus(this.speed.times(time));
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
  // не опускайте аргумента конструктоар Vector
  constructor(position = new Vector()) {
    // pos, size, speed должены задаваться через родительский конструктор
    super();
    this.pos = position;
    this.speed = new Vector(2, );
  }
} 

class VerticalFireball extends Fireball {
  // не опускайте аргумента конструктоар Vector
  constructor(position = new Vector()) {
    super();
    // pos, size, speed должены задаваться через родительский конструктор
    this.pos = position;
    this.speed = new Vector(0, 2);
  }
}

class FireRain extends Fireball {
  // не опускайте аргумента конструктоар Vector
  constructor(position = new Vector()) {
    super();
    // pos, size, speed должены задаваться через родительский конструктор
    this.pos = position;
    this.speed = new Vector(0, 3);
    this.basePos = position;
  }

  handleObstacle() {
    this.pos = this.basePos;
  } 
}

class Coin extends Actor {
  // не опускайте аргумента конструктоар Vector
  constructor(position = new Vector()) {
    super();
    // pos, size, speed должены задаваться через родительский конструктор
    this.pos = position.plus(new Vector(0.2, 0.1));
    this.size = new Vector(0.6, 0.6);
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
    // лишнее создание ветора
    return new Vector(this.basePos.x, this.basePos.y).plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
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