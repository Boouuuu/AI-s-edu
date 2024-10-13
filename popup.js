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

  // 将有效的用户输入存储
  let userinputto = userInput;
 console.log(userInput);


  document.getElementById('userInput').value = ''; // Clear the input field
  // 最后，它将“userInput”HTML 元素的值设置为空字符串，从而有效地清除输入字段。

  // Display the user's message immediately
  const messagesDiv = document.getElementById('messages');
  let select = document.getElementById('search-select');
  // 遍历所有选项并打印索引和值
for (let i = 0; i < select.options.length; i++) {
  console.log(`Index: ${i}, Value: ${select.options[i].value}`);
}
  let index = select.selectedIndex;
  let value = select.options[index].value.bold()//.fontcolor('purple');
  //if (value !== '解答') {
  // 创建一个新的p元素  
  let newValueElement = document.createElement('p');  
    
  // 为p元素添加类名  
  newValueElement.className = 'message userMessage selectedValue'; // 可以根据需要调整类名  
    
  // 由于JavaScript字符串没有.bold()或.fontcolor()方法，我们需要使用HTML或CSS来设置样式  
  // 这里我们使用innerHTML来插入带有样式的文本（使用<b>标签来加粗文本，<span>标签来设置颜色）  
  newValueElement.innerHTML = `<b><span style="color: purple;">${value}</span></b>`;  
    
  // 将新的p元素添加到messagesDiv中  
  messagesDiv.appendChild(newValueElement);  
  //}

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

              // 准备提交给后端的数据
      const submissioninput = {
        username: localStorage.getItem('username'), // 从 localStorage 中获取用户名
        submitTime: new Date().toISOString(), // 当前时间戳
        usertext: userinputto, // 用户的输入
        text: aiMessageElement.innerHTML // AI 的响应内容
      };

      console.log(aiMessageElement.innerHTML);
      // 发送提交数据到后端
      fetch('http://localhost:5000/submitinput', { // 更新为完整的接口 URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissioninput) // 将数据转换为 JSON 字符串
      })
      .then((res) => {
        if (!res.ok) {
            throw new Error('提交数据失败');
        }
        return res.text(); // 或者 res.json() 根据返回的数据格式
      })
      .then((message) => {
        console.log(message); // 显示成功信息
        console.log( submissioninput);
      })
      .catch((error) => {
        console.error('提交数据时出错:', error); // 捕获并显示错误信息
      });


   

    // Re-enable userInput and send button after AI has finished "printing"
    isPrinting=false;
    document.getElementById('userInput').disabled = false;
    document.getElementById('send').disabled = false;
}
);
  
}



document.addEventListener("DOMContentLoaded", function () {
  var copyButton = document.getElementById("Copy");
  if (copyButton) {
    copyButton.addEventListener("click", copySelectedText);
  } else {
    console.error("Copy button not found.");
  }
});

// 刷新功能
document.getElementById('retry').addEventListener('click', function() {
  location.reload(); // 刷新页面
});
// 复制功能
function copySelectedText() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: getSelectedText,
    });
  });
}

function getSelectedText() {
  var selectedText = window.getSelection().toString();
  copyToClipboard(selectedText);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(function () {
      console.log("Text copied to clipboard:", text);
      showMessage("文本已复制到剪切板！");
    })
    .catch(function (error) {
      console.error("Error copying text: ", error);
      showMessage("复制失败！");
    });
}

function showMessage(message) {
  // 实现显示消息的逻辑，例如在页面上显示提示框
  alert(message);
}



function showMessage(message) {
  var messageDiv = document.getElementById("message");
  messageDiv.textContent = message;
  setTimeout(function () {
    messageDiv.textContent = "";
  }, 2000); // 清除消息提示
}



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
      tooltip.innerHTML = '刷新页面';
  });

  button.addEventListener('mouseout', function() {
      tooltip.style.display = 'none';
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('getpicture');
  const tooltip = document.getElementById('getpicturetip');

  button.addEventListener('mouseover', function() {
      const buttonRect = button.getBoundingClientRect();
      tooltip.style.display = 'block';
      tooltip.style.left = `${buttonRect.left-8}px`;
      tooltip.style.top = `${buttonRect.top -25 }px`; // Adjust the position as needed
      tooltip.innerHTML = '将对话存为图片';
  });

  button.addEventListener('mouseout', function() {
      tooltip.style.display = 'none';
  });
});

// 保存为图片
document.getElementById('getpicture').addEventListener('click', function () {
  const summaryElement = document.getElementById('chatbox');

  html2canvas(summaryElement).then(canvas => {
      const imgData = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'chatbox.png';
      link.click();
  }).catch(error => {
      console.error('转换为图片时出错:', error);
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



// 清空按钮
document.addEventListener("DOMContentLoaded", function () {
  var clearButton = document.getElementById("clear-button");
  clearButton.addEventListener("click", clearMessage);
});

function clearMessage() {
  var messageDiv = document.getElementById("chatbox");
  messageDiv.innerHTML = ''; // 清空内容
}

// 淡入淡出
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

function toggleButton() {
  const input = document.getElementById('userInput');
  const button = document.getElementById('send');

  if (input.value.trim() !== '') {
    button.classList.add('enabled'); // 启用按钮
    button.disabled = false; // 启用按钮
  } else {
    button.classList.remove('enabled'); // 禁用按钮
    button.disabled = true; // 禁用按钮
  }
}

// 确保在页面加载完成后添加事件监听
document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('userInput');
  input.addEventListener('input', toggleButton); // 监听输入框内容变化
});


$(function () {
  var $nav = $('#loading-container');

  // 这个函数可以在滚动时调用，以改变导航栏样式（可选）
  $(window).scroll(function () {
    var scrollTop = $(document).scrollTop();
    if (scrollTop > 0) {
      $nav.addClass('scrolled'); // 这里可以添加样式
    } else {
      $nav.removeClass('scrolled');
    }
  });
});


 // 导航栏
fetch('navbar.html')
.then(response => response.text())
.then(data => {
  document.getElementById('navbar').innerHTML = data;
});
