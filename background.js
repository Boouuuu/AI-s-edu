let conversationHistory = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'generate_text') {
    chrome.storage.local.get(['openai_key'], function (result) {
      console.log(result.openai_key);
      const openai_key = result.openai_key;

      conversationHistory.push({ role: 'user', content: request.userInput });

      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openai_key}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: conversationHistory,
          max_tokens: 1000,
          temperature: 0.3,
          user: 'unique-user-id', 
        }),
      })
        .then((response) => response.json())
        .then((data) => {
         
          conversationHistory.push({
            role: 'assistant',
            content: data.choices[0].message.content,
          });
          sendResponse({ data: data.choices[0].message.content });
        })
        .catch((error) => console.error('Error:', error));
    });
    
    return true;
  }
});

// 提取 Jupyter Notebook 中代码块的函数
function getNotebookCode() {
  let codeCells = document.querySelectorAll(".code_cell .input_area textarea");
  let allCode = "";
  codeCells.forEach(cell => {
    allCode += cell.value + "\n"; // 使用 cell.value 获取文本内容
  });
  return allCode;
}

// 监听来自插件的消息请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCode") {
    const notebookCode = getNotebookCode();
    sendResponse({ code: notebookCode });  // 返回提取的代码
  }
});

// 发送消息到 content.js
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs.length > 0) {
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
  }
});


// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ['content.js']
//   });
// });



