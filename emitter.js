// shim layer with setTimeout fallback
window.requestAnimFrame = window.requestAnimFrame || (function(){
	return window.requestAnimationFrame	|| 
		window.webkitRequestAnimationFrame	|| 
		window.mozRequestAnimationFrame		|| 
		window.oRequestAnimationFrame		|| 
		window.msRequestAnimationFrame		|| 
		function(callback){
			window.setTimeout(callback, 1000 / 60);
			};
	})();

// Basic particle constructor
function particle(e){
	this.x = 0;
	this.y = 0;
	this.xi = 1; // x direction
	this.yi = 0.2; // y direction
	this.xg = 0; // x gravity
	this.yg = 0; // y gravity
	this.size = 7;
	this.scale = 1.0;
	this.life = e.life * (Math.random() + 1) * 1000;
	this.created = new Date().getTime();
	this.seed = (Math.random() - 0.5) * 0.8;
	};



// Emitter constructor - e.g. """new emitter({x:10, y:20, particle: myparticle})"""
function emitter(options){
	var defaults = {
		x: 0,
		y: 0,
		max_particles: 200,
		per_second: 3,
		life: 1,
		shape: 'point',
		radius: 15,
		w: 20,
		h: 20,
		
		f_step: function(p){
			var ms = new Date().getTime();
			
			if (ms >= p.created + p.life) {
				return false;
				}
				
			p.y += 1;
			p.x = p.x + Math.sin((p.y / Math.PI) * (p.seed)) * 2;
			
			return true
			},
		
		f_render: function(p){
			this.beginPath();
			this.arc(p.x, p.y, 3 * p.scale, 0, 2 * Math.PI);
			this.fill();
			this.stroke();
			},
			
		};
	
	// Random rectangular coordinates
	function rect(w, h){
		return {x: w * Math.random(), y: h * Math.random()};
		}
	
	// non uniform distrobution of random coordinates
	function circle(radius){
		var theta = Math.random() * Math.PI * 2;
		var length = Math.random() * radius;
		
		return {x: Math.cos(theta) * length, y: Math.sin(theta) * length};
		}
	
	// Uniformly random coordinate inside circle
	function ucircle(radius){
		var r = radius * Math.sqrt(Math.random());
		var theta = 2 * Math.PI * Math.random();
		
		return {x: r * Math.cos(theta), y: r * Math.sin(theta)};
		}
	
	// setup the basic emitter settings, filling any gaps
	var e = $.extend({}, defaults, options);
	
	
	this.particles = [];
	
	var num_p = 0; // number of particles in the scene
	var frame = 1;
	var ppf = e.per_second / 60; // penguins per frame
	var pets = 0; // penguins emitted this second
	this.x = e.x;
	this.y = e.y;

	// not to be confused with this.particles
	this.particle = e.particle || particle;
	
	
	// function that returns the starting points of each particle
	var get_pos;
	if (e.shape == 'rect'){
		// its a square!           ...  maybe
		get_pos = function(){return rect(e.w, e.h)};
	} else if (e.shape == 'circle') {
		// center centric placement within given radius
		get_pos = function(){return circle(e.radius)};
	} else if (e.shape == 'ucircle') {
		// uniform placement throughout circle area
		get_pos = function(){return ucircle(e.radius)};
	} else if (typeof(e.shape) == 'function') {
		// custom shape function - simply pass in a function as 'shape'
		get_pos = e.shape;
	} else { 
		// single point - always return 0 offset from emitter
		get_pos = function(){return {x: 0, y: 0}};
		}
		
		
	
	
	this.translate = function(nx, ny){
		this.x = nx || this.x;
		this.y = ny || this.y;
		};
	
	
	
	this.generate = function(){
		
		this.particles = this.particles.filter(e.f_step);
		num_p = this.particles.length;
		
		if(num_p >= e.max_particles) return 0;
		
		// calculate total particles that should have been emitted by now
		var new_pets = frame * ppf
		var pte = Math.floor(new_pets - Math.floor(pets)); // particles to emit (this frame)
		
		
		// emit
		for(var i = 0; i < pte; i++){
			var p = new this.particle(e);
			var pos = get_pos();
			p.x = pos.x + this.x;
			p.y = pos.y + this.y;
			this.particles.push(p);
			}
		
		// save the number of particles emitted so far for the next go around
		pets = new_pets;
		
		if (frame >= 60) {
			frame = 1;
			pets = 0;
		} else {
			frame++;
			}
		
		return pte; // particles emitted this frame
		};
		
		
		
	this.render = function(ctx){
		ctx.save();
		
		this.particles.map(e.f_render, ctx);
		
		ctx.restore();
		};
		
	
	}
	