import shutil
from pathlib import Path

HOMEPAGE = 'index.html'
STYLESHEET = 'style.css'
UPDATES_FOLDER = 'updates'
UPDATES_PLACEHOLDER = "<!--#UPDATES-->"
BUILD_FOLDER = '.build'

def update_to_div(filename: str, content: str) -> str:
	'''
	converts an update file (in `UPDATES_FOLDER`) to a homepage entry
	'''
	return f'<div class="update-item"><h2>{filename}</h2><p>{content}</p></div>'

def make_homepage() -> str | None:
	'''
	combines `HOMEPAGE` and the contents of the `UPDATES_FOLDER`
	'''
	homepage_path = Path.cwd() / HOMEPAGE
	if not homepage_path.exists():
		print('index.html not found')
		return
	with open(homepage_path, "r") as homepage:
		content = homepage.read()
		if (UPDATES_PLACEHOLDER not in content):
			print(f'placeholder {UPDATES_PLACEHOLDER} not found in index.html')
			return
		# compile updates folder
		updates_path = Path.cwd() / UPDATES_FOLDER
		if not updates_path.exists():
			print('updates folder not found')
			return
		updates = []
		for update_path in updates_path.iterdir():
			with open(update_path, 'r') as update:
				update_div = update_to_div(update_path.name, update.read())
				updates.append(update_div)
		# sub in the compiled updates
		return content.replace(UPDATES_PLACEHOLDER, str.join('\n', updates))
	
def build():
	build_path = Path(BUILD_FOLDER)
	# copy stylesheet
	shutil.copy2(STYLESHEET, build_path / STYLESHEET)
	# make homepage and write to build dir
	if (homepage := make_homepage()) is not None:
		with open(build_path / HOMEPAGE, "w") as out:
			out.write(homepage)

if __name__ == '__main__':
	build()
