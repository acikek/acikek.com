import shutil
from pathlib import Path
from datetime import datetime

SRC_FOLDER = 'src'
UPDATES_FOLDER = 'updates'
BUILD_FOLDER = '.build'

HOMEPAGE = 'index.html'
STYLESHEET = 'style.css'

UPDATES_PLACEHOLDER = "<!--#UPDATES-->"

def update_to_div(name: str, content: str) -> str:
	'''
	converts an update file (in `UPDATES_FOLDER`) to a homepage entry
	'''
	return f'<div class="update-item"><h2>{name}</h2><p>{content}</p></div>'

def make_updates() -> str | None:
	'''
	sorts and compiles the contents of the `UPDATES_FOLDER` into HTML
	'''
	updates_path = Path(UPDATES_FOLDER)
	if not updates_path.exists():
		print('updates folder not found')
		return
	update_files: list[tuple[Path, datetime]] = []
	for path in updates_path.iterdir():
		try:
			update_files.append((path, datetime.strptime(path.stem, "%d-%m-%Y")))
		except ValueError:
			print(f'update {path} does not match the format dd-mm-yyyy');
			return
	update_files.sort(key=lambda pair: pair[1], reverse=True)
	updates = []
	for (update_path, update_date) in update_files:
		with open(update_path, 'r') as update:
			title = update_date.strftime('%B %-d, %Y')
			update_div = update_to_div(title, update.read())
			updates.append(update_div)
	return str.join('\n', updates)

def make_homepage() -> str | None:
	'''
	combines `HOMEPAGE` and the contents of the `UPDATES_FOLDER`
	'''
	homepage_path = Path(SRC_FOLDER) / HOMEPAGE
	if not homepage_path.exists():
		print('index.html not found')
		return
	with open(homepage_path, "r") as homepage:
		content = homepage.read()
		if (UPDATES_PLACEHOLDER not in content):
			print(f'placeholder {UPDATES_PLACEHOLDER} not found in index.html')
			return
		if (updates := make_updates()) is not None:
			return content.replace(UPDATES_PLACEHOLDER, updates)
	
def build():
	build_path = Path(BUILD_FOLDER)
	# copy stylesheet
	shutil.copy2(Path(SRC_FOLDER) / STYLESHEET, build_path / STYLESHEET)
	# make homepage and write to build dir
	if (homepage := make_homepage()) is not None:
		with open(build_path / HOMEPAGE, "w") as out:
			out.write(homepage)

if __name__ == '__main__':
	build()
