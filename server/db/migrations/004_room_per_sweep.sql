-- One room per sweep (room id = sweep id)
INSERT INTO rooms (id, name, device_id)
SELECT
  s.id,
  COALESCE(r.name, 'Room · ' || s.device_id),
  NULL
FROM sweeps AS s
LEFT JOIN rooms AS r ON r.id = s.room_id
ON CONFLICT (id) DO NOTHING;

UPDATE sweeps SET room_id = id;

DELETE FROM rooms AS r
WHERE NOT EXISTS (
  SELECT 1 FROM sweeps AS s WHERE s.room_id = r.id
);

ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_device_id_key;
