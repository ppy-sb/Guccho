DELETE FROM banchopy.relationships r
WHERE r.user1 NOT IN (
    SELECT u.id
    FROM banchopy.users u
  )
  OR r.user2 NOT IN (
    SELECT u.id
    FROM banchopy.users u
  )