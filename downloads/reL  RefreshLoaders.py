#reL RefreshLoaders v0.1

varToollist = composition.GetToolList(False, 'Loader')
varToolSelected = composition.GetToolList(True, 'Loader')

for tool in varToolSelected.values():
	tool.Clip[composition.CurrentTime] = tool.Clip[composition.CurrentTime]


