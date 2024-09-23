
$(document).ready(function() {
  $('body').fadeIn("slow");
});

// 当点击按钮时，淡出当前页面并跳转
$('#lastpage').on('click', function(e) {
  e.preventDefault(); // 防止默认的立即跳转
  $('body').fadeOut('slow', function() {
      // 淡出完成后进行页面跳转
      window.location.href = "Summary.html";
  });
});

$('#nextpage').on('click', function(e) {
  e.preventDefault(); // 防止默认的立即跳转
  $('body').fadeOut('slow', function() {
      // 淡出完成后进行页面跳转
      window.location.href = "Mindmap.html";
  });
});


// import WordCloud from './libs/wordcloudw.js';






document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generate-wordcloud').addEventListener('click', () => {
    const generateButton = document.getElementById('generate-wordcloud');
    generateButton.innerText = '正在生成词云...';  // 设置按钮文本为加载状态

    // 发送消息到 content.js，获取 Jupyter Notebook 的代码
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getCode' }, (response) => {
        if (response && response.code) {
          const code = response.code;
          const words = processCodeToWordList(code);  // 处理代码为词列表
          console.log("处理代码成功",words);
          drawWordCloud(words);  // 生成词云图
          generateButton.innerText = '生成词云';  // 恢复按钮文本为默认状态
        } else {
          console.error("获取代码失败");
          generateButton.innerText = '生成失败';
        }
      });
    });
  });
});

// 将代码转换为词频列表
function processCodeToWordList(code) {
  const wordMap = new Map();
  const words = code.split(/\W+/);
  words.forEach(word => {
    if (word) {
      wordMap.set(word, (wordMap.get(word) || 0) + 1);
    }
  });
  return Array.from(wordMap.entries());
}


// 定义词云生成函数
function drawWordCloud(wordArray) {
  const canvas = document.getElementById('wordcloud'); // 获取canvas元素
  const options = {
      list: wordArray,
      gridSize: Math.round(16 * canvas.width / 1024), // 设置网格大小
      weightFactor: 1,
      // shape: 'circle',
      // rotateRatio: 0.5,
      fontFamily: 'Times, serif',
      color: 'random-dark', // 随机深色
      rotateRatio: 0.5,
      backgroundColor: '#f0f0f0', // 背景颜色
      clearCanvas: true, // 清除之前的内容
      origin: [canvas.width / 2, canvas.height / 2], // 中心位置
      drawOutOfBound: false, // 不允许绘制超出边界
  };

  WordCloud(canvas, options); // 在canvas上生成词云
}
