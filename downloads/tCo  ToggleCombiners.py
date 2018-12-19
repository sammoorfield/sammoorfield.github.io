#tCo  ToggleCombiners v1.0

import BlackmagicFusion
 
varFu = BlackmagicFusion.scriptapp("Fusion")
varComp = varFu.GetCurrentComp()
varToollistCombiner = varComp.GetToolList()
varBool = None
	
for tool in varToollistCombiner.values():
	
	varId = tool.GetAttrs('TOOLS_RegID')
	
	if varId == 'Combiner' :
		
		if varBool == None : varBool = tool.GetAttrs('TOOLB_PassThrough')
		
		tool.SetAttrs({'TOOLB_PassThrough': not varBool})