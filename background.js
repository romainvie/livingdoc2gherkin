// Define the label for the context menu item
var menuItemLabel = "Copy as gherkin";

// Set up the context menu item when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Add a new context menu element for links
  chrome.contextMenus.create({
    id: menuItemLabel,
    title: menuItemLabel,
    contexts: ["all"]
  });
});

// Listen for clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Log the tab ID to the console
  console.log(tab.id);

  // Check if the clicked context menu item is the one we added
  if (info.menuItemId === menuItemLabel) {
    // Send a message to the content script of the active tab
    // to request information about the clicked element
    chrome.tabs.sendMessage(tab.id, "getClickedElt", { frameId: info.frameId });
  }
});
