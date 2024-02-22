// Testing for Homework 4. All dependencies are mocked - no actual file I/O or network requests are made. 
// Tests are for each individual function in hw4.js and are independent of each other. 
// Main function binds them together

const fs = require('fs');
const ICAL = require('ical.js');
const server = require('./hw4.js');

jest.mock('fs');
jest.mock('ical.js');
jest.mock('prompt-sync', () => () => jest.fn().mockReturnValue('mocked value'));

describe('Reservation System', () => {
    const mockFilePath = 'mock-cal.ics';
    const mockData = ''; 

    beforeEach(() => {
        fs.writeFileSync.mockClear();
        fs.readFileSync.mockClear();// Clears any previous spying
    });

    describe('writeReservationToFile', () => {
        it('Should write a reservation to file', () => {
            fs.readFileSync.mockReturnValue(mockData);
            const newEvent = new ICAL.Component(['vevent', [], []]);
            const result = server.writeReservationToFile(mockFilePath, newEvent);
            expect(result).toBe(true);
            expect(fs.writeFileSync).toHaveBeenCalled();
        });
    });

    describe('reserveDate', () => {
        it('Should reserve a date and log confirmation', () => {
            const logSpy = jest.spyOn(console, 'log');
            fs.readFileSync.mockReturnValue(mockData);
            server.reserveDate('John Doe', '20240515T120000', '20240220T120000');
            expect(logSpy).toHaveBeenCalled();
            logSpy.mockRestore();
        });
    });

    describe('generateConfirmationCode', () => {
        it('Should generate a UID-like confirmation code', () => {
            const code = server.generateConfirmationCode();
            expect(code).toHaveLength(36);
            expect(typeof code).toBe('string');
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
            expect(code).toMatch(uuidRegex);
        });
    });

    describe('findNextAvailableDates', () => {
        it('should find next available dates', () => {
            fs.readFileSync.mockReturnValue(mockData);
            const availableDates = server.findNextAvailableDates('2024-02-20', 5);
            expect(availableDates.length).toBeLessThanOrEqual(5);
        });
    });

    describe('getBookedDates', () => {
        it('should return booked dates', () => {
            fs.readFileSync.mockReturnValue(mockData);
            const bookedDates = server.getBookedDates();
            expect(Array.isArray(bookedDates)).toBe(true);
        });
    });

    describe('lookupReservations', () => {
        it('should return reservation dates for an attendee and log them', () => {
            const logSpy = jest.spyOn(console, 'log');
            fs.readFileSync.mockReturnValue(mockData);
            server.lookupReservations('John Doe');
            expect(logSpy).toHaveBeenCalled();
            logSpy.mockRestore();
        });
    });

    describe('cancelReservation', () => {
        it('should cancel a reservation and log the result', () => {
            const logSpy = jest.spyOn(console, 'log');
            fs.readFileSync.mockReturnValue(mockData);
            server.cancelReservation('John Doe', 'CONFIRM123');
            expect(logSpy).toHaveBeenCalled();
            logSpy.mockRestore();
        });
    });
});
