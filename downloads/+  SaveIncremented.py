#+  SaveIncremented v1.0

import re
import BlackmagicFusion
 
varFu = BlackmagicFusion.scriptapp("Fusion")

#VERSION FORMAT: v###
varPattern = r".*v(?P<version>\d{3}).*"
varOrigCompPath = comp.GetAttrs('COMPS_FileName')
varMatch = re.match(varPattern, varOrigCompPath)

if varMatch != None : 
	
	varVersionComp = varMatch.group('version')
	varNewVersion = str(int(varVersionComp) + 1) 
	varNewVersion = varNewVersion.zfill(3)	
	varNewCompPath = varOrigCompPath.replace("v"+varVersionComp, "v"+varNewVersion)		
		
	comp.Save(varNewCompPath)
	print varNewCompPath