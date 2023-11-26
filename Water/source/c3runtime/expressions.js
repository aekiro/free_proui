"use strict";

{
	self.C3.Behaviors.aekiroWater.Exps =
	{
		surfaceY(x){
			let segmentWidth = this.segmentWidth;
			if(this.useMesh){
				segmentWidth = this.wi.GetWidth()/(this.meshColumns-1);
			}

			const d = x - this.wi.GetBoundingBox().getLeft();
			const segmentIndex = Math.floor(d/segmentWidth);
			
			let y = 0;
			if(this.segments[segmentIndex]){
				y = this.segments[segmentIndex].quad.getTly();
			}else{
				y = this.wi.GetBoundingBox().getTop();
			}
			//console.log(x,d,segmentIndex,y);
			
			return y;
		},
		
		isAutoWaveEnabled(){
			return this.isAutowavesEnabled?1:0;
		},
		isSmoothingON(){
			return this.isSmoothingON?1:0;
		}
	};
}