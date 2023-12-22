function init() {
    const toggle = document.getElementById("lensToggle");

    toggle
    .addEventListener("change",
        evt => browser.runtime.sendMessage({ action: "setState", value: toggle.checked })
    );

    const onSatusChange = (message) => (message, sender, sendResponse) => {
        if (message.extensionState !== undefined) {
            toggle.checked = message.extensionState;
        }
    };

    // Handle the initial message when the popup is opened
    browser.runtime.sendMessage({ action: "getState" }, onSatusChange);

    // Listen for messages from the background script
    browser.runtime.onMessage.addListener(onSatusChange);
}

window.addEventListener("load", init);