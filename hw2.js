/* 

Author: Parshva Mehta
Class: Software Engineering
Assignment: Homework 2
Date: 02/05/24

Description:
This program reads a file and processes the records within it. It checks for the validity of the records and then sorts them by time. 
It then writes the sorted records to a new file. Testing for this program is handled by the test file hw2.test.js, using JEST's mocking capabilities to avoid file I/O.
*/


const fs = require('fs');
const path = require('path');   


// Taken from Hw1, modified to act as a validation function rather than a conversion to English language function
function isValidTime(dateTime){
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

    if (newDateTime.getFullYear() !== year || newDateTime.getMonth() !== month || newDateTime.getDate() !== day) {
        return false;
    }
    if (dateTime.length < 15 || dateTime.slice(8,9) != "T") {
        return false;
    } 
    else if (!isLeapYear && parseInt(dateTime.slice(4, 6)) === 2 && parseInt(dateTime.slice(6, 8)) >= 29) {
        return false;
    } 
    else if (!month || isNaN(dateNum) || isNaN(year) || isNaN(hour)) {
        return false;
    } 

}

/**
 * Takes a record object as an input and outputs a boolean value based on the validity of the input.
 * @param {Object} record- Record Object with properties (IDENTIFIER, TIME, WEIGHT, COLOR, UNITS). 
 * @returns {boolean} - True if valid, throw error if invalid.
 */

function isValidInput(record){
    const requiredProperties = ['IDENTIFIER', 'TIME']
    const optionalProperties = ['WEIGHT', 'COLOR']
    let units = false;

    // Check if all required properties are present
    for (let i = 0; i < requiredProperties.length; i++){
        if (record.hasOwnProperty(requiredProperties[i]) === false){
            throw new Error('Record is missing required properties');
        }
    }

    // Check if UNITS are present if WEIGHT is present
    if (record.hasOwnProperty('WEIGHT')){
        if (record.hasOwnProperty('UNITS') === false){
            throw new Error("Record must have UNITS if WEIGHT is present");
        }
        units = true;
    }
    
    // Check if TIME is in the correct format

    if (isValidTime(record['TIME']) === false){
        throw new Error('Invalid Date/Time- Please enter a valid date');
    }

    // Check if all properties are unique
    const propertyNum = Object.keys(record);
    const uniqueProperties = new Set(propertyNum);
    if(propertyNum.length !== uniqueProperties.size){
        throw new Error('Record has duplicate properties');
    }
    
    // Check if there is only one property per line
    for (let i = 0; i < propertyNum.length; i++){
        colonCount = (propertyNum[i].match(/:/g) || []).length;
        if (colonCount > 1){
            throw new Error('Record has more than one property per line');
        }
    }
    
    // If all properties are valid, return true - continue execution
    return true
}


/**
 * Takes in an Array of unsorted records and sorts them by time. 
 * @param {Object Array} records- Array of record objects given by input file 
 * @returns {Object Array} - Sorted by time
 */

function sortRecords(recordSet) {
    return recordSet.sort((a, b) => {
        const dateA = new Date(a.TIME.substring(0, 4), a.TIME.substring(4, 6), a.TIME.substring(6, 8),
                              a.TIME.substring(9, 11), a.TIME.substring(11, 13), a.TIME.substring(13, 15));
        const dateB = new Date(b.TIME.substring(0, 4), b.TIME.substring(4, 6), b.TIME.substring(6, 8),
                              b.TIME.substring(9, 11), b.TIME.substring(11, 13), b.TIME.substring(13, 15));
        return dateA - dateB;
    });
}

/**
 * Takes a record object as an input and outputs a boolean value based on the validity of the input.
 * @param {Object Array} records - Array of record objects given by input file
 * @returns {string} - Takes object array and converts to string for output to file. Numbers each record for human readability
 */
function recordsToString(records) {
    return records.map((record, index) => {
        const recordString = Object.keys(record).map(key => `${key}: ${record[key]}`).join('\n');
        return `${index + 1}. Record\n${recordString}`;
    }).join('\n\n');
}

/**
 * Helper function to output record data into file
 * @param {any} data - Any data to be written to file
 * @returns {void} - No return value
 */
function printToFile(data, outputPath) {
    fs.writeFile(outputPath, data, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        }
    });
}

/**
 * Main file processing function. Reads the file, processes the records, sorts them, and writes the sorted records to a new file.
 * @param {String} path - Location of input file
 * @returns {String} - Sorted records as a string
 */

function processFile(path, callback){
    fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            callback(err, null);
            return;
        }

        const property = data.split('\n');
        let length = property.length;
        let currentRecord = {};
        let records = [];
        let parseRecord = false;  // Flag to check if we are parsing a record
        let hasProperty = false;  // Flag to check if a record has any properties - error if blank

        for (let i = 0; i < length; i++){
            upper = property[i].trim().toUpperCase();  // Case insensitive

            if (upper === 'BEGIN:RECORD') {
                if(parseRecord === true){
                    throw new Error('Record has no END');
                }
                parseRecord = true;
                currentRecord = {};  // Instantiate a new record
                hasProperty = false;
            } 
            else if (upper === 'END:RECORD') {
                if(parseRecord === false){
                    throw new Error('Record has no BEGIN');
                }
                if(hasProperty === false){
                    throw new Error('Record is missing required properties');
                }
                parseRecord = false;
                if (isValidInput(currentRecord)) {
                    records.push(currentRecord);
                }
                currentRecord = {};
            } 
            else if (parseRecord === true) {
                let [key, value] = property[i].split(':').map(s => s.trim());
                if (key && value) {
                    currentRecord[key.toUpperCase()] = value;  // Save to array for sorting
                    hasProperty = true;
                }
            }
        }

        const sorted = sortRecords(records);
        const output = recordsToString(sorted);   // Convert to string to output to file
        printToFile(output, '/Users/parshvamehta/Spring-2024/SWE-2024/Homework2/test-output.txt');
        return output; // Return output for test bench
    });
}

processFile('/Users/parshvamehta/Spring-2024/SWE-2024/Homework2/test.txt')
module.exports = { processFile };

