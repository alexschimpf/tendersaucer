import os
import json
from werkzeug.datastructures import ImmutableDict, ImmutableList

curr_dir = os.path.dirname(os.path.realpath(__file__))

with open(os.path.join(curr_dir, '../app_config.json')) as f:
    APP_CONFIG = ImmutableDict(json.loads(f.read()))

with open(os.path.join(curr_dir, '../config/genres.json')) as f:
    GENRES = ImmutableList(json.loads(f.read()))

if not APP_CONFIG['spotify']['client_id']:
    APP_CONFIG['spotify']['client_id'] = os.getenv('SPOTIFY_CLIENT_ID')
    assert APP_CONFIG['spotify']['client_id']
if not APP_CONFIG['spotify']['client_secret']:
    APP_CONFIG['spotify']['client_secret'] = os.getenv('SPOTIFY_CLIENT_SECRET')
    assert APP_CONFIG['spotify']['client_secret']

if not APP_CONFIG['neo4j']['user']:
    APP_CONFIG['neo4j']['user'] = os.getenv('NEO4J_USER')
    assert APP_CONFIG['neo4j']['user']
if not APP_CONFIG['neo4j']['password']:
    APP_CONFIG['neo4j']['password'] = os.getenv('NEO4J_PASSWORD')
    assert APP_CONFIG['neo4j']['password']
