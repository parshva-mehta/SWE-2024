const fs = require('fs');
const { processFile } = require('./hw2.js');


/*
    Overall pretty self explanatory - Test titles describe the tests. 
    Mocking the fs module to avoid file I/O.
    Testing for valid input, edge cases, and invalid input and case insensitivity.
*/


jest.mock('fs');

describe('Record Processing with Valid Input', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should correctly process and sort records with valid input', () => {
    const mockData = `          BEGIN:RECORD
                                IDENTIFIER: 123
                                TIME: 20240101T130000
                                END:RECORD
                                BEGIN:RECORD
                                IDENTIFIER: 456
                                TIME: 20240101T120000
                                END:RECORD`;

    fs.readFileSync.mockImplementation(() => mockData);

    processFile('path', (err, data) => {
      expect(err).toBeNull();
      expect(data).toBeDefined();
      
      const sortedData = data.split('\n\n').map(record => record.split('\n')[1]); // Extract IDENTIFIER lines to compare
      expect(sortedData).toEqual([
        'IDENTIFIER: 456', 
        'IDENTIFIER: 123'
      ]);
    });
  });

    test('should correctly process and sort records with case insensitive input', () => {
        const mockData = `    BEGIN:RECORD
                              identifier: 123
                              time: 20240101T130000
                              end:record
                              BEGIN:RECORD
                              IDENTIFIER: 456
                              TIME: 20240101T120000
                              END:RECORD`;

        
        fs.readFileSync.mockImplementation(() => mockData);
        processFile('path', (err, data) => {
            expect(err).toBeNull();
            expect(data).toBeDefined();
            
            const sortedData = data.split('\n\n').map(record => record.split('\n')[1]); 
            expect(sortedData).toEqual([
              'IDENTIFIER: 456', 
              'IDENTIFIER: 123'
            ]);
          });

    });

});

describe('Record Processing Edge Cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
      });

    test('should throw an error for missing required properties', () => {
      const mockData = `BEGIN:RECORD
                        END:RECORD`;
  
      fs.readFileSync.mockReturnValue(mockData);
  
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('Record is missing required properties');
                expect(data).toBeNull();
            });
        });
    });

    test('should throw an error for missing END property', () => {
        const mockData = `BEGIN:RECORD
                          IDENTIFIER: 123
                          TIME: 20240101T130000`;
    
        fs.readFileSync.mockReturnValue(mockData);
    
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('Record has no END');
                expect(data).toBeNull();
            });
        });
    });

    test('should throw an error for missing BEGIN property', () => {
        const mockData = `IDENTIFIER: 123
                          TIME: 20240101T130000
                          END:RECORD`;
    
        fs.readFileSync.mockReturnValue(mockData);
    
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('Record has no BEGIN');
                expect(data).toBeNull();
            });
        });
    });

    test('should throw an error for an empty file', () => {
        const mockData = '';
    
        fs.readFileSync.mockReturnValue(mockData);
    
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('File is empty');
                expect(data).toBeNull();
            });
        });
    });

    test('should throw an error for a new record started without finishing the old record', () => {
        const mockData = `BEGIN:RECORD
                          IDENTIFIER: 123
                          TIME: 20240101T130000
                          BEGIN:RECORD
                          IDENTIFIER: 456
                          TIME: 20240101T120000
                          END:RECORD`;
    
        fs.readFileSync.mockReturnValue(mockData);
    
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('Record has no END');
                expect(data).toBeNull();
            });
        });
    });
    
    test('should throw an error for a record ended twice', () => {
        const mockData = `BEGIN:RECORD
                          IDENTIFIER: 123
                          TIME: 20240101T130000
                          END:RECORD
                          END:RECORD`;
    
        fs.readFileSync.mockReturnValue(mockData);
    
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('Record has no BEGIN');
                expect(data).toBeNull();
            });
        });
    });

    test('should throw an error for an invalid time format', () => {
        const mockData = `BEGIN:RECORD
                          IDENTIFIER: 123
                          TIME: 20240101T1300000
                          END:RECORD`;
    
        fs.readFileSync.mockReturnValue(mockData);
    
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('Invalid time format');
                expect(data).toBeNull();
            });
        });
    });

    test('should throw an error for duplicate properties', () => {
        const mockData = `BEGIN:RECORD
                          IDENTIFIER: 123
                          IDENTIFIER: 123
                          TIME: 20240101T130000
                          END:RECORD`;
    
        fs.readFileSync.mockReturnValue(mockData);
    
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('Record has duplicate properties');
                expect(data).toBeNull();
            });
        });
    });

    test('should throw an error for more than one property per line', () => {
        const mockData = `BEGIN:RECORD
                          IDENTIFIER: 123456 TIME: 20240101T130000
                          END:RECORD`;
    
        fs.readFileSync.mockReturnValue(mockData);
    
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('Record has more than one property per line');
                expect(data).toBeNull();
            });
        });
    });

    test('should throw an error for missing required property', () => {
        const mockData = `BEGIN:RECORD
                          TIME: 20240101T130000
                          END:RECORD`;
    
        fs.readFileSync.mockReturnValue(mockData);
    
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('Record is missing required properties');
                expect(data).toBeNull();
            });
        });
    });


    test('should throw an error for WEIGHT without UNITS', () => {
        const mockData = `BEGIN:RECORD
                          IDENTIFIER: 123
                          TIME: 20240101T130000
                          WEIGHT: lbs
                          END:RECORD`;
    
        fs.readFileSync.mockReturnValue(mockData);
    
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('Invalid weight format');
                expect(data).toBeNull();
            });
        });
    });

    
    test('should throw an error for UNITS without WEIGHT', () => {
        const mockData = `BEGIN:RECORD
                          IDENTIFIER: 123
                          TIME: 20240101T130000
                          UNITS: lbs
                          END:RECORD`;
    
        fs.readFileSync.mockReturnValue(mockData);
    
        expect(() => {
            processFile('path', (err, data) => {
                expect(err).toBe('Record must have UNITS if WEIGHT is present');
                expect(data).toBeNull();
            });
        });
    });
});
