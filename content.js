// This script is injected into web pages to enable text selection tracking.
document.addEventListener("mouseup", function () {
  var selectedText = window.getSelection().toString();
  if (selectedText && selectedText.trim() !== "") {
    chrome.runtime.sendMessage({ action: "updateSelection", text: selectedText });
  }
});

// 提取 Jupyter Notebook 中代码块的函数
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  debugger;
  console.log("发送消息到 content.js");  // 检查是否发送消息
  chrome.tabs.sendMessage(tabs[0].id, { action: 'getCode' }, (response) => {
    console.log("收到 response: ", response);  // 检查是否收到响应
    if (response && response.code) {
      const code = response.code;
      console.log("收到代码: ", code);  // 输出提取的代码
      const words = processCodeToWordList(code);
      drawWordCloud(words);
    } else {
      console.error("获取代码失败");
    }
  });
});


// 监听来自插件的消息请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCode") {
    const notebookCode = getNotebookCode();
    sendResponse({ code: notebookCode });  // 返回提取的代码
  }
});
