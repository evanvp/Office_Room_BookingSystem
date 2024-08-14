/**
    /author pages routing 
 */
const express = require("express");
const router = express.Router();

// Assuming you have a global database object `global.db`
router.get('/main', (req, res, next) => {
    // Query to get the list of offices
    const officeQuery = 'SELECT * FROM office';

    global.db.all(officeQuery, (err, offices) => {
        if (err) {
            return next(err); // Pass errors to the error handler
        }

        // Render the EJS page with the list of offices
        res.render('Booking-main', {
            offices: offices // Pass the list of offices to the EJS template
        });
    });
});

module.exports = router;






router.get('/book-room', (req, res) => {
    // Fetch office options
    const officeQuery = "SELECT name FROM office";
    global.db.all(officeQuery, (err, offices) => {
        if (err) return next(err);
        res.render('Booking-check', {
            offices: offices,
            available_rooms: [], // This will be populated by the /check-availability POST request
            office_name: '',
            start_time: '',
            duration: ''
        });
    });
});

// Route to handle availability check
router.post('/check-availability', (req, res, next) => {
    const officeName = req.body.office_name;
    const startTime = req.body.start_time;
    const duration = parseInt(req.body.duration); // Duration in hours

    // Log for debugging
    console.log('officeName:', officeName);
    console.log('startTime:', startTime);
    console.log('duration:', duration);

    if (!officeName || !startTime || isNaN(duration)) {
        return res.status(400).send('Please provide office_name, start_time, and duration');
    }

    // Calculate end time by adding duration to start time
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

    // Convert start and end times to UTC and format as YYYY-MM-DD HH:MM:SS
    const startTimeUTC = startDate.toISOString().slice(0, 19).replace('T', ' ');
    const endTimeUTC = endDate.toISOString().slice(0, 19).replace('T', ' ');

    // Get office_id
    const officeQuery = "SELECT office_id FROM office WHERE name = ?";
    global.db.get(officeQuery, [officeName], (err, office) => {
        if (err) return next(err);
        if (!office) return res.status(404).send('Office not found');

        const officeId = office.office_id;

        // Get available rooms
        const roomQuery = `
            SELECT room_id
            FROM room
            WHERE office_id = ?
            AND NOT EXISTS (
                SELECT 1
                FROM time_record
                WHERE room_id = room.room_id
                    AND record_starttime < ?  -- Existing booking starts before new booking ends
                    AND record_endtime > ?    -- Existing booking ends after new booking starts
            )`;

        // Fetch office options for the form
        const allOfficesQuery = "SELECT name FROM office";

        global.db.all(allOfficesQuery, (err, offices) => {
            if (err) return next(err);

            global.db.all(roomQuery, [officeId, endTimeUTC, startTimeUTC], (err, rooms) => {
                if (err) return next(err);

                res.render('Booking-check', {
                    offices: offices, // Pass the list of offices to the template
                    available_rooms: rooms,
                    office_name: officeName,
                    start_time: startTime,
                    duration: duration
                });
            });
        });
    });
});

// Route to handle booking submission
router.post('/submit-booking', (req, res, next) => {
    const { room_id, start_time, duration } = req.body;

    // Calculate the end time by adding the duration to the start time
    const startDate = new Date(start_time);
    const endDate = new Date(startDate.getTime() + parseInt(duration) * 60 * 60 * 1000);

    // Convert both start_time and end_time to UTC and format as YYYY-MM-DD HH:MM:SS
    const startTimeUTC = startDate.toISOString().slice(0, 19).replace('T', ' ');
    const endTimeUTC = endDate.toISOString().slice(0, 19).replace('T', ' ');

    // Insert a record into the time_record table
    const timeRecordQuery = `
        INSERT INTO time_record (room_id, record_starttime, record_endtime)
        VALUES (?, ?, ?)`;

    global.db.run(timeRecordQuery, [room_id, startTimeUTC, endTimeUTC], function(err) {
        if (err) {
            return next(err);  // Pass the error to the error handler middleware
        }

        // Get the last inserted record_id
        const timeRecordId = this.lastID;

        // Insert a record into the reservation table
        const reservationQuery = `
            INSERT INTO reservation (room_id, time_record_id, reservation_starttime, reservation_endtime)
            VALUES (?, ?, ?, ?)`;

        global.db.run(reservationQuery, [room_id, timeRecordId, startTimeUTC, endTimeUTC], function(err) {
            if (err) {
                return next(err);  // Pass the error to the error handler middleware
            }

            // Get the last inserted reservation_id
            const reservationId = this.lastID;

            // Fetch the reservation details to render
            const fetchReservationQuery = `
                SELECT reservation_id, room_id, reservation_starttime, reservation_endtime
                FROM reservation
                WHERE reservation_id = ?`;

            global.db.get(fetchReservationQuery, [reservationId], (err, reservation) => {
                if (err) {
                    return next(err);  // Pass the error to the error handler middleware
                }
                if (!reservation) {
                    return res.status(404).send('Reservation not found');  // Reservation not found
                }

                // Render the success page with reservation details
                res.render('Booking-submit', { reservation });
            });
        });
    });
});

// Export the router object so index.js can access it
module.exports = router;
