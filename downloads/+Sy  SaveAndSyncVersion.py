#+Sy  SaveAndSyncVersion v1.0

import os
import re
import BlackmagicFusion
 
varFu = BlackmagicFusion.scriptapp("Fusion")
varComp = varFu.GetCurrentComp()
varToollist = varComp.GetToolList(False, 'Saver')
#VERSION FORMAT: v###
varPattern = r".*v(?P<version>\d{3}).*"
varOrigCompPath = comp.GetAttrs('COMPS_FileName')
varMatch = re.match(varPattern, varOrigCompPath)

if varMatch != None : 
	
	varVersionComp = varMatch.group('version')
	#SET THIS TO + 1 IF YOU WANT TO INCREMENT THE VERSION ON SAVE
	varNewVersion = str(int(varVersionComp) + 0) 
	varNewVersion = varNewVersion.zfill(3)	
	varNewCompPath = varOrigCompPath.replace("v"+varVersionComp, "v"+varNewVersion)	
	
	for tool in varToollist.values():	
		
		varOrigPath = tool.Clip[comp.CurrentTime]		
		varMatch = re.match(varPattern, varOrigPath)
		
		if varMatch != None : 
			
			varVersion = varMatch.group('version')			
			varNewPath = varOrigPath.replace("v"+varVersion, "v"+varNewVersion)			
			newDir, newFile = os.path.split(varNewPath)				
			tool.Clip[comp.CurrentTime] = varNewPath
			
	comp.Save(varNewCompPath)
	print varNewCompPath