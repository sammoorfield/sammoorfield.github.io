--pFlowToMesh v1.0
(
	fn fnCheckSelectionLockToggle =
		(
			varSel = selection as array
			clearselection()
			if selection.count != 0 do (max spacebar)
			select varSel
		)
		
	fn fnCheckSelection =
	(
		if selection.count == 0 then 
		(
			messagebox "Select a thing to mesh"
			false
		)
		else true
	)	
	
	fn fnPMesh =
	(
		if fnCheckSelection() == true do
		(
			varSelectedObjects = selection as array

			for obj in varSelectedObjects do 
			(
				Local varMesherObj = Mesher()
				varMesherObj.name = (obj.name + "_Mesh")
				varMesherObj.pick = obj
				convertto varMesherObj polymeshobject
				obj.enable_particles = off
			)
		)
	)
	fnCheckSelectionLockToggle()
	fnPMesh()
)