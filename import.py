import shutil
import os

source_dir = r"C:\Users\jkalab\Desktop\FPL_mini\fpl_spy\web"
target_dir = r"C:\Users\jkalab\Desktop\FPL_awards"

# Zkopíruje všechny soubory a složky ze source_dir do target_dir
for item in os.listdir(source_dir):
    s = os.path.join(source_dir, item)
    d = os.path.join(target_dir, item)
    if os.path.isdir(s):
        shutil.copytree(s, d, dirs_exist_ok=True)
    else:
        shutil.copy2(s, d)

print("Kopírování dokončeno.")