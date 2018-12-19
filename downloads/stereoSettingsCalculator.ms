(
try (DestroyDialog STEREOSETTINGS)catch()	
	
rollout STEREOSETTINGS "stereoSettingsCalculator v0.3" width:280 height:410
(		
	label lbl_Viewport "Selected Viewport"  align:#center height:20 	
	button btn_Refresh "Refresh Camera View" align:#center	width:150 height:30
	bitmap bmp_StatusColour bitmap:(bitmap 350 5 color:(color 128 128 128))
	spinner spn_FrameWidth "Render Frame Width (px) " type:#integer range:[0,8192,1920] align:#left height:20
	spinner spn_ScreenDepth "Screen Depth " type:#float range:[0,100000,0] align:#left height:20	
	spinner spn_FOV "Lens FOV " type:#float range:[0,175,0] align:#left height:20
	spinner spn_MM "Lens mm " type:#float range:[0,175,0] align:#left height:20
	spinner spn_TargetStereoStrength "Target Stereo Strength (%) " type:#float range:[0,100000,1.05] align:#left height:20 scale:0.01 tooltip: "IMAX target: 1.05%"
	label lbl_EyeSeparation "Eye Separation: " align:#left height:20 scale:0.01
	label lbl_ParallaxPercentage "Stereo Strength: "  align:#left height:20 scale:0.01
	label lbl_StereoStrength "Stereo Separation Limits (px): " type:#float range:[0,100000,0] align:#left height:20			
	label lbl_NearLimit "Near Limit: " type:#float range:[0,100000,0] align:#left height:20
	label lbl_FarLimit "Far Limit: " type:#float range:[0,100000,0] align:#left height:20		
	button btn_TurnOffRanges "Toggle Near/Far Guides" align:#center	width:150 height:30	
	button btn_close "Close" align:#center	width:150 height:30		
	
	--*****************************
	--FUNCTIONS
	
	fn fnGenerateWarning =
	(
		lbl_Viewport.text = "HIGHLIGHT THE CAMERA'S VIEWPORT!"
		bmp_StatusColour.bitmap = bitmap 350 5 color:(color 255 0 0)		
	)
	
	fn fnRemoveWarning =
	(
		bmp_StatusColour.bitmap = bitmap 350 5 color:(color 128 128 128)		
	)	
	
	fn fnCheckCameraIsSelected =		
	(
		varActiveCamera = getActiveCamera()
		
		if varActiveCamera != undefined then
		(	
			varActiveCameraName = varActiveCamera.name
			lbl_Viewport.text = varActiveCameraName as string
			bmp_StatusColour.bitmap = bitmap 350 5 color:(color 128 128 128)			
		)
		else
		(
			lbl_Viewport.text = "HIGHLIGHT THE CAMERA'S VIEWPORT!"
			bmp_StatusColour.bitmap = bitmap 350 5 color:(color 255 0 0)
		)			
	)
		
	fn fnInitialOpeningOnly = 		
	(
		spn_FrameWidth.value = renderWidth		
	)	
	
	fn fnGetActiveCameraStats = 
	(
		varActiveCamera = getActiveCamera()		
		
		if varActiveCamera != undefined then
		(						
			varActiveCameraName = varActiveCamera.name
			varScreenDepth = varActiveCamera.baseObject.targetDistance
			varFOV = varActiveCamera.fov
			varMM = cameraFOV.FOVtoMM varActiveCamera.fov
			spn_ScreenDepth.value = varScreenDepth
			spn_FOV.value = varFOV
			spn_MM.value = varMM
			lbl_Viewport.text = varActiveCameraName as string
			fnRemoveWarning()
			varActiveCamera.showRanges = true				
		)
		else
		(
			lbl_Viewport.text = "HIGHLIGHT THE CAMERA'S VIEWPORT!"
			bmp_StatusColour.bitmap = bitmap 350 5 color:(color 255 0 0)
		)				
	)
	
	fn fnCameraAdjustMM = 
	(
		spn_FOV.value = cameraFOV.MMtoFOV spn_MM.value
	)	
	
	fn fnCameraAdjustFOV = 
	(
		spn_MM.value = cameraFOV.FOVtoMM spn_FOV.value
	)	
	
	fn fnCalculateStereoStrength = 
	(
		varActiveCamera = getActiveCamera()
		
		fnCheckCameraIsSelected()
		
		if varActiveCamera != undefined then
		(			
			varTargetStereoStrength = (spn_FrameWidth.value*(spn_TargetStereoStrength.value/100))			
			varRecommendedEyeSeparation = ((varTargetStereoStrength*(2*(spn_ScreenDepth.value*(tan(spn_FOV.value/2)))))/spn_FrameWidth.value)
			lbl_EyeSeparation.text = "Eye Separation: " + formattedPrint varRecommendedEyeSeparation format:"#.3f" as string + " " + units.SystemType 				
			varFarLimit = varRecommendedEyeSeparation*(spn_FrameWidth.value/(2*(tan(spn_FOV.value/2))*spn_ScreenDepth.value))						
			delta = (varRecommendedEyeSeparation*spn_FrameWidth.value)/(2*spn_ScreenDepth.value*tan(spn_FOV.value/2))					
			pdistNear = (((varRecommendedEyeSeparation*spn_FrameWidth.value)/(delta+varTargetStereoStrength))/tan(spn_FOV.value/2))*0.5
			pdistFar = (((varRecommendedEyeSeparation*spn_FrameWidth.value)/(delta-varTargetStereoStrength+1))/tan(spn_FOV.value/2))*0.5				
			varStereoStrengthPercentage = (varFarLimit/spn_FrameWidth.value)*100			
			varActiveCamera.nearrange = pdistNear
			
			print "varTargetStereoStrength"
			print varTargetStereoStrength as string		
			
			print "varTargetStereoStrength"
			print varTargetStereoStrength as string	
			
			print "spn_ScreenDepth.value"
			print spn_ScreenDepth.value as string
			
			print "spn_FOV.value"
			print spn_FOV.value as string
			
			print "spn_FrameWidth.value"
			print spn_FrameWidth.value as string					
			
			print "varRecommendedEyeSeparation"
			print varRecommendedEyeSeparation as string
			
			if (pdistFar > 0) and (pdistFar < 999999) then
			(
				varActiveCamera.farrange = pdistFar	
				lbl_FarLimit.text =  "Far Limit: " + pdistFar as string + " " + units.SystemType 			
			)
			else
			(
				lbl_FarLimit.text =  "Far Limit: To infinity and beyond!" 
				varActiveCamera.farrange = 999999
			)
			
			lbl_ParallaxPercentage.text = "Stereo Strength: " + formattedPrint varStereoStrengthPercentage format:"#.3f" as string + " %"
			lbl_StereoStrength.text = "Stereo Separation Limits: " + formattedPrint varFarLimit format:"#.2f" as string +" px"			
			lbl_NearLimit.text = "Near Limit: " + pdistNear as string + " " + units.SystemType 		
			print ("Stereo Calculator - Target Stereo Strength: " + spn_TargetStereoStrength.value as string + "%")
		)				
)

	fn fnToggleRanges =
	(		
		varActiveCamera = getActiveCamera()
		
		if varActiveCamera != undefined then
		(	
			if varActiveCamera.showRanges == true then
			(
				varActiveCamera.showRanges = false				
			)
			else
			(
				varActiveCamera.showRanges = true	
			)
		)
		else
		(
			fnGenerateWarning()
		)			
	)		
	
	--*****************************
	-- WHEN THE GUI IS OPENED
	on STEREOSETTINGS open do
	(
		fnInitialOpeningOnly()
		fnGetActiveCameraStats()	
		fnCalculateStereoStrength()
	)
	
	on spn_FrameWidth entered do 
	(
		fnCalculateStereoStrength()		
	)
	
	on spn_ScreenDepth entered do 
	(
		fnCalculateStereoStrength()		
	)
	
	on spn_FOV entered do 
	(
		fnCameraAdjustFOV()
		fnCalculateStereoStrength()		
	)
	
	on spn_MM entered do 
	(
		fnCameraAdjustMM()
		fnCalculateStereoStrength()		
	)
	
	on spn_TargetStereoStrength entered do
	(
		fnCalculateStereoStrength()
	)
	
	on btn_Refresh pressed do
    (
		fnGetActiveCameraStats()	
		fnCalculateStereoStrength()
	)	
	
	on btn_TurnOffRanges pressed do		
	(
		fnToggleRanges()
	)
	
	on btn_close pressed do
    (
		destroyDialog STEREOSETTINGS
	)
	
)
Createdialog STEREOSETTINGS
)