function runCode() {
  const htmlCode = document.getElementById('html-editor').value;
  const jsCode = document.getElementById('js-editor').value;
  const resultContainer = document.getElementById('result-container');

  // Combine HTML and JavaScript code
  const combinedCode = createCombinedCode(htmlCode, jsCode);

  // Inject the combined code into the result container
  injectCodeIntoContainer(combinedCode, resultContainer);
}

function createCombinedCode(htmlCode, jsCode) {
  // Escape HTML entities to prevent interpretation as raw HTML
  const escapedHtmlCode = escapeHtml(htmlCode);
  
  // Construct the combined code string
  return `<html><head><style>${getEditorStyle()}</style></head><body>${escapedHtmlCode}<script type="module">${jsCode}</script></body></html>`;
}

function injectCodeIntoContainer(combinedCode, container) {
  // Clear previous content of the container
  container.innerHTML = '';

  // Append the combined code as a text node to the container
  const combinedCodeNode = document.createTextNode(combinedCode);
  container.appendChild(combinedCodeNode);
}

function escapeHtml(html) {
  // Replace special characters with their HTML entity equivalents
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getEditorStyle() {
  // You can customize the editor style if needed
  return `
    body {
      font-family: 'Arial', sans-serif;
      padding: 10px;
    }
  `;
}
