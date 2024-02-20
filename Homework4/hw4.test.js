const fs = require('fs');
const server = require('./hw4'); // Adjust the path according to your project structure
const prompt = require('prompt-sync')();

// Mocking fs and prompt-sync globally
jest.mock('fs');
jest.mock('prompt-sync', () => {
  return () => jest.fn();
});

// Tests for reserveDate
describe('reserveDate Tests', () => {
  beforeAll(() => {
    jest.mock('moment', () => {
      const actualMoment = jest.requireActual('moment');
      const mockMoment = (...args) => {
        const instance = actualMoment(...args);
        instance.add = jest.fn((amount, unit) => actualMoment(instance).add(amount, unit));
        instance.format = jest.fn(() => actualMoment(instance).format());
        return instance;
      };
      mockMoment.utc = jest.fn(() => actualMoment.utc());
      return mockMoment;
    });
  });

  afterAll(() => {
    jest.unmock('moment');
  });

  test('reserveDate handles valid reservation process correctly', () => {
    const prompt = require('prompt-sync')();
    prompt.mockReturnValueOnce('1') // User chooses the first available date
           .mockReturnValueOnce('John Doe') // Name for the reservation
           .mockReturnValueOnce('john@example.com') // Email for the reservation
           .mockReturnValueOnce('12:00 PM') // Start time
           .mockReturnValueOnce('Meeting with John'); // Summary

    fs.readFileSync.mockReturnValue(/* Mocked calendar data */);
    fs.writeFileSync.mockImplementation(() => {});

    const calMock = {
      createEvent: jest.fn().mockReturnValue({ uid: () => '12345' }),
      events: jest.fn().mockReturnValue([]),
      // Other necessary calendar functions
    };

    expect(() => server.reserveDate(calMock)).not.toThrow();
    expect(calMock.createEvent).toHaveBeenCalled();
  });

  // Additional reserveDate tests...
});

// Tests for cancelReservation
describe('cancelReservation Tests', () => {
  test('cancelReservation cancels a reservation correctly', () => {
    const prompt = require('prompt-sync')();
    prompt.mockReturnValue('valid-event-id'); // Mock user input for event ID

    const calMock = {
      events: jest.fn().mockReturnValue([
        { uid: () => 'valid-event-id', /* other event properties */ },
        // Other mock events
      ]),
      // Other necessary calendar functions
    };

    server.cancelReservation(calMock);
    expect(calMock.events).toHaveBeenCalledWith(/* Expected filtered events */);
  });

});

// Additional tests for lookupReservations...
// ... (previous code)

// Tests for lookupReservations
describe('lookupReservations Tests', () => {
    let calMock;
  
    beforeEach(() => {
      calMock = {
        events: jest.fn()
      };
    });
  
    test('lookupReservations finds a reservation correctly', () => {
      const prompt = require('prompt-sync')();
      prompt.mockReturnValue('valid-event-id'); // Mock user input for event ID
  
      const mockEvent = {
        uid: () => 'valid-event-id',
        start: () => new Date('2024-02-20T12:00:00'),
        summary: () => 'Meeting with John'
        // Add other necessary properties of the event
      };
  
      calMock.events.mockReturnValue([mockEvent]);
  
      console.log = jest.fn(); // Mock console.log to capture output
      server.lookupReservations(calMock);
  
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Found reservation'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('valid-event-id'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Meeting with John'));
    });
  
    test('lookupReservations does not find a reservation with an invalid ID', () => {
      const prompt = require('prompt-sync')();
      prompt.mockReturnValue('invalid-event-id'); // Mock user input for an invalid event ID
  
      calMock.events.mockReturnValue([]); // No events in the calendar
  
      console.log = jest.fn(); // Mock console.log to capture output
      server.lookupReservations(calMock);
  
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No reservation found'));
    });
  
    // Additional tests as needed...
  });
  
  // ... (rest of the code)
  