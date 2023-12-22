const defaultRoles = {
  "a": "link",
  "article": "article",
  "aside": "complementary",
  "body": "document",
  "button": "button",
  "datalist": "listbox",
  "dd": "definition",
  "details": "group",
  "dialog": "dialog",
  "div": "presentation",
  "dl": "list",
  "dt": "listitem",
  "fieldset": "group",
  "figcaption": "group",
  "figure": "figure",
  "footer": "contentinfo",
  "form": "form",
  "h1": "heading",
  "h2": "heading",
  "h3": "heading",
  "h4": "heading",
  "h5": "heading",
  "h6": "heading",
  "iframe": "iframe",
  "header": "banner",
  "hgroup": "group",
  "hr": "separator",
  "img": "img",
  "input": "input",
  "li": "listitem",
  "main": "main",
  "mark": "text",
  "nav": "navigation",
  "ol": "list",
  "output": "status",
  "p": "paragraph",
  "pre": "text",
  "section": "region",
  "select": "listbox",
  "summary": "button",
  "table": "table",
  "tbody": "rowgroup",
  "td": "cell",
  "textarea": "textbox",
  "tfoot": "rowgroup",
  "th": "columnheader",
  "thead": "rowgroup",
  "time": "timer",
  "tr": "row",
  "ul": "list"
};

function resetStyles() {
  // Get all the stylesheets on the page and remove each one
  document
    .querySelectorAll('link[rel="stylesheet"], style')
    .forEach(stylesheet => stylesheet.parentNode.removeChild(stylesheet));

  // Get all elements on the page and remove the "style" attribute from each element
  document.querySelectorAll('*')
    .forEach(element => element.removeAttribute('style'));

  // Create a style element and append it to the head
  const styleElement = document.createElement('style');
  document.head.appendChild(styleElement);

  // Add the CSS rule dynamically
  styleElement.sheet.insertRule(`[aria-role] {
      background-color: transparent;
      border: none;
      color: black;
      cursor: default;
      display: block;
      font-size: 1rem;
      font-family: halvetica, arial, san-serif;
      font-weight: normal;
      margin: 0 0 0 0.5rem;
      text-decoration: none;
      padding: 0;
    }`);

  styleElement.sheet.insertRule(`[aria-role]:before {
      content: attr(aria-role);
      display: inline-block;
      color: blue;
      border-radius: 3px;
      padding: 0 0.2rem;
      margin: 0 0.1rem 0.1rem;
    }`, 0);
}

function stripPage(element) {
  resetStyles();

  // Add aria role to each element
  element.querySelectorAll('*:not(html,head,body,script,style)').forEach(element => {
    if (!element.hasAttribute('aria-role')) {
      element.setAttribute('aria-role', defaultRoles[element.tagName.toLowerCase()] || 'ignored');
    }
  });

  // Replace images with alt text
  element
    .querySelectorAll('img')
    .forEach(image => {
      const alt = document.createElement('span');
      alt.setAttribute('aria-role', 'img');
      alt.innerText = image.alt || 'no description provided';
      image.parentNode.replaceChild(alt, image)
    });

  element
    .querySelectorAll('svg')
    .forEach(image => {
      const alt = document.createElement('span');
      alt.setAttribute('aria-role', 'img');
      alt.innerText = image.alt || 'SVG with no description provided';
      image.parentNode.replaceChild(alt, image)
    });
}

let extensionState = false;

const observer = new MutationObserver(mutations => mutations
  .forEach(mutation => extensionState && stripPage(document))
);

// Start observing the target node for configured mutations
const targetNode = document.body;
const config = { attributes: true, childList: true, subtree: true };
observer.observe(targetNode, config);

// Cleanup the observer when the extension is unloaded
window.addEventListener("beforeunload", function () {
  observer.disconnect();
});

const onSatusChange = (message, sender, sendResponse) => {
  if (message.extensionState!==undefined) {
    extensionState = message.extensionState;
    if (extensionState) {
      stripPage(document);
    } else {
      location.reload();
    }
  }
};

browser.runtime.sendMessage({ action: "getState" }, response => {
  extensionState = message.extensionState;
  if (extensionState) {
    stripPage(document);
  }
});

browser.runtime.onMessage.addListener(onSatusChange);