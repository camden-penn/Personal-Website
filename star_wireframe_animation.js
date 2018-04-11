/*
	Star Wireframe Animation
	------------------------
	Displays a large number of points (stars) on the body section of the page in which it is imported.
	Stars near to each other are connected by lines.
	The mouse counts as a star, and other stars gravitate to it.
	
	Code adapted from a minified script originally found on Amateria [ http://amateria.smashthestack.org:89 ],
	which was posted by an anonymous user. The original script has since been removed from the site.
	
	Author: Camden Penn [ https://github.com/camden-penn ]

*/


!function(){
	//CONFIGS
	//------------------------
		var canvas_z_index = -1;
		var canvas_opacity = .5;
		
		var animation_color = "99,99,99";
		
		var num_stars = 150; //WARNING: Set this too high and you'll really be feeling the lag.
		
		//How strongly the mouse attracts stars to itself.
		var gravitational_pull = 0.0004;
		
		//The maximum speed of a new star.
		var normal_star_max_speed = 1;
		
		
		//The square of the distance at which a point will notice nearby others.
		var star_effective_radius = 6e3;
		var mouse_effective_radius = 2e4;
		
		//Slows stars that are going faster than the normal max speed and are not near the mouse.
		//Prevents an inadvertent slingshot maneuver from sending the whole screen into chaos.
		//Increase to slow rogue stars faster.
		var friction = 0.01; 
	//------------------------
	
	function get_working_area_dimensions(){
		animation_canvas.width = window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
		animation_canvas.height=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;
	}
	function new_animation_frame(){
		//Clear the canvas.
		animation_context.clearRect(0,0,animation_canvas.width,animation_canvas.height);
		//Create vars for later.
		var point, proximity, delta_x, delta_y, euclidean_dist_squared, is_near_mouse;
		//Assemble a list of the points of interest (the mouse and all the stars).
		var points_of_interest = [mouse_location].concat(constellation);
		//For all stars in constellation:
		constellation.forEach(function(star){
			//Move star, according to its velocity.
			star.x+=star.x_velocity;
			star.y+=star.y_velocity;
			//Upon hitting canvas edge, bounce off.
			star.x_velocity *= star.x > animation_canvas.width || star.x<0?-1:1;
			star.y_velocity *= star.y > animation_canvas.height || star.y<0?-1:1;
			//Draw star, centered on its location.
			animation_context.fillRect(star.x-.5,star.y-.5,1,1);
			is_near_mouse = false;
			//For all points of interest:
			for(var index = 0; index < points_of_interest.length; index++){
				point = points_of_interest[index];
				//If the point of interest isn't the current star and is defined:
				if(star!==point && null!==point.x && null!==point.y){
					//Calculate distance between star and point.
					delta_x = star.x - point.x;
					delta_y = star.y - point.y;
					euclidean_dist_squared = delta_x*delta_x + delta_y*delta_y;
					
					//If they're within range of each other:
					if(euclidean_dist_squared < point.max){
						
						//If the point of interest is the mouse and
						//   the star is inside the mouse's radius of interest:
						//	 gravitate star towards the mouse.
						if(point === mouse_location && euclidean_dist_squared <= point.max){
							is_near_mouse =true;
							star.x_velocity-=gravitational_pull*delta_x;
							star.y_velocity-=gravitational_pull*delta_y;
						}
						
						//Calculate their proximity score.
						proximity=(point.max-euclidean_dist_squared)/point.max;
						
						//Draw a line between them:
						//-------------------------
						animation_context.beginPath();
						//Nearer points get thicker lines.
						animation_context.lineWidth = proximity/2;
						//Nearer points get darker lines.
						animation_context.strokeStyle = "rgba("+animation_color+","+(proximity+.2)+")";
						animation_context.moveTo(star.x,star.y);
						animation_context.lineTo(point.x,point.y);
						animation_context.stroke();
						//-------------------------
					}
				}
			}
			//If point isn't near the mouse and is going really fast, slow it down.
			if(!is_near_mouse){
				if(star.x_velocity>normal_star_max_speed){
					star.x_velocity-=friction;
				}
				if(star.x_velocity<-normal_star_max_speed){
					star.x_velocity+=friction;
				}
				if(star.y_velocity>normal_star_max_speed){
					star.y_velocity-=friction;
				}
				if(star.y_velocity<-normal_star_max_speed){
					star.y_velocity+=friction;
				}
			}
			//Remove star from points of interest [to avoid computing the same things twice].
			points_of_interest.splice(points_of_interest.indexOf(star),1);
		});
		request_animation_frame(new_animation_frame);
	}
	//Create the canvas.
	var animation_canvas=document.createElement("canvas");
	//Get its context for later use.
	var animation_context=animation_canvas.getContext("2d");
	
	//Force request_animation_frame() to be browser-agnostic. 
	var request_animation_frame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(n){window.setTimeout(n,1e3/45)};
	
	//Initialize mouse location.
	var mouse_location={x:null,y:null,max:mouse_effective_radius};
	
	//Set the canvas's ID.
	animation_canvas.id="star_wireframe_animation";
	
	//Set the canvas's CSS style.
	animation_canvas.style.cssText="position:fixed;top:0;left:0;z-index:" + canvas_z_index + ";opacity:"+canvas_opacity;
	
	//Attach canvas to the end of the body element.
	document.body.appendChild(animation_canvas);
	
	//Initialize available size.
	get_working_area_dimensions();
	
	//When the window resizes, get the new available canvas size.
	window.onresize=get_working_area_dimensions;
	
	//When the mouse moves, store its new location.
	window.onmousemove=function(n){n=n||window.event,mouse_location.x=n.clientX,mouse_location.y=n.clientY};
	
	//When the mouse leaves the area, null its location. 
	window.onmouseout=function(){mouse_location.x=null,mouse_location.y=null};
	
	//Create array of stars.
	var constellation=[];
	
	for(var s=0; s < num_stars; s++){
		//Create initial stats for a new star.
		var x_pos=Math.random()*animation_canvas.width;
		var y_pos=Math.random()*animation_canvas.height;
		var x_vel=(2*Math.random()-1)*normal_star_max_speed;
		var y_vel=(2*Math.random()-1)*normal_star_max_speed;
		//Add star to the constellation.
		constellation.push({x:x_pos,y:y_pos,x_velocity:x_vel,y_velocity:y_vel,max:star_effective_radius,color:null})
	}
	
	//Start the animation rolling.
	setTimeout(function(){new_animation_frame()},100)
}();