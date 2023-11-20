// variable to store the clicked element (a link)
var clickedElt = null;

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
	// Remove any final \n
	inputString = (inputString.endsWith('\n')? inputString.slice(0,-1) : inputString);
	
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

// Function to calculate the element-wise maximum of two arrays
function maxvector(a, b) {
    // Use the map function to iterate over each element (e) and index (i) of array 'a'
    // Calculate the maximum value between the corresponding elements of arrays 'a' and 'b'
    const result = a.map((e, i) => Math.max(e, b[i]));

    // Return the resulting array containing the element-wise maximum values
    return result;
}

// Function to test whether a given string is either empty or consists only of whitespace characters
function isNullOrWhitespace(input) {
    // Check if the input is null, undefined, or an empty string
    if (input == null || input === '') {
        // If the input is null, undefined, or an empty string, return true
        return true;
    }

    // Use a regular expression to test if the string contains only whitespace characters
    // The regular expression /^\s*$/ checks if the string consists of zero or more whitespace characters from the beginning to the end
    return /^\s*$/.test(input);
}

// Function to align a markdown-style table by adding necessary spaces or tabulations
function alignMarkdownTable(input) {
	// Remove any final \n
	input = (input.endsWith('\n')? input.slice(0,-1) : input);

	// Split the input string into rows  
	const rows = input.split('\n');

	// Extract the header row and determine the maximum column width for each column
	const headerRow = rows[0];
	let columnWidths = headerRow.split('|').map(column => column.trim().length);

	// Initialize an array to store the maximum width for each column
	for (let i = 1; i < rows.length; i++) {
		columnWidths = maxvector(columnWidths, rows[i].split('|').map(column => column.trim().length));
	}

	// Generate the aligned table string
	const alignedRows = rows.map(row => {
		// Split each row into columns and trim whitespace
		const columns = row.split('|').map(column => column.trim());
		// Pad each column with spaces to match the maximum width
		const alignedColumns = columns.map((column, index) => column.padEnd(columnWidths[index] + 1));
		// Join the aligned columns with tabs and wrap in table formatting
		return `${alignedColumns.join('| ')}`;
	});

	// Join the aligned rows with line breaks
	return alignedRows.join('\n');
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
        if (node.nodeType === Node.TEXT_NODE && !isNullOrWhitespace(node.textContent)) {
            // Append the text content followed by a space (if there's no final space already).
            textContent += node.textContent + (node.textContent.endsWith(' ')? '' : ' ');
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
        textContent = alignMarkdownTable(removeFirstTwoColumns(textContent));
    }
    // Check if the current node represents a step argument table with the class "stepArgumentTable"
    else if (node.classList && (node.classList[0] || []).includes("stepArgumentTable")) {
        // Add a newline character before parsing the table
        textContent += "\n";

        // Iterate over child nodes of the current node and parse each as a table
        for (let childNode of node.childNodes) {
            textContent += alignMarkdownTable(parseTable(childNode));
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
        if (node.nodeType === Node.TEXT_NODE && !isNullOrWhitespace(node.textContent)) {
            // Append the text content followed by a space (if there's no final space already).
            textContent += node.textContent + (node.textContent.endsWith(' ')? '' : ' ');
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

// When the menu item is clicked, write the current scenario in the clipboard in Gherkin-style text
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// Check if the received message is a request for the clicked element
	if (request === "getClickedElt") {
		// Check if the clicked element has a parent with a specific tag and class
		if (isTagFoundInParents(clickedElt, "div", "scenarios") || isTagFoundInParents(clickedElt, "li", "Background")) {
			// Parse the scenario content
			let content = parseScenario(clickedElt);
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

// Event listener for the "contextmenu" event on the document
// This event is triggered when the user right-clicks to open the context menu
document.addEventListener("contextmenu", function(event) {
	// Retrieve the clicked element when the context menu is displayed
	clickedElt = event.target;
}, true);

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
