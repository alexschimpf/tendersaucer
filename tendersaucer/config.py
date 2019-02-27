import os
import json
from werkzeug.datastructures import ImmutableDict, ImmutableList

curr_dir = os.path.dirname(os.path.realpath(__file__))

with open(os.path.join(curr_dir, '../app_config.json')) as f:
    APP_CONFIG = ImmutableDict(json.loads(f.read()))

with open(os.path.join(curr_dir, '../config/genres.json')) as f:
    GENRES = ImmutableList(json.loads(f.read()))
