ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS device_id TEXT UNIQUE;

INSERT INTO rooms (id, name, device_id)
SELECT
  'room-' || d.device_id,
  'Room · ' || d.device_id,
  d.device_id
FROM (SELECT DISTINCT device_id FROM sweeps WHERE room_id IS NULL) AS d
ON CONFLICT (device_id) DO NOTHING;

UPDATE sweeps AS s
SET room_id = r.id
FROM rooms AS r
WHERE r.device_id = s.device_id
  AND s.room_id IS NULL;
