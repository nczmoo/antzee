class AntMoving {
    exploring = new AntExploring();
    returning = new AntReturning();
    history = [];

    add_to_history(x, y){
        this.history.push( { x:x, y: y } );
    }

    around(id, is_player){
        let ant = game.units.fetch(id, is_player);
        let space = null;
        if (ant.memory != null && ant.x == ant.memory.x && ant.y == ant.memory.y){
            ant.memory = null;
        }
        let food_search = this.search_for_food(id, is_player);
        if (food_search.quantity == 0 
            || (ant.memory != null && ant.memory.what != 'food' 
            && is_player && food_search.quantity < game.config.min_harvest)){
            
        } else if (ant.memory == null
            || ((!is_player && ant.memory != null && food_search.quantity > ant.memory.quantity)            
            && (ant.exploring && ant.memory != null && food_search.quantity > ant.memory.quantity * 2)
            || (!ant.exploring && ant.memory != null && food_search.quantity > ant.memory.quantity))){
            ant.add_memory(food_search.x, food_search.y, 'food', food_search.quantity);
        }
        if (ant.exploring){
            space = this.exploring.world(id, is_player);            
        } else {
            space = this.returning.home(id, is_player);           
        }               
        if (space == undefined){
            console.log(space); 
        }
        ant.x = space.x;
        ant.y = space.y;
        game.map.add_trail(id, is_player, ant.x, ant.y);
        game.map.trail[ant.x][ant.y] = -1;
        if (is_player){
            game.map.trail[ant.x][ant.y] = 1;
            game.map.reveal_adjacent(ant.x, ant.y)
        }
        ant.moves ++;        
        if (ant.x == ant.base.x && ant.y == ant.base.y){
            ant.health = ant.max_health;
            ant.stock_inventory()
            ant.moves = 0;
            ant.exploring = true;
            this.clear_history(id, is_player);
        }
        
    }

    clear_history(id, is_player){
        let type = "ops";
        if (is_player){
            type = "ants";
        }
        game.map.trail_decay[type][id].push([]);
        this.history = [];
    }


    have_they_been_here(x, y, at_all){
        if (this.history.length == 0){
            return false;
        }
        if (at_all){
            for (let spot of this.history){
                if (spot.x == x && spot.y == y){
                    return true;
                }
            }
        }
        for (let spot_id = this.history.length - 1; spot_id > Math.round(this.history.length / 2); spot_id --){
            let spot = this.history[spot_id];
            if (spot.x == x && spot.y == y){
                return true;
            }
        }
        return false;
    }
    
    is_in_direction_of_memory(x, y, memory, direction){        
        let memory_direction = MapFetch.direction (x, y, memory.x, memory.y);
        if (memory_direction.x == direction.x && memory_direction.y == direction.y){
            return true;
        }
        return false;
    }
    is_in_any_direction_of_memory(x, y, memory, direction){        
        let memory_direction = MapFetch.direction (x, y, memory.x, memory.y);
        if (memory_direction.x == direction.x || memory_direction.y == direction.y){
            return true;
        }
        return false;
    }

    is_in_history (x, y){
        for (let space of this.history){
            if (space.x == x && space.y == y){
                return true;
            }
        }
        return false;
    }

    search_for_food(id, is_player){
        let ant = game.units.fetch(id, is_player);
        let search = { x: null, y: null, quantity: 0 }
        let range = ant.see_range;
        for (let x = ant.x - range; x <= ant.x + range; x ++ ){
            for (let y = ant.y - range; y <= ant.y + range; y ++ ){        
                if (Map.is_not_valid_space(x, y) 
                    || (is_player && game.map.food[x][y] < game.config.min_harvest)){
                    continue;
                }
                if (game.map.food[x][y] > search.quantity){
                    search.x = x;
                    search.y = y;
                    search.quantity = game.map.food[x][y]
                }
            }
        }
        return search;
    }
    
}