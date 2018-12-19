# cln cleanViewer v1.0

import BlackmagicFusion 
varFu = BlackmagicFusion.scriptapp("Fusion")
varComp = varFu.GetCurrentComp()

varL_AView = varComp.GetPreviewList()["Left"]
varR_AView = varComp.GetPreviewList()["Right"]
varL_BView = varComp.GetPreviewList()["Left.B"]
varR_BView = varComp.GetPreviewList()["Right.B"]

varL_AView.ViewOn(0)
varR_AView.ViewOn(0)
varL_BView.ViewOn(0)
varR_BView.ViewOn(0)