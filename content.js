// This script is injected into web pages to enable text selection tracking.
document.addEventListener("mouseup", function () {
  var selectedText = window.getSelection().toString();
  if (selectedText && selectedText.trim() !== "") {
    chrome.runtime.sendMessage({ action: "updateSelection", text: selectedText });
  }
});

// 与jupyternotebook交互
function getNotebookCode() {
  let codeCells = document.querySelectorAll(".code_cell .input_area textarea");
  let allCode = "";
  codeCells.forEach(cell => {
    allCode += cell.value + "\n";
  });
  return allCode;
}

// 向插件的其他部分发送消息，传递代码
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCode") {
    sendResponse({ code: getNotebookCode() });
  }
});
