/* 
Project Assignment: 

Write a program that takes command line input on a console written as a single string of characters representing a date-time group. The program should accept the following format:
YYYYMMDDTHHMMSS (Year/Month/Day/T/Hour/Minute/Second)

For example, the following represents January 18, 1998, at 11 PM: 19980118T230000
After reading the input string, the program should use the input value to create a JavaScript Date object56 and print it out as is commonly used in the United States, such as:
January 18, 1998, at 11 PM

The program should run in a loop, accept the input value and print the output. The solution should
include extensive Jasmine test cases, particularly for edge cases (described in Section 1.1.3)


Author: Parshva Mehta
Class: Software Engineering
Assignment: Homework 1
Date: 01/29/24
Dependencies: "prompt-sync": "^4.2.0"


NOTE *** The execution of this program has been commented out on line 127 for testing purposes. Please uncomment this line to run the program in terminal ***
*/

function main(){
    goNext = true;
    while(goNext){
        const prompt = require('prompt-sync')();
        dateTime = prompt("Enter Date-Time: ");
        if (dateTime == 0){
            goNext == false;
            console.log("Terminating Program")
            break;
        }
        else{
            console.log(dateTimeConvert(dateTime));
        }
    }
}


/**
 * Takes in an input of a date/time string and uses the Date() object to convert it into common language as used in the United States.
 * @param {string} dateTime- Input string in form (YYYYMMDDTHHMMSS).
 * @returns {string} convertedDateTime -- An english translation of the date and time inputted.
 */

function dateTimeConvert(dateTime) {
    let isLeapYear = false;
    let convertedDateTime = '';

    dateTime = dateTime.trim();
    // Truncating extra input
    if (dateTime.length !== 15 || dateTime[8] !== 'T') {
        return "Invalid Date/Time- Please enter a valid date";
    }

    let date = dateTime.slice(0, 4) + "-" + dateTime.slice(4, 6) + "-" + dateTime.slice(6, 8);
    let time = dateTime.slice(9, 11) + ":" + dateTime.slice(11, 13) + ":" + dateTime.slice(13, 15);

    let convert = date + "T" + time;
    const newDateTime = new Date(convert);

    let year = parseInt(dateTime.slice(0, 4), 10);
    let month = parseInt(dateTime.slice(4, 6), 10) - 1; 
    let day = parseInt(dateTime.slice(6, 8), 10);

    // Checks date object values compared to input values to ensure validity (Combats overflow error)
    if (newDateTime.getFullYear() !== year || newDateTime.getMonth() !== month || newDateTime.getDate() !== day) {
        return "Invalid Date/Time- Please enter a valid date";
    }

    let monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Using Date object to get information of date/time
    month = monthList[newDateTime.getMonth()];
    let dateNum = newDateTime.getDate();
    let hour = newDateTime.getHours();
    let minute = newDateTime.getMinutes();
    let seconds = newDateTime.getSeconds();
    year = newDateTime.getFullYear();

    let typography = "AM";
    if (hour >= 12) {
        typography = "PM";

        if(hour > 12){
            hour = hour - 12;
        }
        else{
            hour = hour;
        }
    } 
    else if (hour === 0) {
        hour = 12;
    }

    if (year % 4 === 0) {
        isLeapYear = true;
    }


    // Edgecases / Output Manipulation
    if (dateTime.length < 15 || dateTime.slice(8,9) != "T") {
        return "Invalid Date/Time- Please enter a valid date";
    } 
    else if (!isLeapYear && parseInt(dateTime.slice(4, 6)) === 2 && parseInt(dateTime.slice(6, 8)) >= 29) {
        return "Invalid Date/Time- Please enter a valid date";
    } 
    else if (!month || isNaN(dateNum) || isNaN(year) || isNaN(hour)) {
        return "Invalid Date/Time- Please enter a valid date";
    } 
    else {
        if(seconds === 0 && minute === 0){
            convertedDateTime = month + " " + dateNum + ", " + year + ", at " + hour + " " + typography;
        }
        else if(seconds == 0){
            convertedDateTime = month + " " + dateNum + ", " + year + ", at " + hour + ":" + dateTime.slice(11, 13) + " " + typography;
        }
        else{
            convertedDateTime = month + " " + dateNum + ", " + year + ", at " + hour + ":" + dateTime.slice(11, 13) + ":" + dateTime.slice(13, 15) + " " + typography;
        }
    }
    return convertedDateTime;
}
//Uncomment this line to run program in terminal 
//main();
module.exports = {dateTimeConvert};
