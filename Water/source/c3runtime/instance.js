"use strict";

{
	const C3 = self.C3;
	
	
	const Segment = class {
		constructor(tlx, tly, trx, try_, brx, bry, blx, bly) {
		  this.height = 0;
		  this.speed = 0;
		  this.quad = new C3.Quad(tlx, tly, trx, try_, brx, bry, blx, bly);
		  
		  this._i = 0;
		}
	};
	
	
	const reducer = function (total, segment) {
		return total + segment.speed;
	};

	const _pi = Math.PI;
	const _2pi = 2 * Math.PI;
	const _pi_2 = Math.PI / 2;
    const _3pi_2 = 3 * Math.PI / 2;

	C3.Behaviors.aekiroWater.Instance = class aekiroWater_SDKBehaviorInstanceBase extends C3.SDKBehaviorInstanceBase
	{
		constructor(behInst, properties)
		{
			super(behInst);

			//water properties
			this.tension = 0.025;
			this.dampening = 0.025;
			this.spread = 0.25;
			this.segmentWidth = 4;
			
			this.isAutowavesEnabled = true;
			this._waveLength = 100;
			this._period = 2;
			this._mag = 2;
			
			if(!(this.GetObjectClass()._plugin instanceof C3.Plugins.TiledBg)){
				alert("The Water addon works only on Tiled Backgrounds !");
				return;
			}
			

			if (properties)
			{
				this.tension = properties[0];
				this.dampening = properties[1];
				this.spread = properties[2];
				this.segmentWidth = properties[3];
				this.isSmoothingON = properties[4];
				this.useMesh = properties[5];
				this.meshColumns = properties[6];
				this.meshRows = properties[7];
				
				this.isAutowavesEnabled = properties[8];
				this._waveLength = properties[9];
				this._period = properties[10];
				this._mag = properties[11];
				
			}
			//****************************************
			this.wi = this.GetWorldInfo();
			
			this.targetHeight = this.wi.GetHeight();
			this.lDeltas = [];
			this.rDeltas = [];			
			
			
			//Init segments
			let numberOfSegments = Math.round(this.wi.GetWidth()/this.segmentWidth);
			if(this.useMesh){
				 numberOfSegments = this.meshColumns;
			}
			
			this.segments = [];
			var segment;
			const targetHeight = this.targetHeight;
			for (let index = 0; index < numberOfSegments; index++) {
				segment = new Segment();
				segment.height = targetHeight;
				//segment._i = index;
				
				this.SetSegmentHeight(segment,index,targetHeight);
				this.segments.push(segment);
			}
			
			//init mesh
			if(this.useMesh){
				this.wi.CreateMesh(this.meshColumns, this.meshRows);
				
			}
			
			//****************************************
			//console.log(this.GetObjectInstance());
			//var inst = this.GetObjectInstance();
			
			

			//this._sinCosGenerator = sinCosGenerator(numberOfSegments,this._mag,this._mag,1/this._period);
		
			
			this.GetObjectInstance().GetUnsavedDataMap().aekiro_water = this;
		
			this._StartTicking();
			
				
		}
		
		PostCreate(){
			var inst = this.GetObjectInstance().GetSdkInstance();
			inst.segments = this.segments;
			inst.segmentWidth = this.segmentWidth;
			inst.SetSegmentHeight = this.SetSegmentHeight;
			inst.useMesh = this.useMesh;
			inst.rcTex = C3.New(C3.Rect);
			inst.qTex = C3.New(C3.Quad);
			inst.tempRect = C3.New(C3.Rect);
			inst.tempQuad = C3.New(C3.Quad);
			
			
			this.oldDraw = inst.Draw;
			this.old_DrawMesh = inst._DrawMesh;
			inst.Draw = this._Draw ;
			inst._DrawMesh = this._DrawMesh2 ;
			//console.log();
			
			this.wi.SetWidth_old2 = this.wi.SetWidth;
			this.wi.SetWidth = function(v){
				var prev = this.GetWidth();
				this.SetWidth_old2(v);
				if(v != prev){
					this.GetInstance().GetUnsavedDataMap().aekiro_water.OnSizeChanged();
				}
			};
			
			
			
		}

		OnSizeChanged(){
			if(this.useMesh){
				return;
			}
			const numberOfSegments = Math.round(this.wi.GetWidth()/this.segmentWidth);
			this.segments.length = 0;
			var segment;
			const targetHeight = this.targetHeight;
			for (let index = 0; index < numberOfSegments; index++) {
				segment = new Segment();
				segment.height = targetHeight;
				this.SetSegmentHeight(segment,index,targetHeight);
				this.segments.push(segment);
			}
		}
		
		
		Release(){
			//putting back the old draw, to avoid any memory leaks.
			var inst = this.GetObjectInstance().GetSdkInstance();
			inst.Draw = this.oldDraw;
			inst._DrawMesh = this.old_DrawMesh;
			this.oldDraw = null;
			this.old_DrawMesh = null;
			super.Release();
		}


		_Draw(renderer){
			//console.log("render");
			//return;
			
			const imageInfo = this.GetCurrentImageInfo();
			const texture = imageInfo.GetTexture();
			if (texture === null)
                return;
			renderer.SetTexture(texture);
			const imageWidth = imageInfo.GetWidth();
			const imageHeight = imageInfo.GetHeight();
			const imageOffsetX = this._imageOffsetX / imageWidth;
			const imageOffsetY = this._imageOffsetY / imageHeight;
			const wi = this.GetWorldInfo();
			const rcTex = this.rcTex;
			const qTex = this.qTex;
			let quad = wi.GetBoundingQuad();
			
			/*rcTex.set(0, 0, wi.GetWidth() / (imageWidth * this._imageScaleX), wi.GetHeight() / (imageHeight * this._imageScaleY));
			renderer.Quad3(quad, rcTex);
			return;*/

			if (this.useMesh){
			    rcTex.set(0, 0, wi.GetWidth() / (imageWidth * this._imageScaleX), wi.GetHeight() / (imageHeight * this._imageScaleY));
            	rcTex.offset(-imageOffsetX, -imageOffsetY);
				this._DrawMesh(wi, renderer);
			}else{
				this.segments.forEach((segment,index) => {
					//this.SetSegmentHeight(segment,index);
					rcTex.set(index*this.segmentWidth/(imageWidth* this._imageScaleX), 0, this.segmentWidth*(index+1) / (imageWidth * this._imageScaleX), wi.GetHeight() / (imageHeight * this._imageScaleY));
					rcTex.offset(-imageOffsetX, -imageOffsetY);
					
					if (this._runtime.IsPixelRoundingEnabled()){
						segment.quad = wi.PixelRoundQuad(segment.quad);
					}
					
					if (this._imageAngle === 0){
						renderer.Quad3(segment.quad, rcTex);
					}else {
						qTex.setFromRotatedRect(rcTex, -this._imageAngle);
						renderer.Quad4(segment.quad, qTex)
					}
					
				});
			}
				
				
		}
		
        _DrawMesh2(wi, renderer) {
			const rcTex = this.rcTex;
			const qTex = this.qTex;
			const tempQuad = this.tempQuad;
			const tempRect = this.tempRect;
			
            const transformedMesh = wi.GetTransformedMesh();
            if (wi.IsMeshChanged()) {
                wi.CalculateBbox(tempRect, tempQuad, false);
                let quad = tempQuad;
                if (this._runtime.IsPixelRoundingEnabled())
                    quad = wi.PixelRoundQuad(quad);
                let texCoords = rcTex;
                if (this._imageAngle !== 0) {
                    qTex.setFromRotatedRect(rcTex, -this._imageAngle);
                    texCoords = qTex
                }
                transformedMesh.CalculateTransformedMesh(wi.GetSourceMesh(), quad, texCoords);
                wi.SetMeshChanged(false)
            }
            transformedMesh.Draw(renderer);
        }		
		
		SetSegmentHeight(segment,index){
			
			//Autowaves
			let autowaveOffset = 0;
			if(this.isAutowavesEnabled){
				let segmentWidth = this.segmentWidth;
				if(this.useMesh){
					segmentWidth = this.wi.GetWidth()/(this.meshColumns-1);
				}
				const dt = this._runtime.GetDt(this._inst);
				if(dt){
					if (this._period === 0){
						segment._i = 0;
					}else{
						segment._i = (segment._i + dt / this._period * _2pi) % _2pi;
					}
					segment._i = segment._i % _2pi;
					autowaveOffset = Math.sin(segment._i+(_2pi/this._waveLength)*segmentWidth*index) * this._mag;
				}				
			}
				
			if(this.useMesh){
				const bboxBottom =  this.wi.GetBoundingBox().getBottom();
				const bboxTop =  this.wi.GetBoundingBox().getTop();

				const y = C3.unlerp(bboxTop, bboxBottom, bboxTop+ (this.targetHeight-segment.height) + autowaveOffset);


				const res = this.wi.SetMeshPoint(index, 0, {
					mode : "relative",
					x : 0,
					y : y
				});

				if(res){
					//console.log("az");
					this.wi.SetBboxChanged();
				}
			}else{
				const quad = this.GetWorldInfo().GetBoundingQuad();
				const bottom = quad.getBly();
				const left = quad.getTlx();
				let height = segment.height;

				height += autowaveOffset;
				
				
				//maxheight
				/*const maxHeight = 50;
				const padding = 5;
				if(index >= this.segments.length-padding){
					height = C3.clamp(height,0,this.targetHeight+maxHeight);
				}*/
				

				const seg_topLeft_x = left + index*this.segmentWidth;
				const seg_topRight_x = seg_topLeft_x + this.segmentWidth;
				const seg_topLeft_y = bottom - height;
				const seg_topRight_y = seg_topLeft_y;

				/*if(this.isSmoothingON && !this.useMesh){
					const nextSegment = this.segments[index+1];
					if(nextSegment){
						const nextHeight = bottom - nextSegment.height;
						if(nextHeight >= seg_topLeft_y)
							seg_topRight_y = bottom - nextSegment.height;
					}

					const prevSegment = this.segments[index-1];
					if(prevSegment){
						const prevHeight = bottom - prevSegment.height;
						if(prevHeight > seg_topLeft_y)
							seg_topLeft_y = bottom - prevSegment.height;
					}
				}*/


				segment.quad.set(seg_topLeft_x, seg_topLeft_y, seg_topRight_x, seg_topRight_y, seg_topRight_x, bottom, seg_topLeft_x, bottom);			
			}
			
		}

		
		smoothSegments(){
			this.segments.forEach((segment,index) => {
				const quad = this.GetWorldInfo().GetBoundingQuad();
				const bottom = quad.getBly();
				const left = quad.getTlx();
				//const height = segment.height;
				
				const seg_topLeft_x = left + index*this.segmentWidth;
				const seg_topRight_x = seg_topLeft_x + this.segmentWidth;
				//let seg_topLeft_y = bottom - segment.height;
				let seg_topLeft_y = segment.quad.getTly();
				let seg_topRight_y = seg_topLeft_y;

				const nextSegment = this.segments[index+1];
				if(nextSegment){
					if(segment.quad.getTry() >= nextSegment.quad.getTly())
						seg_topRight_y = nextSegment.quad.getTly()
				}

				const prevSegment = this.segments[index-1];
				if(prevSegment){
					if(segment.quad.getTly() > prevSegment.quad.getTry())
						seg_topLeft_y = prevSegment.quad.getTry();
				}
				


				segment.quad.set(seg_topLeft_x, seg_topLeft_y, seg_topRight_x, seg_topRight_y, seg_topRight_x, bottom, seg_topLeft_x, bottom);
			});
		}
		
		setSegmentHeight2(segment, height){
			const quad = segment.quad;
			quad.setTly(quad.getBly()-height);
			quad.setTry(quad.getBry()-height);
		}
		
		
		UpdateSegment(segment){
			const x = this.targetHeight - segment.height;
			segment.speed += this.tension*x - segment.speed*this.dampening;
			segment.height += segment.speed;
		}


		Tick(){
			const segments = this.segments;
			const numberOfSegments = segments.length;
			for (let i = 0; i < numberOfSegments; i++){
				this.UpdateSegment(segments[i],i);
			}
			

			
			
			//set heights of segments
			this.segments.forEach((segment,index) => {
				this.SetSegmentHeight(segment,index);
			});
			

			//clamping
			/*const padding = 10; //in pixels
			let k = Math.floor(padding/this.segmentWidth);
			let k_height = this.segments[k].height;
			let diff = k_height - this.targetHeight;
			if(diff>0.1){
				for (let i = 0; i < k; i++){
					//this.setSegmentHeight2(this.segments[i],this.targetHeight+i*(diff/k));
					this.setSegmentHeight2(this.segments[i],this.targetHeight+ (diff/Math.sqrt(8*k))*Math.sqrt(8*i));
				}
			}
			
			const l = this.segments.length-1;
			k = l-k;
			k_height = this.segments[k].height;
			diff = k_height - this.targetHeight;
			if(diff>0.1){
				for (let i = l; i > k; i--){
					this.setSegmentHeight2(this.segments[i],this.targetHeight+((l-i)/(l-k))*diff);
				}
			}*/

			
			if(this.isSmoothingON && !this.useMesh){
				this.smoothSegments();
			}
				
			
			const spread = this.spread;
			const lDeltas = this.lDeltas;
			const rDeltas = this.rDeltas;
			lDeltas.length = 0;
			rDeltas.length = 0;
			

			// do some passes where columns pull on their neighbours
			for (let j = 0; j < 7; j++){
				for (let i = 0; i < numberOfSegments; i++){
					if (i > 0){
						lDeltas[i] = spread * (segments[i].height - segments[i - 1].height);
						segments[i - 1].speed += lDeltas[i];
					}
					if (i < numberOfSegments - 1){
						rDeltas[i] = spread * (segments[i].height - segments[i + 1].height);
						segments[i + 1].speed += rDeltas[i];
					}
				}

				for (let i = 0; i < numberOfSegments; i++){
					if (i > 0){
						segments[i - 1].height += lDeltas[i];
					}
					if (i < numberOfSegments - 1){
						segments[i + 1].height += rDeltas[i];
					}
				}
			}
			

			this._runtime.UpdateRender();
			
			//for performance, stop ticking when water get still
			/*const sum = this.segments.reduce(reducer,0);
			if(Math.abs(sum) <= 0.001){
				console.log("stop_ticking");
				this._StopTicking();
			}*/
		
		}


		_SetMyProperty(n)
		{
			this._myProperty = 0;
		}

		_GetMyProperty()
		{
			return this._myProperty;
		}
		
		SaveToJson()
		{
			return {
				// data to store for savegames
			};
		}

		LoadFromJson(o)
		{
			// load state for savegames
		}
		

		GetScriptInterfaceClass()
		{
			return self.IMyBehaviorInstance;
		}
	};
	
	// Script interface for behavior instance
	const map = new WeakMap();
	
	self.IMyBehaviorInstance = class IMyBehaviorInstance extends self.IBehaviorInstance {
		constructor()
		{
			super();
			
			// Map by SDK instance
			map.set(this, self.IBehaviorInstance._GetInitInst().GetSdkInstance());
		}
		
		// Example setter/getter property on script interface
		set myProperty(n)
		{
			map.get(this)._SetMyProperty(n);
		}

		get myProperty()
		{
			return map.get(this)._GetMyProperty();
		}
	};
}