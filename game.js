'use strict';

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(isVecor) {
		if (!(isVecor instanceof Vector)) {
				throw new Error('Можно прибавлять к вектору только вектор типа Vector');
		} else {
				return new Vector(this.x + isVecor.x, this.y + isVecor.y);
		}
	}

	times(multi) {
		return new Vector(this.x * multi, this.y * multi);
	}
}

class Actor {
	constructor(position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
		if ((position instanceof Vector) && (size instanceof Vector) && (speed instanceof Vector)) {
			this.pos = position;
			this.size = size;
			this.speed = speed;
		} else {
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

	isIntersect(isActor) {
		switch (isActor) {
			case undefined : 
				throw new Error('Метод принимает обязательный параметр!');
				break;
			case this :
				return false;
				break;
			default :
				
				if (!(isActor instanceof Actor)) {
					throw new Error('Метод принимает параметр типа Actor!');
				}	else {

					let toLeft, toRight, toTop, toBottom;
					toLeft   = ((this.left - isActor.right) >= 0);
					toRight  = ((isActor.left - this.right) >= 0);
					toTop    = ((this.top - isActor.bottom) >= 0);
					toBottom = ((isActor.top - this.bottom) >= 0);

					if (Math.abs(isActor.x + isActor.y) === (isActor.x + isActor.y)) {
						return false;
					} else if (toLeft || toRight || toTop || toBottom) {
						return false;
					} else {
						return true;
					}
				}
		}
	}
}

/*class Player extends Actor {
	constructor(speed, coords) {
		super(speed);
		this.position = coords.plus(new Vector(0, -0.5));
		this.size = new Vector(0.8, 1.5);
		this.type = 'player';
	}
}*/

class Level {
	constructor(grid = [], actors = []) {
		this.grid = grid;
		this.actors = actors;
		this.status = null;
		this.finishDelay = 1;
		this.height = grid.length;
		this.player = this.actors.find(function(isPlayer) {return isPlayer.type === 'player'});
		this.width  = this.grid.length == 0 ? 0 : Math.max.apply(null, this.grid.reduce(function(memo, el) {
			memo.push(el.length); 
			return memo;
		}, []));
	}

	isFinished() {
		return this.status !== null && this.finishDelay < 0 ? true : false;
	}

	actorAt(isActor) {
		if ((isActor === undefined) || !(isActor instanceof Actor)) {
			throw new Error('Метод принимает обязательный параметр типа Actor!');
		} else if (this.grid.length === 0 || this.actors.length < 2) {
			return undefined;
		}	else {
			let cross = undefined;
			for (let actor of this.actors) {
				if (actor.isIntersect(isActor)) {
					cross = actor;
					break;
				}
			}
			return cross;
		}
	}

	obstacleAt() {

	}
}



