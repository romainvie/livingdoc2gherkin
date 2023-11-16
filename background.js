var menuItemLabel = "Copy as gherkin";

chrome.runtime.onInstalled.addListener(() => {
	// add a new context menu element for links
	chrome.contextMenus.create({
		id: menuItemLabel,
		title: menuItemLabel,
		contexts: ["all"]
	});
});

// Send message to content.js when the new element is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
	console.log(tab.id);
	if (info.menuItemId === menuItemLabel) {
		chrome.tabs.sendMessage(tab.id, "getClickedElt", {frameId: info.frameId});
	}
});

