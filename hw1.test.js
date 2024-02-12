const { dateTimeConvert } = require('./hw1.js');

describe('dateTimeConvert', () => {

    test('Randomized Valid Inputs', () => {
        expect(dateTimeConvert('20240101T010101')).toBe('January 1, 2024, at 1:01:01 AM');
        expect(dateTimeConvert('19980118T230000')).toBe('January 18, 1998, at 11 PM');
        expect(dateTimeConvert('20230323T200000')).toBe('March 23, 2023, at 8 PM');
        expect(dateTimeConvert('20030610T033000')).toBe('June 10, 2003, at 3:30 AM');
    });

    test('Invalid Inputs', () => {
        expect(dateTimeConvert('20241301T120000')).toBe('Invalid Date/Time- Please enter a valid date');        // Invalid Month
        expect(dateTimeConvert('20240333T120000')).toBe('Invalid Date/Time- Please enter a valid date');        // Invalid Day
        expect(dateTimeConvert('20240101T240000')).toBe('Invalid Date/Time- Please enter a valid date');        // Invalid Hour
        expect(dateTimeConvert('20240101T126100')).toBe('Invalid Date/Time- Please enter a valid date');        // Invalid Minutes
        expect(dateTimeConvert('20240101T122562')).toBe('Invalid Date/Time- Please enter a valid date');        // Invalid Seconds
    });

    test('Special Characters in Input', () => {
        expect(dateTimeConvert('2024@101T120000')).toBe('Invalid Date/Time- Please enter a valid date');        //Handles any non numeric input
    });

    test('Incorrect Length of Input String', () => {
        expect(dateTimeConvert('20240101T12')).toBe('Invalid Date/Time- Please enter a valid date');            // Missing input values
        expect(dateTimeConvert('20240101T120000123')).toBe('Invalid Date/Time- Please enter a valid date');     // Extra input values
    });

    test('Typography Correctness', () => {
        expect(dateTimeConvert('20240101T000000')).toBe('January 1, 2024, at 12 AM');                           // Midnight
        expect(dateTimeConvert('20240101T120000')).toBe('January 1, 2024, at 12 PM');                           // Noon
    });

    test('February 29th - Non Leap Year (Invalid)', () => {
        expect(dateTimeConvert('20230229T100000')).toBe('Invalid Date/Time- Please enter a valid date');        
    });

    test('February 29th - Leap Year (Valid)', () => {
        expect(dateTimeConvert('20240229T100000')).toBe('February 29, 2024, at 10 AM');
    });

    test('Edge cases during transition to new year', () => {
        expect(dateTimeConvert('20231231T235959')).toBe('December 31, 2023, at 11:59:59 PM');
        expect(dateTimeConvert('20240101T000001')).toBe('January 1, 2024, at 12:00:01 AM');
    });

    test('Input with whitespace', () => {
        expect(dateTimeConvert(' 2024  0101   T120000   ')).toBe('January 1, 2024, at 12 PM');
    });
});
