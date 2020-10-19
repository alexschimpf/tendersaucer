### Tendersaucer is a web application that allows you to generate Spotify playlists based on artists/genres you like. It has a few pieces:

## 1. Indexer

This is a script which indexes data from the Spotify API. This is required in order avoid API rate limits. This script does this in parallel. Each thread starts at a random artist. It then finds its related artists (via Spotify API). It then searches from those artists and so on and so forth. It's basically just a simple graph traversal. 

The script stores the following:
- Which artists belong to which genres (stored in Neo4J)
- Which artists are related to other artists (stored in Neo4J)
- The top tracks (and some of their metadata) for each artist (stored in MySQL)

## 2. Playlist Generator

Celery is used to asynchronously generate playlists. The UI submits a job to Celery, and the UI constantly polls the status of the job. Once complete, the UI will let the user know the playlist has been generated. Even if the user navigates away from the page, the playlist will still get generated (assuming no error). The Celery task will take the criteria the user has chosen (artist popularity range, danceability, etc.) and find tracks which match all of this criteria. It first starts by finding "seed" artists. It does this in one of the following ways:
1. Select a random subset of the user's top artists, as provided via the Spotify API
2. Select random artists from the user's desired genres

Next, it traverses their related artists up to a certain depth (depending on the user's "adventurousness"). Along the way, it collects every track that meets the criteria. At the end, it selects 50 (or fewer) of these tracks at random and builds a playlist with them.

## 3. Web application

The app was built using React and uses Spotify authentication. When a playlist is generated, the playlist is saved under the signed in user's account.
