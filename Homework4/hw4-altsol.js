/*
    Author: Parshva Mehta
    Date: 2/19/2024
    Assignment: Homework 4

    Description: This program is an appointment scheduling system that looks at the next (N=4) days and allows the user to reserve a date and time for an appointment. 
    The program reads and writes to an iCalendar file (calendar.ics) to store the reservations. The user can also cancel and lookup reservations.
    
    Although the program asks for an email ID, this is simply to satisfy constraints for the ICal generator library. This email is not used and is not validated.

    Dependencies:
    - node-ical: https://www.npmjs.com/package/node-ical
    - ical-generator: https://www.npmjs.com/package/ical-generator
    - moment: https://www.npmjs.com/package/moment
    - prompt-sync: https://www.npmjs.com/package/prompt-sync

    Test Calandar path: 'calendar.ics'
    Special Holidays:
        '2024-01-01', // New Year's Day
        '2024-01-15', // Martin Luther King Jr. Day
        '2024-02-19', // Presidents' Day
        '2024-05-27', // Memorial Day
        '2024-07-04', // Independence Day
        '2024-09-02', // Labor Day
        '2024-10-14', // Columbus Day
        '2024-11-11', // Veterans Day
        '2024-11-28', // Thanksgiving Day
        '2024-12-25', // Christmas Day

    Testing is handled by hw4.test.js, since this is a comprehensive program that requires user input, unit test cases will test each function separately as well as one main function test.
*/


const fs = require('fs');
const ical = require('node-ical');
const icalGenerator = require('ical-generator').default;
const moment = require('moment');
const prompt = require('prompt-sync')();

const calendarFilePath = 'calendar.ics';
const specialHolidays = [
    '2024-01-01', // New Year's Day
    '2024-01-15', // Martin Luther King Jr. Day
    '2024-02-19', // Presidents' Day
    '2024-05-27', // Memorial Day
    '2024-07-04', // Independence Day
    '2024-09-02', // Labor Day
    '2024-10-14', // Columbus Day
    '2024-11-11', // Veterans Day
    '2024-11-28', // Thanksgiving Day
    '2024-12-25', // Christmas Day
];



function createICalEventString(start, end, summary, attendee) {
    return `BEGIN:VEVENT\n` +
           `UID:${generateUID()}\n` +
           `DTSTAMP:${formatDateTime(new Date())}\n` +
           `DTSTART:${formatDateTime(start)}\n` +
           `DTEND:${formatDateTime(end)}\n` +
           `SUMMARY:${summary}\n` +
           `ATTENDEE;CN=${attendee}\n` +
           `END:VEVENT\n`;
}

function generateUID() {
    return 'uid-' + Math.random().toString(36).substr(2, 9);
}

function formatDateTime(date) {
    return moment(date).format('YYYYMMDDTHHmmss');
}

// --------------------------------------------------------- Helper Functions --------------------------------------------------------- // 
/**
 * Boolean function to check if a given date is a weekend.
 * @param {Date} date - Date object to check.
 * @returns {boolean} - True if the date is a weekend, false otherwise.
 */

function isWeekend(date) {
    return [0, 6].includes(moment(date).day());
}

/**
 * Boolean function to check if a given date is a special holiday.
 * @param {Date} date - Date object to check.
 * @returns {boolean} - True if the date is a special holiday, false otherwise.
 */

function isSpecialHoliday(date) {
    return specialHolidays.includes(moment(date).format('YYYY-MM-DD'));
}

/**
 * Function to convert a time string from 12-hour format to 24-hour format.
 * @param {string} time - String to convert to 24-hour format.
 * @returns {string} - Converted time in 24-hour format.
 */

function convertTo24Hour(time) {
    return moment(time, ['h:mm A']).format('HH:mm');
}


// --------------------------------------------------------- Read Calendar File Functions ----------------------------------------------//
/**
 * Function to read in an ICS file and store data in an object.
 * @param NONE
 * @returns {Object} - Parsed ICS file data.
 */

function readICalendarFile() {
    try {
        const data = fs.readFileSync(calendarFilePath, 'utf8');
        return ical.sync.parseICS(data);
    } catch (err) {
        console.error('Error reading iCalendar file:', err.message);
        return null;
    }
}

/**
 * Function to create an event in the calendar.
 * @param {Object} cal - Calendar object to create the event in.
 * @param {string} name - Name of the attendee.
 * @param {string} email - Email of the attendee.
 * @param {Date} start - Start date and time of the event.
 * @param {string} summary - Summary of the event.
 * @returns {Object} - Created event object.
 */

function createCalendarEvent(cal, name, email, start, summary) {
    const eventString = createICalEventString(start, new Date(start), summary, name);
    cal.push(eventString);
    return eventString; // Assuming you need the event string for some purpose
}


/**
 * Function to save the calendar to an ICS file.
 * @param cal - Calendar object to save to the file.
 * @returns {VOID}
 */
function saveCalendarToFile(cal) {
    const calendarString = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Your Company//Your Product//EN',
        ...cal,
        'END:VCALENDAR'
    ].join('\n');
    fs.writeFileSync(calendarFilePath, calendarString, 'utf8');
}




/**
 * Function to check if a given date is reserved in the calendar.
 * @param {Object} calData - Parsed iCalendar data.
 * @param {string} dateString - Date to check in 'YYYY-MM-DD' format.
 * @returns {boolean} - True if the date is reserved, false otherwise.
 */
function isDateReserved(calData, dateString) {
    const targetDate = moment(dateString, 'YYYY-MM-DD');

    return Object.values(calData).some(event => {
        if (event.type === 'VEVENT') {
            const eventStartDate = moment(event.start);
            return eventStartDate.isSame(targetDate, 'day');
        }
        return false;
    });
}


/**
 * Function to find the next available dates for reservation and compare them to the output from isDateReserved to find valid dates.
 * @param cal - Calendar object to check.
 * @returns {string} - Array of available dates for reservation.
 */

function findNextAvailableDates(cal) {
    const availableDates = [];
    for (let attempts = 0; attempts < 5; attempts++) {
        const nextDay = moment().add(attempts, 'days');
        if (!isWeekend(nextDay) && !isSpecialHoliday(nextDay) && !isDateReserved(cal, nextDay)) {
            availableDates.push(nextDay.format('YYYY-MM-DD'));
        }
    }

    if (availableDates.length === 0) {
        console.error('No available dates within the next 4 days.');
        return [];
    }
    return availableDates;
}

// --------------------------------------------------------- Main Functions --------------------------------------------------------- //

/**
 * Reserves a date for an event in the calendar.
 * 
 * @param {Object} cal - The ical-generator calendar instance.
 * 
 * Prompts the user to choose a date from the available dates, enter the reservation details,
 * and creates an event on the chosen date. Throws an error and exits if an invalid choice
 * is made or if the time format is incorrect.
 * 
 * @throws {Error} If an invalid date choice is made or time format is incorrect.
 */


function reserveDate(cal, chosenNumber, attendeeName, attendeeEmail, startTime, summary) {
    const availableDates = findNextAvailableDates(cal);
    if (availableDates.length === 0) {
        console.log("No available dates to reserve.");
        return;
    }

    console.log("Available dates for reservation:");
    availableDates.forEach((date, index) => {
        console.log(`${index + 1}: ${date}`);
    });

    const chosenDate = availableDates[chosenNumber - 1];

    if (!chosenDate) {
        throw new Error('Invalid choice. Exiting the program.');
    }

    // Validate the time format
    if (!/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i.test(startTime)) {
        throw new Error('Invalid time format. Exiting the program.');
    }

    startTime = convertTo24Hour(startTime);
    const startDateTime = `${chosenDate}T${startTime}:00`;

    const event = createCalendarEvent(cal, attendeeName, attendeeEmail, startDateTime, summary);
    console.log('Reservation successful. Event UID:', event.uid());
}


/**
 * Cancels a reservation in the calendar.
 * 
 * @param {Object} cal - The ical-generator calendar instance.
 * 
 * Prompts the user for the event ID and removes the event with the matching ID from the calendar.
 * 
 * @throws {Error} If no reservation is found with the given ID.
 */


function cancelReservation(cal, eventId) {
    const events = cal.events();

    const eventIndex = events.findIndex(event => event.uid() === eventId);
    if (eventIndex !== -1) {
        cal.events(events.filter((_, index) => index !== eventIndex));
        console.log('Reservation cancelled successfully.');
    } else {
        console.log('No reservation found with the given ID.');
    }
}

/**
 * Looks up a reservation in the calendar by event ID.
 * 
 * @param {Object} cal - The ical-generator calendar instance.
 * 
 * Prompts the user for the event ID and displays details of the event with the matching ID.
 * 
 * @throws {Error} If no reservation is found with the given ID.
 */


function lookupReservations(cal, eventId) {
    const event = cal.events().find(event => event.uid() === eventId);

    if (event) {
        console.log(`Found reservation: ID: ${event.uid()}, Start: ${event.start().format()}}, Summary: ${event.summary()}`);
    } else {
        console.log('No reservation found with the given ID.');
    }
}


/**
 * Main function that initiates the calendar application.
 * 
 * Initializes the calendar from the existing .ics file and prompts the user to choose an action:
 * reserve, find, lookup, cancel, or reset. Executes the corresponding function based on the user's choice.
 */


function main() {
    let cal = [];
    const existingEvents = readICalendarFile();

    for (const key in existingEvents) {
        if (existingEvents[key].type === 'VEVENT') {
            createCalendarEvent(cal, existingEvents[key].attendee, existingEvents[key].start, existingEvents[key].end, existingEvents[key].summary);
        }
    }

    const command = prompt('Enter command (reserve, find, lookup, cancel, reset): ');
    switch (command) {
        case 'reserve':
            reserveDate(cal);
            break;
        case 'find':
            console.log('Next available dates:', findNextAvailableDates(cal));
            break;
        case 'lookup':
            lookupReservations(cal);
            break;
        case 'cancel':
            cancelReservation(cal);
            break;
        default:
            console.log('Invalid command.');
    }

    saveCalendarToFile(cal);
}

main();

module.exports = {
    findNextAvailableDates,
    isWeekend,
    isSpecialHoliday,
    convertTo24Hour,
    reserveDate,
    cancelReservation,
    lookupReservations,
    createCalendarEvent,
    readICalendarFile,
    saveCalendarToFile,
    isDateReserved,
    main
};