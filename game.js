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

					const distance = Math.sqrt(Math.pow((isActor.left - this.left), 2) + Math.pow((isActor.top - this.top), 2));
					const isPositive = (Math.abs(isActor.x + isActor.y) === (isActor.x + isActor.y));
					
					if (!isPositive) {
						return false;
					} else {
						if (distance > 100) { /* очень далеко - это сколько?*/
							return false;
						} else if (distance == 1) { /* это если оба объекта размером 1*1, а если нет?*/
							return false;
						} else if (distance == 0) {
							return true;
						}
					}

				}
		}
	}
}
