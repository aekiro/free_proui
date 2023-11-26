"use strict";

{
	self.C3.Behaviors.aekiroWater.Acts =
	{
		applyForce(x,force,surface){
			let segmentWidth = this.segmentWidth;
			if(this.useMesh){
				segmentWidth = this.wi.GetWidth()/(this.meshColumns-1);
			}
			
			const quad = this.wi.GetBoundingQuad();
			const centerSegmentIndex = Math.floor((x-quad.getBlx())/segmentWidth); 
			surface = Math.floor((surface/segmentWidth)/2);
			var k;
			for (let index = -surface; index <= surface; index++) {
				k = centerSegmentIndex + index;
				if(this.segments[k]){
					this.segments[k].speed = force;
				}
			}
			
			if(!this.IsTicking()){
				this._StartTicking();
			}
		},
		
		SetAutoWavesEnabled(isEnabled){
			this.isAutowavesEnabled = isEnabled;	
		},
		SetSmoothing(isEnabled){
			this.isSmoothingON = isEnabled;	
		},
		SetDampening(v){
			this.dampening = v;
		},
		
		SetSpread(v){
			this.spread = v;
		},
		
		SetTension(v){
			this.tension = v;
		},
		

		SetWaveLength(v){
			this._waveLength = v;
		},
		SetPeriod(v){
			this._period = v;
		},
		SetMagnitude(v){
			this._mag = v;
		}
		
	};
}