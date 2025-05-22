class AntPathfinding {    
    fetch_next_spot (x, y, direction){
        if (direction == null){
            return null;
        }
        let new_x = x + direction.x;
        let new_y = y + direction.y;
        return { x: new_x, y: new_y };
    }
    find(id, is_player, target_x, target_y){
        let ant = game.units.fetch(id, is_player);        
        let distance = fetch_distance(ant.x, ant.y, ant.base.x, ant.base.y);
        let tried = 0;
        let how_many_tries = distance * distance * distance;
        let current_path =  null; 
        //console.log(tried, how_many_tries, tried < how_many_tries)   
        while(tried < how_many_tries){            
            let potential_path = this.generate_path(id, is_player, target_x, target_y);  
            //console.log(tried, potential_path);
            if (potential_path != null && (current_path == null || potential_path.length < current_path.length)){
                current_path = potential_path;
                tried = 0;
            }
            tried ++;

        }
        if (current_path != null && current_path.length < 1){
            //console.log("EMPTY");
        }
        if (current_path != null){
           // console.log(ant.x, ant.y, current_path);
        }
        return current_path;
    }

    generate_path(id, is_player, target_x, target_y){
        let ant = game.units.fetch(id, is_player);
        let x = ant.x;
        let y = ant.y;        
        let potential_path = [];
       // console.log('pathfinder - generating path', x, y, target_x, target_y);
        let prev_direction = null;
        while(x != target_x || y != target_y){
            let distance = fetch_distance(x, y, target_x, target_y);
            let open_spots = game.map.fetch.open_spots(x, y, id, true);            
            //let next_spot = this.fetch_next_spot(x, y, prev_direction);
            let closer = []
            for (let spot of open_spots){
                let possible_distance = fetch_distance(x, y, spot.x, spot.y);
                let poss_direction = MapFetch.direction(x, y, spot.x, spot.y);
                if (prev_direction != null && poss_direction == prev_direction){
                    potential_path.push(spot);
                    x = spot.x;
                    y = spot.y;
                    continue;
                }
                if (possible_distance <= distance){
                    closer.push(spot);
                }
            }
            
            let rand = randNum(0, closer.length - 1);
            let spot = closer[rand];
            prev_direction = MapFetch.direction(x, y, spot.x, spot.y);
            //console.log(open_spots, rand, spot, potential_path, x, y, target_x, target_y);
            if (this.have_they_been_here(spot.x, spot.y, potential_path) || closer.length < 1){
                //console.log("generating null");
                return null;
            }
            
            potential_path.push(spot);
            x = spot.x;
            y = spot.y;
            //console.log(x, y, potential_path);
        }
        //console.log(potential_path)
        return potential_path;
    }

    go (id, is_player){
        let ant = game.units.fetch(id, is_player);
        if (ant.path == null){
            return null;
        }
        let next_spot = ant.path.shift();
        //console.log(ant.x, ant.y, next_spot, ant.path);
        if (ant.path.length < 1){
            ant.path = null;
        }
        let distance = Math.floor(fetch_distance(ant.x, ant.y, next_spot.x, next_spot.y));
        if (distance > 1 ){
            console.log("TOO FAR FROM PATH");
            return null;
        }
        return next_spot;
    }

    have_they_been_here(x, y, path){
        for (let spot of path){
            if (x == spot.x && y == spot.y){
                return true;
            }
        }
        return false;
    }

    where_to_go(id, is_player){
        let ant = game.units.fetch(id, is_player);
        //console.log(ant.exploring, ant.base);
        if (!ant.exploring ){
            return ant.base;
        } else if (ant.memory != null){
            return { x: ant.memory.x, y: ant.memory.y };
        }
        return null;
    }
}