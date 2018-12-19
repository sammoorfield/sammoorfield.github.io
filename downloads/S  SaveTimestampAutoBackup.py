#S  SaveTimestampAutoBackup v1.0

import datetime

#SET YOUR AUTOBACK LOCATION HERE
varAutobackFolder = "D:/CACHE_FUSION/AutoSaves/"

varCurrentDate = datetime.datetime.now().strftime("%Y-%m-%d %H.%M %p")
varCompPath = comp.GetAttrs('COMPS_FileName')
varCompName = comp.GetAttrs('COMPS_Name')
varCompNameNoExt = varCompName.replace(".comp", "") 
varCompFilepath = fusion.MapPath(varAutobackFolder + varCompNameNoExt + "_" + str(varCurrentDate) + ".comp")
 
comp.Save(varCompFilepath)
print("Autoback File: " + varCompFilepath)
comp.Save(varCompPath)
print("File Saved: " + varCompPath)
