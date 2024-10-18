
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generate-wordcloud').addEventListener('click', () => {
    const generateButton = document.getElementById('generate-wordcloud');
    generateButton.innerText = '正在生成词云...';  // 设置按钮文本为加载状态

    // 发送消息到 content.js，获取 Jupyter Notebook 的代码
    chrome.runtime.sendMessage({ message: 'getCodeSnippets' }, (response) => {
      if (response && response.codeSnippets) { // 确保 response 存在
        const word1 = extractSummary(response.codeSnippets);
        const words = processCodeToWordList(word1);  // 处理函数名为词列表
        drawWordCloud(words);  // 生成词云图并传递库名
        generateButton.innerHTML = '<i class="fa fa-rocket" aria-hidden="true"></i> 生成词云图';  // 恢复按钮文本为默认状态

        var myChart = echarts.init(document.getElementById('linechart'));
        // 指定图表的配置项和数据
        var option = {
            title: {
                text: 'ECharts 入门示例'
            },
            tooltip: {},
            legend: {
                data:['销量']
            },
            xAxis: {
                data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
            },
            yAxis: {},
            series: [{
                name: '销量',
                type: 'bar',
                data: [5, 20, 36, 10, 10, 20]
            }]
        };
        myChart.setOption(option);
      } else {
        console.error("获取代码失败");
        generateButton.innerText = '生成失败';
      }
    });
  });
});


function extractSummary(codeSnippets) {
  const functions = new Set(); // 使用 Set 存储唯一的函数
  const libraries = new Set();

  codeSnippets.forEach(code => {
      // 匹配导入的库
      const importRegex = /import\s+(\w+)|from\s+(\w+)\s+import/g;
      let importMatch;
      while ((importMatch = importRegex.exec(code)) !== null) {
          libraries.add(importMatch[1] || importMatch[2]);
      }

      // 匹配函数定义
      const funcRegex = /(?<!\w)([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*)(?=\()/g;
      let funcMatch;
      while ((funcMatch = funcRegex.exec(code)) !== null) {
          functions.add(funcMatch[1]); // 使用 Set 添加函数
      }
  });

  return {
      functions: Array.from(functions).sort(), // 转换为数组并排序
      libraries: Array.from(libraries).sort()  // 转换为数组并排序
  };
}

// 生成随机颜色的函数
function getRandomColor() {
    return 'rgb(' +
        Math.round(Math.random() * 255) + ',' +
        Math.round(Math.random() * 255) + ',' +
        Math.round(Math.random() * 255) + ')';
}
// 处理代码为词列表
function processCodeToWordList(summary) {
  const wordList = [];

  // 处理函数名
  summary.functions.forEach(func => {
      if (func) { 
          wordList.push({ value: 15, name: func }); // 假设大小为15
      }
  });

  // 处理库名
  summary.libraries.forEach(lib => {
      if (lib) { 
          wordList.push({ value: 20, name: lib }); // 假设大小为20
      }
  });

  return wordList;
}

function drawWordCloud(wordList) {
// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('main'));

// 指定图表的配置项和数据
var option = {
    title: {
        text: '高频知识点词云图',
        left: 'center'
    },
    tooltip: {},
    series: [
        {
            type: 'wordCloud',
            shape: 'smooth',
            gridSize: 8,
            size: ['50%', '60%'],
            rotationRange: [-45, 0, 45, 90],
            textStyle: {
                    fontFamily: '微软雅黑',
                    color: function() {
                        return 'rgb(' + 
                            Math.round(Math.random() * 255) +
                            ', ' + Math.round(Math.random() * 255) +
                            ', ' + Math.round(Math.random() * 255) + ')';
                    },
                emphasis: {
                    shadowBlur: 5,
                    shadowColor: '#333'
                }
            },
            left: 'center',
            top: 'center',
            // 使用 wordList，添加随机颜色
            data: wordList
        }
    ]
};


// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);
}






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




document.getElementById('savephotobutton').addEventListener('click', async function() {
  const canvasHighRes = document.getElementById('wordcloud');
  const blob = await new Promise((resolve) => {
      canvasHighRes.toBlob(resolve, 'image/png');
  });

  // 使用 File System Access API 保存图像
  const fileHandle = await window.showSaveFilePicker({
      suggestedName: 'wordcloud.png',
      types: [{
          description: 'PNG Images',
          accept: {'image/png': ['.png']},
      }],
  });

  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
});

