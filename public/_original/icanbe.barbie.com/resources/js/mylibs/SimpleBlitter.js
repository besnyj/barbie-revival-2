/**
* SimpleBlitter
* A JavaScript solution to control a spritesheet for
* complex animation sequences.
* 
* Copyright (c) 2011 Noel Tibbles (noel.tibbles.ca)
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>
**/
(function(window, document, undefined){
	SimpleBlitter = function(node, duration, vars) {
		
		if(!SimpleSynchro) throw "The SimpleSynchro.js script is required to run SimpleBlitter";
		this._currentTick = 0;
		this._currentFrame = 1;
		this._currentLoop = 1;
		this._currentRow = 1;
		this._currentCol = 1;
		this._callback = null;
		this._duration = duration;
		this._img = null;
		
		this._handleDataSuccess = function(xobj) {
			this._generateBlit();
			this._totalFrames = this.data.frames.count;
			this.FPS =  Math.round((60/this.data.frames.count)*duration) || 10;
		};
		
		this._hasNext = function() {
			return this._currentFrame < this.data.frames.count;
		};
		
		this._dispatch = function(evt) {
			if(this._callback && this._callback[evt]) this._callback[evt].call(this, {type:evt, tween: this});
		};
		
		this._generateBlit = function() {
			var holder = document.createElement("div");
			holder.id = "blit_holder"+this.UID;
			holder.style.width = this.data.frames.width+"px";
			holder.style.height = this.data.frames.height+"px";
			holder.style.overflow = "hidden";
			holder.style.position = "relative";
			
		
			this._img = new Image(), 
			this._img.src = this.data.images[0];
			this._img.style.position = "relative";
			this._img.style.padding = "0";
			this._img.style.margin = "0";
			holder.appendChild(this._img);
			document.getElementById(this.target).appendChild(holder);
			
			this.totalWidth = this.data.frames.width*this.data.frames.count;
			
			if(!this.isPaused) this.start();
		};
		
		this.initialize(node, duration, vars);
	};
	
	var p = SimpleBlitter.prototype;
		p.data = {};
		p.target = null;
		p.FPS = 10;
		p.totalWidth = 0;
		p.totalLoops = 1;
		p.currentFrame = 1;
		p.isPlaying = false;
		p.isPaused = false;
		p.UID = 0;
		
	p.initialize = function(node, duration, vars){
		if(vars) {
			this.totalLoops = vars.loop || 1;
			this.dataPath = vars.data || null;
			this.isPaused = vars.pause || false;
			this._callback = vars.callback || null;
		};
		
		//console.log("init: ",this.totalLoops);
		this.UID = SimpleBlitter.getUID();
		this.target = node;
		
		//changed by slamont, 03.08.12 to eliminate load of sparkle.json every time this was called; improve performance
		p.data = {"images": ["/resources/img/blit/sparkle.png"], "frames": {"count": 18, "width": 27, "height": 29, "regX": 0, "regY": 0}, "animations": {"all": [0, 17]}};
		this._handleDataSuccess(null);
	//	if(this.dataPath) this.loadData(this.dataPath); 
	};
	
	p.loadData = function(path){
		var xobj = new XMLHttpRequest(), me = this;
	    xobj.open('GET', path, true);
	    xobj.onreadystatechange = function() {
	    	if(xobj.readyState == 4) {
	    		p.data = JSON.parse(xobj.responseText);
	    		me._handleDataSuccess.call(me, xobj);
	    	}
	    }
	    xobj.send(null);
	};
	
	p.next = function() {
		if(this._hasNext() && this.isPlaying){
			var newX = this._currentCol * this.data.frames.width;

			if(newX > this._img.width - 5) {
				this._currentCol = 0;
				newX = 0;
				if(this._currentFrame < this.data.frames.count) {
					this._img.style.top = -(this.data.frames.height*this._currentRow)+"px";
					this._currentRow++;
				};
			} 
			this._img.style.top = "0px";
			this._img.style.left = -(newX)+"px";
			
			this._currentFrame++;
			this._currentCol++;
		} else {
			this._img.style.left = "0px";
			this._img.style.top = "0px";
			
			if(this._currentLoop < this.totalLoops || this.totalLoops < 0) {
				this.reset();
				this._currentLoop++;
				this._dispatch("onLoop");
			} else {
				this.reset();
				this.isPlaying = false;
				this.isComplete = true;
				SimpleSynchro.removeListener(this);
				this._dispatch("onComplete");
			}
		}
	};
	
	p.start = function() {
		this.isPlaying = true;
		this.isComplete = false;
		this.isPaused = false;
		this._dispatch("onStart");
		SimpleSynchro.addListener(this);
		
		return this;
	};
	
	p.pause = function() {
		SimpleSynchro.removeListener(this);
		this._dispatch("onPause");
		this.isPaused = true;
	};
	
	p.reset = function() {
		this._currentLoop = 1;
		this._currentCol = 1;
		this._currentRow = 1;
		this._currentFrame = 1;
	};
	
	p.gotoFrame = function(frame) {
		this.img.style.left = -(frame*this.data.frames.width)+"px";
	};

	p.tick = function() {
		if(this._currentTick >this.FPS) {
			this.next();
			this._currentTick = 0;
		};
		
		this._currentTick++;
	};
	
	p.toString = function() {
		return "[object SimpleBlitter "+this.UID+"]";
	};
	
	SimpleBlitter.ID = 0;
	SimpleBlitter.create = function(node, duration, vars) {
		return new SimpleBlitter(node, duration, vars);
	};
	
	SimpleBlitter.getUID = function() {
		return SimpleBlitter.ID++;
	};
	
	window.SimpleBlitter = SimpleBlitter;
}(window, document, undefined));