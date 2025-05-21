class Map {
	fetch = new MapFetch();
    blocked = []   	
    food = [];
    grow_ticks = [];
	revealed = []
  	scent = []
	trail = [];
    static max_x = 32;
    static max_y = 32;
    scent_decay = 1
    base = null;   
	op_base = null;
    trail_decay = {
		ants: [],
		ops: [],

	};
    constructor(){
        let generated = MapGenerator.generate(Map.max_x, Map.max_y);
		this.base = generated.base;
		this.op_base = generated.op_base;
		for (let map_type in generated.map){
			this[map_type] = generated.map[map_type];
		}
		this.reveal_adjacent(this.base.x, this.base.y);
	}
	add_scent(x, y, is_player){
        if (is_player){
            game.map.scent[x][y]  += game.config.scent_add;
            return;
        }
        game.map.scent[x][y] -= game.config.scent_add;
    }
	add_trail(id, is_player, x, y){
		let type = "ops";
		if (is_player){
			type = 'ants';
		}
		let their_trail = this.trail_decay[type][id];		
		this.trail_decay[type][id][this.trail_decay[type][id].length - 1].push({ x: x, y: y });
	}

	draw_trail(){
		for (let type in this.trail_decay){
			for (let id in this.trail_decay[type]){
				for (let trail of this.trail_decay[type][id]){
					for (let spot of trail){
						this.trail[spot.x][spot.y] = 1;
					}
				}
			}
		}		
	}


	food_grows(){
		for (let x=0; x < Map.max_x; x++){			
			for (let y=0; y < Map.max_y; y++){
				let n = this.food[x][y]
				if (n == 0){
					continue;
				}
				let does_it_grow = randNum(1, n) == 1
				if (does_it_grow){
					this.food[x][y] = Math.round(MapGenerator.food_growth_rate * this.food[x][y]);
				}
			}
		}
	}

	static is_not_valid_space(x, y){
		return x < 0 || y < 0 || x >= Map.max_x || y >= Map.max_y;
	}

	static is_orthogonal(x1, y1, x2, y2){
		let direction = this.fetch.direction(x1, y1, x2, y2);
		if (direction.x == 0 || direction == 0){
			return true;
		}
		return false;
	}

	reveal_adjacent (x, y){		
		this.revealed[x][y] = 1		
		for (let new_x = x - 1; new_x <= x + 1 ;  new_x ++){
			
			for (let new_y = y - 1; new_y <= y + 1 ;  new_y ++){
				if (new_x < 0 || new_x >= Map.max_x || new_y < 0 || new_y >= Map.max_y){
					continue
				}
				this.revealed[new_x][new_y] = 1
			}	
		}
	}    

	scent_decays(){
		for (let x = 0; x < Map.max_x; x++){
			for (let y = 0; y < Map.max_y; y++){
				if (this.scent[x][y] == 0){
					continue

				} else if (this.scent[x][y] > 0){
					this.scent[x][y] -= this.scent_decay
					continue;
				}
				this.scent[x][y] += this.scent_decay
				
			}
		}
	}

	trail_decays(){
		for (let type in this.trail_decay){
			for (let id in this.trail_decay[type]){
				let ant_trail = this.trail_decay[type][id];
				if (ant_trail.length == 1){
					continue;
				}
				let space = ant_trail[0].splice(0, 1)[0];
				this.trail[space.x][space.y] = 0;
				if (ant_trail[0].length == 0){
					ant_trail.splice(0, 1);
				}
			}
		}
	}

	spawn_food(x, y){
		this.food.push({quantity: randNum(MapGenerator.food_min, MapGenerator.food_max), x: x, y: y})
	}

}