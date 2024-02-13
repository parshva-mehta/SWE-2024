/* 
Author: Parshva Mehta
Date: 02/09/2024

Assignment: Homework 3

Assume that the following program will be part of a system to be used for scheduling patient visits to doctor’s office. For simplicity, assume that the doctor admits a single patient per day. 
The program developed in this problem will read a local file with calendar appointments and verify that it is formatted in the iCalendar format: https://en.wikipedia.org/wiki/ICalendar. 
The full standard is described in RFC-5545 https://datatracker.ietf.org/doc/html/rfc5545.
Your program is expected to be able to verify only the Event Component (keyword: VEVENT), and not any other calendar components specified in RFC-5545. You may reuse the code from
Problem 2.2.6, modified and extended as necessary.

Assumptions: Since the program is only expected to valdidate the VEVENT component, we can assume the rest of the iCal file is valid on input. Testing will only involve the VEVENT component and respective edgecases.
*/




const fs = require('fs');
/**
 * Validates an iCalendar VEVENT component.
 * @param {Object} event - The event object with iCalendar properties.
 * @returns {boolean} - True if valid, throws an error if invalid.
 */
function isValidEvent(event) {
    const requiredProperties = ['DTSTART', 'DTSTAMP', 'METHOD', 'STATUS'];
    const optionalProperties = ['CREATED', 'DTEND', 'DURATION', 'LAST-MODIFIED', 'NAME', 'ORGANIZER', 'DESCRIPTION', 'ATTENDEE'];

    for (let i = 0; i < requiredProperties.length; i++) {
        const prop = requiredProperties[i];

        // Validates all required properties in ICal
        if (!event.hasOwnProperty(prop)) {
            throw new Error("Event is missing required property");
        }

        // Validates the DATE-TIME format in the required properties
        if (prop === 'DTSTART' || prop === 'DTSTAMP') {
            if (!isValidICalDateTime(event[prop])) {
                throw new Error("Invalid DATE-TIME format in property");
            }
        }

        // Validates the METHOD and STATUS properties as project requirements state
        if (prop === 'METHOD' && event[prop] !== 'REQUEST') {
            throw new Error('Invalid METHOD value. Only METHOD:REQUEST is accepted.');
        }

        // Validates the STATUS property possibilities
        if (prop === 'STATUS' && !['TENTATIVE', 'CONFIRMED', 'CANCELLED'].includes(event[prop])) {
            throw new Error('Invalid STATUS value. Only "TENTATIVE", "CONFIRMED", or "CANCELLED" are accepted.');
        }
    }


    // Validates the optional properties - Ignore if not in required. If property is not in required or optional, throw error- not warning (Handled in process ical function)
    for (const prop in event) {
        if (!requiredProperties.includes(prop) && !optionalProperties.includes(prop)) {
            console.warn(`Warning: Unrecognized property "${prop}" will be ignored.`);
        }
    }

    // Validates the DTSTAMP occurs before DTSTART
    const dtStart = new Date(event['DTSTART']);
    const dtStamp = new Date(event['DTSTAMP']);
    if (dtStamp > dtStart) {
        throw new Error('DTSTAMP should be before DTSTART');
    }

    

    return true;
}


/**
 * Validates an iCalendar DATE-TIME format.
 * @param {string} dateTime - The dateTime string in iCalendar DATE-TIME format (YYYYMMDDTHHMMSS).
 * @returns {boolean} - True if valid, false otherwise.
 */
function isValidICalDateTime(dateTime) {
    if (dateTime.length !== 15 || dateTime[8] !== 'T') {
        return false;
    }

    let date = dateTime.slice(0, 4) + "-" + dateTime.slice(4, 6) + "-" + dateTime.slice(6, 8);
    let time = dateTime.slice(9, 11) + ":" + dateTime.slice(11, 13) + ":" + dateTime.slice(13, 15);
    let convert = date + "T" + time;
    const newDateTime = new Date(convert);

    let year = parseInt(dateTime.slice(0, 4), 10);
    let month = parseInt(dateTime.slice(4, 6), 10) - 1; 
    let day = parseInt(dateTime.slice(6, 8), 10);
    let hour = parseInt(dateTime.slice(9, 11), 10);
    let minute = parseInt(dateTime.slice(11, 13), 10);
    let second = parseInt(dateTime.slice(13, 15), 10);

    if (newDateTime.getFullYear() !== year || newDateTime.getMonth() !== month || newDateTime.getDate() !== day ||
        newDateTime.getHours() !== hour || newDateTime.getMinutes() !== minute || newDateTime.getSeconds() !== second) {
        return false;
    }

    return true;
}


/**
 * Main function to process an iCalendar file. Reads the file, processes the events, and validates them.
 * @param {String} filePath - Location of the iCalendar file.
 * @param {Function} callback - Callback function for asynchronous handling.
 */

function processICalFile(filePath, callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            callback(err, null);
            return;
        }

        const lines = data.split('\n');
        let currentEvent = {};
        let events = [];
        let inCalendar = false;
        let inEvent = false;
        const validProperties = ['BEGIN', 'END', 'DTSTART', 'DTSTAMP', 'METHOD', 'STATUS', 'CREATED', 'DTEND', 'DURATION', 'LAST-MODIFIED', 'NAME', 'ORGANIZER', 'DESCRIPTION', 'ATTENDEE', 'VERSION', 'PRODID']; 

        // Processing algorithm taken directly from Hw2 and modified to fit the requirements of this problem
        // Valid properties invoked to check if any unrecognized properties are present in the VEVENT component
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === 'BEGIN:VCALENDAR') {
                inCalendar = true;
            } else if (line === 'END:VCALENDAR') {
                inCalendar = false;
            } else if (line === 'BEGIN:VEVENT') {
                if (!inCalendar) {
                    throw new Error('VEVENT found outside of VCALENDAR');
                }
                inEvent = true; // Flag to indicate that we are in an event
                currentEvent = {}; // Instantiates a new event object
            } else if (line === 'END:VEVENT') {
                if (!inEvent) {
                    throw new Error('END:VEVENT without BEGIN:VEVENT');
                }
                inEvent = false;
                if (isValidEvent(currentEvent)) {
                    events.push(currentEvent); // Push to event array
                }
                currentEvent = {};
            } else if (inEvent) {  // Assuming all validations are passed, push the properties to the current event object
                let [key, value] = line.split(':').map(s => s.trim());
                if (key && value) {
                    if (!validProperties.includes(key.toUpperCase())) {
                        callback(new Error("Unrecognized property in VEVENT"), null);
                        return;
                    }
                    currentEvent[key] = value;
                }
            }
        }

        // Check for required properties in VCALENDAR - Constant values
        if (!data.includes('VERSION:2.0') || !data.includes('PRODID:')) {
            throw new Error('Missing required VERSION or PRODID in VCALENDAR');
        }


        // Validates that there should not be multiple events on the same day
        let dates = events.map(event => event['DTSTART']);
        if (dates.length !== new Set(dates).size) {
            throw new Error('Multiple events on the same day');
        }
        
        callback(null, events);
    });
}


path = '/Users/parshvamehta/Spring-2024/SWE-2024/Homework3/hw3-test.txt';
processICalFile(path , (err, events) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Validated Events:', events);
    }
});

module.exports = { processICalFile };
