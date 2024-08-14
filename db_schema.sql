
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Table for storing office information with number_of_rooms
CREATE TABLE IF NOT EXISTS office (
    office_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    number_of_rooms INTEGER NOT NULL
);

-- Table for storing room information
CREATE TABLE IF NOT EXISTS room (
    room_id INTEGER PRIMARY KEY AUTOINCREMENT,
    office_id INTEGER NOT NULL,
    FOREIGN KEY (office_id) REFERENCES office (office_id)
);

-- Table for storing time records for each room
CREATE TABLE IF NOT EXISTS time_record (
    record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    record_starttime TIMESTAMP NOT NULL,
    record_endtime TIMESTAMP NOT NULL,
    FOREIGN KEY (room_id) REFERENCES room (room_id)
);

-- Table for storing reservations
CREATE TABLE IF NOT EXISTS reservation (
    reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    time_record_id INTEGER NOT NULL,
    reservation_starttime TIMESTAMP NOT NULL,
    reservation_endtime TIMESTAMP NOT NULL,
    FOREIGN KEY (room_id) REFERENCES room (room_id),
    FOREIGN KEY (time_record_id) REFERENCES time_record (record_id)
);

-- Insert sample data
INSERT INTO office (name, address, number_of_rooms)
VALUES 
('Office A', '123 Main St', 3),
('Office B', '456 Elm St', 2);

-- Insert rooms for Office A
INSERT INTO room (office_id) VALUES (1);
INSERT INTO room (office_id) VALUES (1);
INSERT INTO room (office_id) VALUES (1);

-- Insert rooms for Office B
INSERT INTO room (office_id) VALUES (2);
INSERT INTO room (office_id) VALUES (2);

-- Insert sample time records for rooms
INSERT INTO time_record (room_id, record_starttime, record_endtime)
VALUES 
(1, '2024-07-30 09:00:00', '2024-07-30 10:00:00'),
(2, '2024-07-30 11:00:00', '2024-07-30 12:00:00'),
(3, '2024-07-30 14:00:00', '2024-07-30 15:00:00');

-- Insert sample reservations
INSERT INTO reservation (room_id, time_record_id, reservation_starttime, reservation_endtime)
VALUES 
(1, 1, '2024-07-30 09:00:00', '2024-07-30 10:00:00'),
(2, 2, '2024-07-30 11:00:00', '2024-07-30 12:00:00');

COMMIT;








