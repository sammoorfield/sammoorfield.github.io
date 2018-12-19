#tSp  ToggleSplitters v1.0

import BlackmagicFusion
 
varFu = BlackmagicFusion.scriptapp("Fusion")
varComp = varFu.GetCurrentComp()
varToollistSplitter = varComp.GetToolList()
varBool = None
	
for tool in varToollistSplitter.values():
	
	varId = tool.GetAttrs('TOOLS_RegID')
	
	if varId == 'Splitter' :
		
		if varBool == None : varBool = tool.GetAttrs('TOOLB_PassThrough')
		
		tool.SetAttrs({'TOOLB_PassThrough': not varBool}) 
		
		



