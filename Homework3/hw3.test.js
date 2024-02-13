/* 
Author: Parshva Mehta
Date: 02/09/2024

Assignment: Homework 3 Testing file

Testing file for the processICalFile function in hw3.js. Uses JEST's mocking feature to test the function with different iCalendar file contents in order to avoid file I/O operations.
Should be pretty self explanatory, 2 test suites are defined, one for valid cases and one for edge cases.

:)
*/

const fs = require('fs');
const { processICalFile } = require('./hw3');

jest.mock('fs');


describe('iCalendar File Processing Valid Cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should correctly process a valid iCalendar file', () => {
        const mockData = `BEGIN:VCALENDAR
                          VERSION:2.0
                          PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                          BEGIN:VEVENT
                          DTSTART:20240101T090000
                          DTEND:20240101T100000
                          METHOD:REQUEST
                          STATUS:CONFIRMED
                          SUMMARY:DOCTOR VISIT
                          END:VEVENT
                          END:VCALENDAR`;

        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).toBeNull();
            expect(data).toHaveLength(1);
        });
    });

    test('should correctly process multiple VEVENT components', () => {
        const mockData =   `BEGIN:VCALENDAR
                            VERSION:2.0
                            PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                            BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY:DOCTOR VISIT
                            END:VEVENT
                            BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY:DOCTOR VISIT
                            END:VEVENT
                            END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).toBeNull();
            expect(data).toHaveLength(2);
        });
    });
});

describe('iCalendar File Processing Edge Cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error for missing required properties', () => {
        const mockData = `BEGIN:VCALENDAR
                          VERSION:2.0
                          PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                          BEGIN:VEVENT
                          DTSTART:20240101T090000
                          END:VEVENT
                          END:VCALENDAR`;

        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('missing required property');
        });
    });
    test('should throw an error for invalid DATE-TIME format', () => {
        const mockData = `BEGIN:VCALENDAR
                          VERSION:2.0
                          PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                          BEGIN:VEVENT
                          DTSTART:20240101T090000
                          DTEND:20240101T080000
                          SUMMARY:DOCTOR VISIT
                          END:VEVENT
                          END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('invalid DATE-TIME format');
        });
    });

    test('should throw an error for incorrect METHOD and STATUS values', () => {
        const mockData =   `BEGIN:VCALENDAR
                            VERSION:2.0
                            PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                            BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:PUBLISH
                            STATUS:I DONT KNOW
                            SUMMARY:DOCTOR VISIT
                            END:VEVENT
                            END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('incorrect METHOD or STATUS values');
        });
    });

    test('should throw an error for VEVENT found outside of VCALENDAR', () => {
        const mockData =   `BEGIN:VEVENT
                            DTSTART:20240101T090000
                            BEGIN:VCALENDAR
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY:DOCTOR VISIT
                            END:VEVENT`;

        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('VEVENT found outside of VCALENDAR');
        });
        

    });

    test('should throw an error for missing VCALENDAR tags', () => {
        const mockData =   `BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY:DOCTOR VISIT
                            END:VEVENT`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('VEVENT found outside of VCALENDAR');
        });
    });

    // Missing VERSION or PRODID
    test('should throw an error for missing VERSION or PRODID', () => {
        const mockData =   `BEGIN:VCALENDAR
                            PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                            BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY:DOCTOR VISIT
                            END:VEVENT
                            END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('Missing required VERSION or PRODID in VCALENDAR');
        });
    });

    test('should throw an error for missing VERSION or PRODID', () => {

        const mockData =   `BEGIN:VCALENDAR
                            VERSION:2.0
                            BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY:DOCTOR VISIT
                            END:VEVENT
                            END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('Missing required VERSION or PRODID in VCALENDAR');
        });
    });

    test('should log a warning for unrecognized properties', () => {
        const mockData =   `BEGIN:VCALENDAR
                            VERSION:2.0
                            PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                            BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY:DOCTOR VISIT
                            SAUCE:BBQ
                            END:VEVENT
                            END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('Unrecognized property in VEVENT');
        });
    });

    test('should throw an error for an empty file', () => {
        fs.readFileSync.mockImplementation(() => '');
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('File is empty');
        });
    });

    test('should correctly process multiple VEVENT components', () => {
        const mockData =   `BEGIN:VCALENDAR
                            VERSION:2.0
                            PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                            BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY:DOCTOR VISIT
                            END:VEVENT
                            BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY:DOCTOR VISIT
                            END:VEVENT
                            END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).toBeNull();
            expect(data).toHaveLength(2);
        });
    });


    test('should throw an error for duplicate properties in VEVENT', () => {
        const mockData =   `BEGIN:VCALENDAR
                            VERSION:2.0
                            PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                            BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY:DOCTOR VISIT
                            DTSTART:20240101T090000
                            END:VEVENT
                            END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('Duplicate properties in VEVENT');
        });
    });

    test('should throw an error for invalid property format', () => {
        const mockData =   `BEGIN:VCALENDAR
                            VERSION:2.0
                            PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                            BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY
                            END:VEVENT
                            END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('Invalid property format');
        });
    });

    test('should throw an error for incomplete VEVENT block', () => {
        const mockData =   `BEGIN:VCALENDAR
                            VERSION:2.0
                            PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                            BEGIN:VEVENT
                            DTSTART:20240101T090000
                            DTEND:20240101T080000
                            METHOD:REQUEST
                            STATUS:CONFIRMED
                            SUMMARY:DOCTOR VISIT
                            END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('Incomplete VEVENT block');
        });
    });
    test("should throw an error for DTStamp before DTStart", () => {
        const mockData = `BEGIN:VCALENDAR
                          VERSION:2.0
                          PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                          BEGIN:VEVENT
                          DTSTAMP:20240101T090000
                          DTSTART:20240101T080000
                          DTEND:20240101T090000
                          METHOD:REQUEST
                          STATUS:CONFIRMED
                          SUMMARY:DOCTOR VISIT
                          END:VEVENT
                          END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('DTStamp before DTStart');
        });
    });

    test("should throw an error for multiple events on the same day", () => {
        const mockData = `BEGIN:VCALENDAR
                          VERSION:2.0
                          PRODID:-//XYZ Corp//MOCK ICAL VALIDATOR//EN
                          BEGIN:VEVENT
                          DTSTART:20240101T090000
                          DTEND:20240101T080000
                          METHOD:REQUEST
                          STATUS:CONFIRMED
                          SUMMARY:DOCTOR VISIT
                          END:VEVENT
                          BEGIN:VEVENT
                          DTSTART:20240101T090000
                          DTEND:20240101T080000
                          METHOD:REQUEST
                          STATUS:CONFIRMED
                          SUMMARY:DOCTOR VISIT
                          END:VEVENT
                          END:VCALENDAR`;
        fs.readFileSync.mockImplementation(() => mockData);
        processICalFile('path', (err, data) => {
            expect(err).not.toBeNull();
            expect(err.message).toContain('Multiple events on the same day');
        });
    });
});

