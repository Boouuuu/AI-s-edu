import WordCloud from 'wordcloud';

document.getElementById('generate-wordcloud').addEventListener('click', () => {

    const generateButton = document.getElementById('generate-wordcloud');
    generateButton.innerText = '正在生成词云...'; // 设置按钮文本为加载状态

  // 获取当前 Jupyter Notebook 页面上的代码
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getCode' }, response => {
      const code = response.code;
      const words = processCodeToWordList(code); // 处理代码为词列表
      drawWordCloud(words); // 生成词云图
    });
  });
});

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

function drawWordCloud(words) {
  const canvas = document.getElementById('wordcloud');
  WordCloud(canvas, {
    list: words,
    gridSize: 18,
    weightFactor: 3,
    fontFamily: 'Times, serif',
    color: 'random-dark',
    rotateRatio: 0.5,
    backgroundColor: '#f0f0f0',
  });
}
