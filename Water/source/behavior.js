"use strict";

{
	const SDK = self.SDK;

	////////////////////////////////////////////
	// The behavior ID is how Construct identifies different kinds of behaviors.
	// *** NEVER CHANGE THE BEHAVIOR ID! ***
	// If you change the behavior ID after releasing the behavior, Construct will think it is an entirely different
	// behavior and assume it is incompatible with the old one, and YOU WILL BREAK ALL EXISTING PROJECTS USING THE BEHAVIOR.
	// Only the behavior name is displayed in the editor, so to rename your behavior change the name but NOT the ID.
	// If you want to completely replace a behavior, make it deprecated (it will be hidden but old projects keep working),
	// and create an entirely new behavior with a different behavior ID.
	const BEHAVIOR_ID = "aekiroWater";
	////////////////////////////////////////////
	
	const BEHAVIOR_VERSION = "1.0.0.1";
	const BEHAVIOR_CATEGORY = "general";
	
	const BEHAVIOR_CLASS = SDK.Behaviors.aekiroWater = class aekiroWater_IBehaviorBase extends SDK.IBehaviorBase
	{
		constructor()
		{
			super(BEHAVIOR_ID);
			
			SDK.Lang.PushContext("behaviors." + BEHAVIOR_ID.toLowerCase());
			
			this._info.SetName(self.lang(".name"));
			this._info.SetDescription(self.lang(".description"));
			this._info.SetVersion(BEHAVIOR_VERSION);
			this._info.SetCategory(BEHAVIOR_CATEGORY);
			this._info.SetAuthor("Aekiro");
			this._info.SetHelpUrl(self.lang(".help-url"));
			this._info.SetIsOnlyOneAllowed(true);
			
			// Only support the newer C3 runtime
			this._info.SetSupportedRuntimes(["c3"]);
			
			SDK.Lang.PushContext(".properties");
			
			this._info.SetProperties([
				new SDK.PluginProperty("float", "tension", 0.025),
				new SDK.PluginProperty("float", "dampening", 0.025),
                new SDK.PluginProperty("float", "spread", 0.25),
				new SDK.PluginProperty("float", "segmentWidth", 4),
				new SDK.PluginProperty("combo", "smoothing", {initialValue:"no", items:["no","yes"]}),
				new SDK.PluginProperty("combo", "useMesh", {initialValue:"no", items:["no","yes"]}),
				new SDK.PluginProperty("integer", "meshColumns", 50),
				new SDK.PluginProperty("integer", "meshRows", 2),
				new SDK.PluginProperty("check", "isAutoWavesEnabled", false),
				new SDK.PluginProperty("integer", "waveLength", 150),
				new SDK.PluginProperty("float", "period", 2),
				new SDK.PluginProperty("integer", "magnitude", 2)
			]);
			
			SDK.Lang.PopContext();	// .properties
			
			SDK.Lang.PopContext();
		}
	};
	
	BEHAVIOR_CLASS.Register(BEHAVIOR_ID, BEHAVIOR_CLASS);
}