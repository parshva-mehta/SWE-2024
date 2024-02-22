/*
    Author: Parshva Mehta
    Date: 02/21/2024

    Project: Homework 4
    Description: This is a simple calendar application that allows users to reserve dates, look up upcoming reservations, cancel reservations, and find the next available dates for booking.

    Dependencies: ical.js, prompt-sync, fs
*/

const fs = require('fs');
const prompt = require('prompt-sync')();
const ICAL = require('ical.js');
const path = 'test-calendar.ics';

// ---------------------------------------------------- Helper Functions ---------------------------------------------------- //
/*
    * Function to write a new reservation to the calendar file
    * @param {string} filePath - The path to the calendar file
    * @param {ICAL.Component} newEvent - The new event to add to the calendar
*/

function writeReservationToFile(filePath, newEvent) {
    try {
        // Read the existing file content
        let fileData = fs.readFileSync(filePath, 'utf8').trim();
        let icalComponent;

        // Check if the file is empty and initialize a new calendar component if needed
        if (fileData === '') {
            icalComponent = new ICAL.Component(['vcalendar', [], []]);
        } 
        else {
            // Parse the existing data into an iCalendar component
            const parsedData = ICAL.parse(fileData);
            icalComponent = new ICAL.Component(parsedData);
        }

        // Add the new event as a subcomponent
        icalComponent.addSubcomponent(newEvent);

        // Convert the iCalendar component back to a string and write to the file
        const updatedData = icalComponent.toString();
        fs.writeFileSync(filePath, updatedData);

        // Return true to indicate success
        return true;
    } 
    catch (error) {
        console.error('Error processing the calendar file:', error.message);
        return false; // Return false to indicate failure
    }
}

/*
    * Function to generate a unique confirmation code  
    * @returns {string} - A unique confirmation code
*/
function generateConfirmationCode() {
    const characters = '0123456789abcdef';
    let code = '';

    for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            code += '-';
        } 
        else if (i === 14) {
            code += '4';
        } 
        else if (i === 19) {
            code += characters.substr(Math.floor(Math.random() * 4) + 8, 1);
        } 
        else {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
    }

    return code;
}

/*
    * Function to format a date object as YYYYMMDD 
    * @param {Date} date - The date to format
    * @returns {string} - The formatted date string
*/
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/*
    * Function to read the calendar file and return an array of booked dates
    * @returns {Array} - An array of booked dates in the format YYYYMMDD
*/
function getBookedDates() {
    try {
        // Read the calendar data file and check if it's empty
        const data = fs.readFileSync(path, 'utf8').trim();
        if (data === '') {
            return [];
        }

        // Parse the calendar data and create an iCalendar component
        const icalComponent = new ICAL.Component(ICAL.parse(data));

        // Extract and format the start dates of all events
        return icalComponent.getAllSubcomponents('vevent').map(vevent => {
            const event = new ICAL.Event(vevent);
            // Convert the date to a more friendly format (YYYYMMDD)
            const jsDate = event.startDate.toJSDate();
            return jsDate.getFullYear() +
                   ('0' + (jsDate.getMonth() + 1)).slice(-2) +
                   ('0' + jsDate.getDate()).slice(-2);
        });
    }
    catch (error) {
        console.error('Error reading reservations file:', error);
        return [];
    }
}


// ---------------------------------------------------- Main Functions ---------------------------------------------------- //

/*
    * Function to reserve a date for an attendee
    * @param {string} attendee - The name of the attendee
    * @param {string} startDate - The date and time of the reservation (YYYYMMDDTHHMMSS)
    * @param {string} todayDate - The current date and time (YYYYMMDDTHHMMSS)
    * @returns {void}
*/
function reserveDate(attendee, startDate, todayDate) {
    // Function to create a Date object from a YYYYMMDD format string
    const createDate = (dateStr) => new Date(dateStr.substring(0, 4), dateStr.substring(4, 6) - 1, dateStr.substring(6, 8));

    // Create Date objects for startDate and todayDate
    const DTSTART = createDate(startDate);
    const DTSTAMP = createDate(todayDate);

    // Check for existing reservations on the same date
    const bookedDates = getBookedDates();
    const formattedStartDate = startDate.substring(0, 8);
    if (bookedDates.includes(formattedStartDate)) {
        console.log('This date is already booked. Please choose another date.');
        return;
    }

    // Create a new calendar event
    const newEvent = new ICAL.Component('VEVENT');
    newEvent.addPropertyWithValue('ATTENDEE', attendee);
    newEvent.addPropertyWithValue('DTSTART', ICAL.Time.fromJSDate(DTSTART));
    newEvent.addPropertyWithValue('DTSTAMP', ICAL.Time.fromJSDate(DTSTAMP));
    newEvent.addPropertyWithValue('METHOD', 'REQUEST');
    newEvent.addPropertyWithValue('STATUS', 'CONFIRMED');

    // Generate confirmation code
    const code = generateConfirmationCode();
    newEvent.addPropertyWithValue('CONFIRMATION_CODE', code);

    // Write the reservation to file and log the result
    const success = writeReservationToFile(path, newEvent);
    if (success) {
        console.log('Reservation successful! Your confirmation code is:', code);
    } 
    else {
        console.log('Failed to write reservation. Please try again.');
    }
}

/*
    * Function to look up upcoming reservations for an attendee
    * @param {string} attendee - The name of the attendee
*/
function lookupReservations(attendee) {
    try {
        const data = fs.readFileSync(path, 'utf8');

        if (!data.includes(`ATTENDEE:${attendee}`)) {
            console.log(`No reservations found for ${attendee}.`);
            return;
        }

        data.split('BEGIN:VEVENT').forEach(vevent => {
            if (vevent.includes(`ATTENDEE:${attendee}`)) {
                const match = vevent.match(/DTSTART:(\d{8}T\d{6})/);
                if (match) {
                    console.log('Date:', match[1]);
                }
            }
        });
    } 
    catch (err) {
        console.error('Error looking up reservations:', err);
    }
}

/*
    * Function to cancel a reservation for an attendee
    * @param {string} attendeeName - The name of the attendee
    * @param {string} code - The confirmation code for the reservation
*/
function cancelReservation(attendeeName, code) {
    try {
        const data = fs.readFileSync(path, 'utf8');

        if (!data) {
            console.log('No reservations found.');
            return;
        }

        const vevents = data.split('BEGIN:VEVENT');
        let updatedData = '';
        let reservationCancelled = false;

        vevents.forEach(vevent => {
            if (vevent.includes(`ATTENDEE:${attendeeName}`) && vevent.includes(`CONFIRMATION_CODE:${code}`)) {
                updatedData += vevent.replace('STATUS:CONFIRMED', 'STATUS:CANCELLED');
                reservationCancelled = true;
            } 
            else {
                updatedData += `BEGIN:VEVENT${vevent}`;
            }
        });

        if (reservationCancelled) {
            fs.writeFileSync(path, updatedData);
            console.log('Reservation canceled successfully.');
        } 
        else {
            console.log('No matching reservation to cancel.');
        }
    } 
    catch (error) {
        console.error('Error canceling reservation:', error);
    }
}

/*
    * Function to find the next available dates for booking
    * @param {string} startDate - The start date for the search (YYYY-MM-DD)
    * @param {number} n - The number of available dates to find
    * @returns {Array} - An array of available dates in the format YYYYMMDD

*/
function findNextAvailableDates(startDate, n) {
    const bookedDates = getBookedDates();
    let availableDates = [];
    let checkDate = new Date(startDate);

    while (availableDates.length < n) {
        // Format checkDate for comparison
        let formattedCheckDate = formatDate(checkDate);

        // Check if the formatted date is not in the list of booked dates
        if (!bookedDates.includes(formattedCheckDate)) {
            availableDates.push(formattedCheckDate);
        }

        // Increment the date by one day for the next iteration
        checkDate.setDate(checkDate.getDate() + 1);
    }

    return availableDates;
}


//Main function to display options and handle user input

function main() {
    let option;
    
    console.log('\nOptions:');
    console.log('1. Find Next Available Dates');
    console.log('2. Reserve a Date');
    console.log('3. Lookup Upcoming Reservations');
    console.log('4. Cancel Reservation');
    console.log('5. Exit');

    option = prompt('Select an option (1-5): ');

    switch (option) {
        case '1':
            const startDate = prompt('Enter start date (YYYY-MM-DD): ');
            const numberOfDates = parseInt(prompt('Enter the number of dates (1-4): '));

            const availableDates = findNextAvailableDates(startDate, numberOfDates);
            console.log('Available Dates:', availableDates);
            break;
        case '2':
            const attendee = prompt('Enter attendee: ');
            const reservationDate = prompt('Enter reservation date and time (YYYYMMDDTHHMMSS): ');
            const todaysDate = prompt('Enter today\'s date and time (YYYYMMDDTHHMMSS): ');
            reserveDate(attendee, reservationDate, todaysDate);
            break;
        case '3':
            const attendeeToLookup = prompt('Enter attendee name to lookup reservations: ');
            lookupReservations(attendeeToLookup);
            break;
        case '4':
            cancelReservation();
            break;
        case '5':
            console.log('Exiting program.');
            break;
        default:
            console.log('Invalid option. Please select a valid option.');
            break;
    }

}

// Call the main function
//main();

module.exports = {
    getBookedDates,
    generateConfirmationCode,
    writeReservationToFile,
    reserveDate,
    findNextAvailableDates,
    lookupReservations,
    cancelReservation
};