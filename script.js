import * as my_dongle from "bleuio";
import "regenerator-runtime/runtime";

const output = document.querySelector("#output");
const connectButton = document.querySelector("#connectButton");
const scanButton = document.querySelector("#scanButton");
const scanTimeLimitField = document.querySelector("#scanTimeLimitField");

let connected = false;

/**
 * Connects / disconnects the dongle
 */
const handleConnect = async () => {
  if (!connected) {
    connect();
  } else {
    disconnect();
  }
};
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

connectButton.addEventListener("click", handleConnect);

/**
 * Connects the the dongle via the computers COM port
 * Prompts the user to choose port from dialog in chrome
 * Enables the button to start the scan
 */
const connect = async () => {
  // Connect to dongle
  await my_dongle.at_connect();

  connectButton.textContent = "Disconnect";
  output.textContent = "Connected to dongle";

  connected = true;

  displayresult = true
  await my_dongle.at_central();
  while (displayresult){
    // Start scanning, at_gapscan() returns a promise with the scan data
    const response = await my_dongle.at_gapscan(scanTimeLimitField.value, false);
    var lookupdevice="48:23:35:00:0E:1A";
    // Print the response to the DOM
    printResponse(response,lookupdevice);
    await sleep(1000)
  }
  scanButton.classList.remove("disabled");

};

/**
 * Disconnects the dongle from the browser
 */
const disconnect = async () => {
  // Stop any ongoing process
  await my_dongle.stop();
  // Disconnects the dongle
  await my_dongle.at_disconnect();

  connected = false;

  output.textContent = "Dongle disconnected";

  // Disable the scan button to avoid errors
  scanButton.removeEventListener("click", handleScanButton);
  scanButton.classList.add("disabled");

  connectButton.textContent = "Connect";
};

/**
 * Handles the scan process.
 * First the dongle will be set in central role.
 * Then perform a scan and print out the response.
 */
const handleScanButton = async () => {
  output.textContent = "";

  scanButton.classList.add("disabled");
  // Set the dongle in central role
  await my_dongle.at_central();

  // Start scanning, at_gapscan() returns a promise with the scan data
  const response = await my_dongle.at_gapscan(scanTimeLimitField.value, false);
  var lookupdevice="HibouAIR";
  // Print the response to the DOM
  printResponse(response,lookupdevice);
  scanButton.classList.remove("disabled");
};

/**
 * Prints a response to the DOM
 * @param {String} response the message to be printed to the DOM
 */
const printResponse = (response,lookupdevice) => {
  // Some of the dongles functions returns the data in an Array
  if (Array.isArray(response)) {
    response.forEach((data) => {
      
      const outputLine = document.createElement("p");
      outputLine.setAttribute("style", "margin: 2px");
      if (data.indexOf(lookupdevice) > -1){
        var nowtime = new Date().toLocaleString();
        outputLine.textContent = data + ' ' + nowtime;
      }

      output.appendChild(outputLine);
    
    });
  } else {
    const outputLine = document.createElement("p");
    outputLine.setAttribute("style", "margin: 2px");
    outputLine.textContent = response;

    output.appendChild(outputLine);
  }
};