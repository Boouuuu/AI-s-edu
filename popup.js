let isPrinting = false;

document.getElementById('send').addEventListener('click', sendUserInput);
//拿到选中项的值  option中value值
// console.log(select.text()); //拿到选中项的文本

// Trigger send button with enter key
document.getElementById('userInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendUserInput();
  } // 这段代码添加了一个事件监听器，当用户在id为'userInput'的元素上按下键盘上的任意键时，
  // 会触发一个回调函数。如果按下的键是Enter键，则会阻止默认行为（即防止在文本框中输入回车符）并调用名为sendUserInput()的函数。
});

function sendUserInput() {
  if (isPrinting) return; // Don't allow another message until current is fully printed
  // 此代码首先检查打印过程当前是否正在进行。如果是，则返回并且不允许用户发送另一条消息，直到当前消息完全打印为止。

  let userInput = document.getElementById('userInput').value;

  // 接下来，它从 ID 为“userInput”的 HTML 元素中检索用户输入的值。

  if (userInput.trim() === '') return; // Prevent sending empty messages
  // 然后它检查用户输入是否为空或仅包含空格字符。如果是，则返回并阻止发送空消息。

  document.getElementById('userInput').value = ''; // Clear the input field
  // 最后，它将“userInput”HTML 元素的值设置为空字符串，从而有效地清除输入字段。

  // Display the user's message immediately
  const messagesDiv = document.getElementById('messages');
  let select = document.getElementById('search-select');
  let index = select.selectedIndex;
  let value = select.options[index].value.bold().fontcolor('red');
  if (value !== '搜索') {
    userInput += `<p>${value}</p>`;
  }
  // alert(`${value}`);
  messagesDiv.innerHTML += `<p class="message userMessage">${userInput}</p>`;
  // messagesDiv.innerHTML += `<p>${select}</p>`;
  // 这段代码首先获取了一个 ID 为 "messages" 的 HTML 元素，并将用户输入的消息作为一个带有 "message userMessage" 类的段落元素添加到该元素中。

  // Hide the API key note
  document.getElementById('api-key-note').style.display = 'none';
  // 接下来，它隐藏了一个 ID 为 "api-key-note" 的 HTML 元素。

  // Disable userInput and send button while AI is printing
  document.getElementById('userInput').disabled = true;
  document.getElementById('send').disabled = true;
  // 最后，它禁用了 ID 为 "userInput" 和 "send" 的 HTML 元素，以防止用户在 AI 正在打印消息时再次发送消息。

  chrome.runtime.sendMessage(
    { message: 'generate_text', UserInput: userInput },
    (response) => {
      // 这段代码使用 `chrome.runtime.sendMessage` 方法向浏览器扩展发送一个包含用户输入消息和指令的对象。指令是 "generate_text"，表示需要生成一段 AI 文本。
      // Display the AI's response word by word

      // 使用marked库将Markdown转换为HTML
      let htmlContent = marked(response.data);

      let aiMessageElement = document.createElement('div');
      aiMessageElement.classList.add('message', 'aiMessage');
      aiMessageElement.innerHTML = htmlContent; // 设置HTML内容
      messagesDiv.appendChild(aiMessageElement);
      // 当浏览器扩展返回响应时，代码将响应文本分割成单个单词，并创建一个包含 "message" 和 "aiMessage" 类的段落元素。接着将该段落元素添加到 ID 为 "messages" 的 HTML 元素中。

      isPrinting = true;
      // 最后，代码将布尔变量 `isPrinting` 设置为 `true`，表示当前正在打印 AI 的响应。

      let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                let addedNodes = Array.from(mutation.addedNodes);
                addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 逐个显示每个新添加的块级元素
                        let intervalId = setInterval(() => {
                            if (node.offsetWidth < node.scrollWidth) {
                                node.scrollLeft += 1;
                            } else {
                                clearInterval(intervalId);
                            }
                        }, 80);
                    }
                });
                observer.disconnect();
            }
        });
    });

    observer.observe(aiMessageElement, { childList: true, subtree: true });

    // Re-enable userInput and send button after AI has finished "printing"
    isPrinting=false;
    document.getElementById('userInput').disabled = false;
    document.getElementById('send').disabled = false;
}
);
  
}




document.addEventListener("DOMContentLoaded", function () {
  var copyButton = document.getElementById("Copy");
  copyButton.addEventListener("click", copySelectedText);
});

function copySelectedText() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript({
      target: { tabId: tabs[0].id },
      function: getSelectedText,
    });
  });
}

function getSelectedText() {
  var selectedText = window.getSelection().toString();
  chrome.tabs.executeScript({
    function: copyToClipboard,
    args: [selectedText],
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function () {
    console.log("Text copied to clipboard:", text);
    showMessage("Text copied successfully!");
  });
}

function showMessage(message) {
  var messageDiv = document.getElementById("message");
  messageDiv.textContent = message;
  setTimeout(function () {
    messageDiv.textContent = "";
  }, 2000); // 清除消息提示
}


// 初始缩放级别
let currentScale = 1.0;

document.getElementById('zoomInButton').addEventListener('click', function() {
    // 增加缩放级别
    currentScale += 0.1;

    // 设置插件页面缩放
    document.body.style.transform = 'scale(' + currentScale + ')';
});

document.getElementById('zoomOutButton').addEventListener('click', function() {
  // 增加缩放级别
  currentScale -= 0.1;

  // 设置插件页面缩放
  document.body.style.transform = 'scale(' + currentScale + ')';
});

//悬浮文字功能
document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('Copy');
  const tooltip = document.getElementById('copytip');

  button.addEventListener('mouseover', function() {
      const buttonRect = button.getBoundingClientRect();
      tooltip.style.display = 'block';
      tooltip.style.left = `${buttonRect.left-80}px`;
      tooltip.style.top = `${buttonRect.top -25 }px`; // Adjust the position as needed
      tooltip.innerHTML = '使用鼠标选中文本 单击按钮复制到剪贴板上';
  });

  button.addEventListener('mouseout', function() {
      tooltip.style.display = 'none';
  });
});



document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('retry');
  const tooltip = document.getElementById('retrytip');

  button.addEventListener('mouseover', function() {
      const buttonRect = button.getBoundingClientRect();
      tooltip.style.display = 'block';
      tooltip.style.left = `${buttonRect.left}px`;
      tooltip.style.top = `${buttonRect.top-25}px`; // Adjust the position as needed
      tooltip.innerHTML = '重新提问';
  });

  button.addEventListener('mouseout', function() {
      tooltip.style.display = 'none';
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('submit_picture');
  const tooltip = document.getElementById('submit_picturetip');

  button.addEventListener('mouseover', function() {
      const buttonRect = button.getBoundingClientRect();
      tooltip.style.display = 'block';
      tooltip.style.left = `${buttonRect.left-8}px`;
      tooltip.style.top = `${buttonRect.top -25 }px`; // Adjust the position as needed
      tooltip.innerHTML = '更换背景图片';
  });

  button.addEventListener('mouseout', function() {
      tooltip.style.display = 'none';
  });
});


document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('information');
  const tooltip = document.getElementById('informationtip');

  button.addEventListener('mouseover', function() {
      const buttonRect = button.getBoundingClientRect();
      tooltip.style.display = 'block';
      tooltip.style.left = `${buttonRect.left-8}px`;
      tooltip.style.top = `${buttonRect.top -25 }px`; // Adjust the position as needed
      tooltip.innerHTML = '说明文档';
  });

  button.addEventListener('mouseout', function() {
      tooltip.style.display = 'none';
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('clear-button');
  const tooltip = document.getElementById('clear-buttontip');

  button.addEventListener('mouseover', function() {
      const buttonRect = button.getBoundingClientRect();
      tooltip.style.display = 'block';
      tooltip.style.left = `${buttonRect.left-(tooltip.style.length/2)}px`;
      tooltip.style.top = `${buttonRect.top -25 }px`; // Adjust the position as needed
      tooltip.innerHTML = '清空历史对话';
  });

  button.addEventListener('mouseout', function() {
      tooltip.style.display = 'none';
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('changesize');
  const tooltip = document.getElementById('changesizetip');

  button.addEventListener('mouseover', function() {
      const buttonRect = button.getBoundingClientRect();
      tooltip.style.display = 'block';
      tooltip.style.left = `${buttonRect.left}px`;
      tooltip.style.top = `${buttonRect.top -25 }px`; // Adjust the position as needed
      tooltip.innerHTML = '改变字体大小';
  });

  button.addEventListener('mouseout', function() {
      tooltip.style.display = 'none';
  });
});



$(document).ready(function() {
  $('body').fadeIn("slow");
});

$('#gotoSummary').on('click', function(e) {
  e.preventDefault(); // 防止默认的立即跳转
  $('body').fadeOut('slow', function() {
      // 淡出完成后进行页面跳转
      window.location.href = "Summary.html";
  });
});