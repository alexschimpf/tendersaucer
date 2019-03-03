CREATE DATABASE `tendersaucer`;

USE `tendersaucer`;

CREATE TABLE `top_tracks` (
    `id` VARCHAR(50),
    `artist_id` VARCHAR(50) NOT NULL,
    `release_year` SMALLINT DEFAULT NULL,
    `tempo` SMALLINT UNSIGNED DEFAULT NULL,
    `danceability` TINYINT DEFAULT NULL,

    PRIMARY KEY (`id`),
    KEY `INDEX_ARTIST_ID` (`artist_id`),
    KEY `INDEX_RELEASE_YEAR` (`release_year`),
    KEY `INDEX_TEMPO` (`tempo`),
    KEY `INDEX_DANCEABILITY` (`danceability`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
