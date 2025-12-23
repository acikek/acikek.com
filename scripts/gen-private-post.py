#!/bin/python

import pathlib
import sys
import uuid
import json
import time

# todo: replace

if __name__ == '__main__':
	if len(sys.argv) < 2:
		print('err: provide blogpost name')
		exit(1)
	arg = str.join(' ', sys.argv[1:])
	path = pathlib.Path('private-blogposts') / arg
	path = path.with_suffix('.html')
	if not path.exists() or not path.is_file():
		print(f'err: post does not exist ({path})')
		exit(1)
	keys = { 
		str(uuid.uuid4()): {
			'file': str(path),
			'created-at': time.time()
		}
	}
	keys_path = pathlib.Path('private-blogpost-keys.json')
	if keys_path.exists():
		with open(keys_path, 'r') as keys_read:
			new_keys = json.load(keys_read)
			keys.update(new_keys)
	with open(keys_path, 'w') as keys_write:
		keys_write.write(json.dumps(keys, indent="    "))
