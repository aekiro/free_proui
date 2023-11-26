"use strict";

{
	const SDK = self.SDK;

	const BEHAVIOR_CLASS = SDK.Behaviors.aekiroWater;
	
	BEHAVIOR_CLASS.Type = class aekiroWater_IBehaviorTypeBase extends SDK.IBehaviorTypeBase
	{
		constructor(sdkPlugin, iBehaviorType)
		{
			super(sdkPlugin, iBehaviorType);
		}
	};
}