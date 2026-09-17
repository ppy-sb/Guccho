ALTER TABLE `maps`
  ADD FULLTEXT INDEX `maps_metadata_fulltext` (`artist`, `title`, `version`),
  ADD FULLTEXT INDEX `maps_mapset_fulltext` (`artist`, `title`),
  ALGORITHM=COPY, LOCK=SHARED;
