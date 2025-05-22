class AntGoing {
    fighting = new AntFighting();
    moving = new AntMoving();

    eat_food(id, is_player){
        let ant = game.units.fetch(id, is_player);
        let food_to_eat = ant.moves;
        if (food_to_eat > game.map.food[ant.x][ant.y]){
            food_to_eat = game.map.food[ant.x][ant.y];
        }
        game.map.food[ant.x][ant.y] -= food_to_eat;
        ant.moves -= food_to_eat;
    }

    go(id, is_player){ 
        let ant = game.units.fetch(id, is_player);
        if (!ant.alive){
            console.log("THEYRE DEAD");
            return;
        }
        if (ant.in_heat == 0 && randNum(1, game.config.chance_to_be_in_heat) == 1){
            ant.in_heat = game.config.in_heat_time;
        } else if (ant.in_heat > 0){
            ant.in_heat --;
        }
        game.map.add_scent(ant.x, ant.y, is_player); 
        if (ant.female && ant.in_heat != 0 && game.units.is_male_here(ant.x, ant.y, is_player)){
            game.units.reproduce(is_player, ant.x, ant.y, false);
            ant.in_heat = false;
        }
        if (this.fighting.enemy(id, is_player)){
            return;
        } 
        
        if (is_player && this.grow(id, is_player)){
            return;
        } 
        if (this.moving.around(id, is_player)){
            return;
        }
        this.pick_up_food(id, is_player);                
        if (ant.memory != null && ant.x == ant.memory.x && ant.y == ant.memory.y
            && ((is_player &&  game.map.food[ant.x][ant.y] < game.config.min_harvest)
            || (!is_player && game.map.food[ant.x][ant.y] < 1))
            && ant.memory.what == 'food'){
            ant.memory = null;
        }

    }

    grow(id, is_player){
        let ant = game.units.fetch(id, is_player);
        let distance_to_base = fetch_distance(ant.x, ant.y, ant.base.x, ant.base.y);
        let num_of_adjacent_farms = game.map.fetch.num_of_adjacent_farms(ant.x, ant.y);
        if (ant.growing == 0 
            || (distance_to_base >= 2 && num_of_adjacent_farms == 0)
            || (game.map.grow_ticks[ant.x][ant.y] != null 
            && game.ticks - game.map.grow_ticks[ant.x][ant.y] < game.config.grow_cycle)
            || (ant.base.x == ant.x && ant.base.y == ant.y)){
            return false;
        }
        let can_they_farm = randNum(1, ant.farmed_prev + 1) == 1; //distance_to_base < 2 || num_of_adjacent_farms > 0;
        if (!can_they_farm){
            ant.farmed_prev = 0;
            return;
        }
        
        let rand = randNum(1, game.config.min_harvest * (game.config.upgrade_levels.growing - 1));
        if (rand > this.carrying){
            return false;
        }
        ant.farmed_prev ++;
        ant.carrying -= rand;
        game.map.grow_ticks[ant.x][ant.y] = game.ticks;
        game.map.food[ant.x][ant.y] += rand;
    }

    pick_up_food(id, is_player){
        let ant = game.units.fetch(id, is_player);
        if (game.map.food[ant.x][ant.y] < 1){
            return;
        }        
        this.eat_food(id, is_player);
        
        if (game.map.food[ant.x][ant.y] < 1){
            return;
        }
        let amount_you_can_carry = ant.max_carrying - ant.carrying
        if (amount_you_can_carry > game.map.food[ant.x][ant.y]){
            amount_you_can_carry = game.map.food[ant.x][ant.y];
        }
        if ((is_player && game.map.food[ant.x][ant.y]>= game.config.min_harvest) || !is_player){
            ant.carrying += amount_you_can_carry;
            game.map.food[ant.x][ant.y] -= amount_you_can_carry;
        }
        if (ant.carrying >= ant.max_carrying && ant.exploring){
            ant.exploring = false;
            game.units.adjust_avg_distance(fetch_distance(ant.x, ant.y, ant.base.x, ant.base.y), is_player);

            this.moving.clear_history(id, is_player);
        }
    }

    
}
