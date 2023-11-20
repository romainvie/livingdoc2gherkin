// variable to store the clicked element (a link)
var clickedElt = null;

// Access the top-level window
var topLevelWindow = window.top;

// Event listener for the "contextmenu" event on the document
// This event is triggered when the user right-clicks to open the context menu
document.addEventListener("contextmenu", function(event) {
    // Retrieve the clicked element when the context menu is displayed
    clickedElt = event.target;
}, true);

// Function to check if a specific tag with a given class is found in the ancestors of an element
function isTagFoundInParents(el, type, tag) {
    // Iterate through the parent nodes of the given element
    while (el.parentNode) {
        // Move to the parent node
        el = el.parentNode;

        // Check if the current parent node has the specified type and class
        if (el.nodeName.toLowerCase() === type && el.classList.contains(tag)) {
            // Set the clicked element to the current parent node
            clickedElt = el;

            // Return true, indicating that the tag with the specified class is found
            return true;
        }
    }

    // If the tag with the specified class is not found in any ancestor, return false
    return false;
}

// This function removes the first two columns from each line of a table represented by a markdown-style string
function removeFirstTwoColumns(inputString) {
    // Split the input string into an array of lines
    let lines = inputString.split(/\r?\n/);

    // Process each line to remove the first two columns
    let processedLines = lines.map(line => {
        // Split the line into an array of columns using the pipe character as the separator
        let columns = line.split('|').map(col => col.trim());

        // Remove the first two columns (index 0 to 2) and join the remaining columns with the pipe character
        let remainingColumns = columns.slice(3).join(' | ');

        // Return the line with the modified columns, including the starting pipe character
        return `| ${remainingColumns}`;
    });

    // Join the processed lines back into a single string
    let resultString = processedLines.join('\n');

    // Return the final string with the first two columns removed from each line
    return resultString;
}

// This function parses a table structure represented by an HTML node and converts it into a markdown-style table.
function parseTable(node) {
    // Initialize a variable to store the resulting text content
    let textContent = '';

    // Check if the current node is a table row (<tr>)
    if (node.nodeName.toLowerCase() === "tr") {
        // Add the starting pipe character for the beginning of a table row
        textContent += "| ";

        // Iterate over child nodes of the table row
        for (let childNode of node.childNodes) {
            // Recursively call the parseTable function for each child node
            textContent += parseTable(childNode);
        }

        // Add a newline character at the end of the table row
        textContent += "\n";
    }
    // Check if the current node is a table cell (<td>) or header cell (<th>)
    else if (node.nodeName.toLowerCase() === "td" || node.nodeName.toLowerCase() === "th") {
        // Iterate over child nodes of the table cell or header cell
        for (let childNode of node.childNodes) {
            // Recursively call the parseTable function for each child node
            textContent += parseTable(childNode) + " | ";
        }
    }
    // If the current node is neither a table row nor a table cell, it may contain text content
    else {
        // Check if the node has text content
        if (node.nodeType === Node.TEXT_NODE) {
            // Append the text content followed by a space
            textContent += node.textContent + " ";
        }

        // Iterate over child nodes of the current node
        for (let childNode of node.childNodes) {
            // Recursively call the parseTable function for each child node
            textContent += parseTable(childNode);
        }
    }

    // Return the accumulated text content
    return textContent;
}

// This function parses a scenario represented by an HTML node and converts it into a Gherkin-style text.
function parseScenario(node) {
    // Initialize a variable to store the resulting text content
    let textContent = '';

    // Check if the current node is a table row (<tr>) or has certain classes indicating scenario-related content
    if (
        node.nodeName.toLowerCase() === "tr" ||
        (node.classList &&
            (node.classList.contains("scenario-tags") ||
                node.classList.contains("scenarioTitle") ||
                (node.classList[0] || []).includes("example-header")))
    ) {
        // Iterate over child nodes of the current node
        for (let childNode of node.childNodes) {
            // Recursively call the parseScenario function for each child node
            textContent += parseScenario(childNode);
        }

        // Add a newline character if there is text content
        if (textContent) textContent += "\n";
    }
    // Check if the current node represents a Gherkin table with the class "gherkin-table"
    else if (node.classList && node.classList.contains("gherkin-table")) {
        // Iterate over child nodes of the current node and parse each as a table
        for (let childNode of node.childNodes) {
            textContent += parseTable(childNode);
        }

        // Remove the first two columns from the resulting table
        textContent = removeFirstTwoColumns(textContent);
    }
    // Check if the current node represents a step argument table with the class "stepArgumentTable"
    else if (node.classList && (node.classList[0] || []).includes("stepArgumentTable")) {
        // Add a newline character before parsing the table
        textContent += "\n";

        // Iterate over child nodes of the current node and parse each as a table
        for (let childNode of node.childNodes) {
            textContent += parseTable(childNode);
        }
    }
    // Check if the current node has certain classes that should be ignored
    else if (
        node.classList &&
        ((node.classList[0] || []).includes("dropdown__example") ||
            (node.classList[0] || []).includes("background_expander"))
    ) {
        // Ignore this node for now
    } else {
        // Check if the node has text content
        if (node.nodeType === Node.TEXT_NODE) {
            // Append the text content followed by a space
            textContent += node.textContent + " ";
        }

        // Iterate over child nodes of the current node
        for (let childNode of node.childNodes) {
            // Recursively call the parseScenario function for each child node
            textContent += parseScenario(childNode);
        }
    }

    // Return the accumulated text content
    return textContent;
}

// This function takes a string as input and removes multiple spaces and empty lines from it.
function removeExtraSpacesAndLines(inputString) {
    // Remove multiple spaces and replace with a single space
    let stringWithoutExtraSpaces = inputString.replace(/ +/g, ' ');

    // Remove empty lines
    // The regular expression /^\s*[\r\n]/gm matches any line that contains only whitespace characters
    // (\s*), followed by either a carriage return (\r) or newline (\n) character.
    // The 'm' flag enables multiline mode, allowing the ^ and $ to match the start and end of each line.
    let stringWithoutEmptyLines = stringWithoutExtraSpaces.replace(/^\s*[\r\n]/gm, '');

    // Return the string with multiple spaces and empty lines removed
    return stringWithoutEmptyLines;
}

// When the menu item is clicked, replace clicked link by an image
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Check if the received message is a request for the clicked element
  if (request === "getClickedElt") {
    // Check if the clicked element has a parent with a specific tag and class
    if (isTagFoundInParents(clickedElt, "div", "scenarios") || isTagFoundInParents(clickedElt, "li", "Background")) {
      // Parse the scenario content
      let content = parseScenario(clickedElt);
      // Remove extra spaces and lines from the parsed content
      content = removeExtraSpacesAndLines(content);
      // Log the parsed content to the console
      console.log(content);
      
      // Send the parsed content to the top-level window using postMessage
      window.top.postMessage({ id: "getParsedText", message: content }, '*');
    } else {
      // Display an alert if the clicked element is not a livingdoc scenario
      window.alert("This is not a livingdoc scenario.");
    }
    
    // Send a response to the message listener
    sendResponse(null);
  }
});

// Listen for messages from the top-level window
window.addEventListener('message', function(event) {
  // Check if the received message has the expected ID
  if (event.data.id === "getParsedText") {
    // Log a message indicating that the parsed text is copied
    console.log("Parsed text copied.");
    // Copy the parsed text to the clipboard using the Clipboard API
    navigator.clipboard.writeText(event.data.message);
  }
});
