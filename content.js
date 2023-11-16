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

// Retrieve the clicked element when the context menu is displayed
document.addEventListener("contextmenu", function(event){
    clickedElt = event.target;
}, true);

// When the menu item is clicked, replace clicked link by an image
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request == "getClickedElt") {
			if (isTagFoundInParents(clickedElt, "div", "scenarios")){
				//navigator.clipboard.writeText("CLIPBOARD");		
				window.alert("Gherkin copied to clipboard.");
			}
			else{
				window.alert("This is NOT a linigdoc scenario.");
			}			
		sendResponse(null);
    }
});