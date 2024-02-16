const fs = require('fs');
const ical = require('node-ical');
const path = require('path');
const prompt = require('prompt-sync')();

const filePath = 'datafile.json';

function readAvailableDates() {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent).availableDates;
}

function writeAvailableDates(dates) {
  const data = { availableDates: dates };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function scheduleEventFromICS(icsFilePath) {
  const icsData = fs.readFileSync(icsFilePath, 'utf8');
  const parsedData = ical.parseICS(icsData);

  for (let key in parsedData) {
    if (parsedData.hasOwnProperty(key) && parsedData[key].type === 'VEVENT') {
      const eventDate = parsedData[key].start.toISOString().split('T')[0]; // Extracting date in 'YYYY-MM-DD' format
      console.log("Scheduled event on: ", eventDate);
      const availableDates = readAvailableDates();
      
      if (availableDates.includes(eventDate)) {
        const updatedDates = availableDates.filter(d => d !== eventDate);
        writeAvailableDates(updatedDates);
        console.log(`Event on ${eventDate} scheduled successfully.`);
        return;
      } 
      else {
        throw new Error('Date not available or invalid.');
      }
    }
  }
  throw new Error('No valid event found in the provided iCalendar file.');
}

const dataFilePath = path.join(__dirname, 'datafile.json');

function getNext4AvailableDates() {
    const dates = [];
    let date = new Date();

    while (dates.length < 4) {
        date.setDate(date.getDate() + 1); // Move to the next day
        const dayOfWeek = date.getDay();

        // Skip weekends (Saturday: 6, Sunday: 0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            dates.push(date.toISOString().split('T')[0]); // Add date in 'YYYY-MM-DD' format
        }
    }

    return dates;
}

function populateDataFile() {
    const dates = getNext4AvailableDates();
    const data = { availableDates: dates };
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');

    if(!fs.existsSync (dataFilePath) || readAvailableDates().length === 0) {
        populateDataFile();
        console.log(`Data file populated with the next 4 available dates.`);
    
}
}


function resetCalendar() {
  populateDataFile();
  console.log('Calendar reset successfully.');
}


function main(){
    console.log("ICalendar file processing system. Please use the following commands to interact with the system");
    console.log("1. Schedule an Event: ");
    console.log("2. Reset Calendar: ");
    console.log("3. Exit: ");
    let choice = prompt();
    choice = parseInt(choice);


    switch(choice){
        case 1:
            console.log("Enter the file path: ");
            let filePath = prompt();
            scheduleEventFromICS(filePath);
            break;
        case 2:
            resetCalendar();
            break;
        case 3:
            console.log("Exiting");
            break;
        default:
            console.log("Invalid choice. Exiting");
            break;
    }
}

main();