let LS_EXTENSION_ENABLED = "accessbilityLensEnabled";
let extensionEnabled = localStorage.getItem(LS_EXTENSION_ENABLED) || false;

function broadcastToAllTabs(message) {
  //{    currentWindow: true,    active: true,  }
  browser.tabs.query({}, 
    tabs => tabs.forEach(tab => browser.tabs.sendMessage(tab.id, message))
  );
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "setState":  
      extensionEnabled = message.value;
      
      console.log(`Extension ${extensionEnabled ? 'enabled' : 'disabled'}`);
      localStorage.setItem(LS_EXTENSION_ENABLED, extensionEnabled);
      broadcastToAllTabs({ extensionState: extensionEnabled });
      break;
    case "getState":
      sendResponse({ extensionState: extensionEnabled });
      break;
  }
});

chrome.runtime.onInstalled.addListener(function () {
  console.log("AccessibilityLense installed");
});

chrome.webNavigation.onCompleted.addListener(function (details) {
  // This event is triggered when a page finishes loading
  console.log("Page loaded:", details.url);

  // custom javascript injected here:
  chrome.tabs.executeScript({ file: 'content.js' });
});