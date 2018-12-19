#Wig  StereoWiggle v1.0

import BlackmagicFusion 
varFu = BlackmagicFusion.scriptapp("Fusion")
varComp = varFu.GetCurrentComp()
import time 

# varToollist = varComp.GetToolList().values()
# varToolselected = varComp.GetToolList(False, 'Splitter')
# varTool = []


varLeft = varComp.GetPreviewList()["Left"]["View"]
count = 0
state = 0
while (count < 21):
	# print 'Wiggle', count
	varLeft.SetBuffer(state)
	count = count + 1
	if state > 0:
		state = 0
	else:
		state = 1
	time.sleep(.4)   #WIGGLE SPEED