// variable to store the clicked element (a link)
var clickedElt = null;

function isTagFoundInParents(el, type, tag) {
	while (el.parentNode) {
        el = el.parentNode;
        if (el.nodeName.toLowerCase() === type && el.classList.contains( tag )) {
			clickedElt = el;
			return true;			
		}
    }
	return false;	
}

function parseScenario(node) {
	let textContent = '';
	
	if (node.nodeName.toLowerCase() === "table" || (node.classList && (node.classList.contains("scenario-tags") || node.classList.contains("scenarioTitle")))){
		for (let childNode of node.childNodes) {
			textContent += parseScenario(childNode);
		}
		textContent += "\n";
	}
	else if (!(node.classList && (node.classList[0] || []).includes("angular-FeatureViewer"))) {
		
		// Check if the node has text content
		if (node.nodeType === Node.TEXT_NODE) {
			textContent += node.textContent + " ";
		}

		// Iterate over child nodes
		for (let childNode of node.childNodes) {
			textContent += parseScenario(childNode);
		}
	}
	
	return textContent;	
}


// Retrieve the clicked element when the context menu is displayed
document.addEventListener("contextmenu", function(event){
    clickedElt = event.target;
}, true);

// When the menu item is clicked, replace clicked link by an image
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request == "getClickedElt") {
			if (isTagFoundInParents(clickedElt, "div", "scenarios")){
				//navigator.clipboard.writeText("CLIPBOARD");	
				const content = parseScenario(clickedElt);
				console.log(content);
				//window.alert("Gherkin copied to clipboard.");
			}
			else{
				window.alert("This is NOT a linigdoc scenario.");
			}			
		sendResponse(null);
    }
});

