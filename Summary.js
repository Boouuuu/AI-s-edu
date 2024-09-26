$(document).ready(function() {
    $('body').fadeIn("slow");
  });
  
  
  $('#nextpage').on('click', function(e) {
    e.preventDefault(); // 防止默认的立即跳转
    $('body').fadeOut('slow', function() {
        // 淡出完成后进行页面跳转
        window.location.href = "wordcloud.html";
    });
  });

  
//实现提取函数和库
  document.getElementById('generateSummary').addEventListener('click', () => {
    console.log('Button clicked!');

    chrome.runtime.sendMessage({ message: 'getCodeSnippets' }, (response) => {
        console.log('sendMessage!');
        if (response && response.codeSnippets) { // 确保 response 存在
            console.log('catch win!');
            const summary = extractSummary(response.codeSnippets);
            displaySummary(summary);
        } else {
            console.log('catch lose!');
        }
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



function displaySummary(summary) {
    const summaryDiv = document.getElementById('summary');
    if (!summaryDiv) {
        console.error('Summary div not found.');
        return;
    }

    summaryDiv.innerHTML = ''; // 清空内容

    // 使用 Markdown 格式
    const functionsMarkdown = summary.functions.length > 0 
        ? `### Functions:\n- ${summary.functions.join('\n- ')}\n` 
        : '### Functions:\n- None\n';

    const librariesMarkdown = summary.libraries.length > 0 
        ? `### Imported Libraries:\n- ${summary.libraries.join('\n- ')}\n` 
        : '### Imported Libraries:\n- None\n';

    // 将 Markdown 格式文本插入到 summaryDiv
    summaryDiv.innerHTML += marked(functionsMarkdown); // 使用 marked.js 渲染
    summaryDiv.innerHTML += marked(librariesMarkdown);
    
     // 动态调整高度
     summaryDiv.style.height = 'auto'; // 先设置为自动，确保获取到内容的真实高度
     const newHeight = summaryDiv.scrollHeight + 'px'; // 获取内容高度
     summaryDiv.style.height = newHeight; // 设置新的高度
}


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('SearchButton').addEventListener('click', () => {
        const searchTerm = document.getElementById('SearchInput').value.trim().toLowerCase();
        highlightTerms(searchTerm);
    });
});


function highlightTerms(term) {
    const summaryDiv = document.getElementById('summary');
    if (!summaryDiv) {
        console.error('Summary div not found.');
        return;
    }

    // 获取当前的 HTML 内容
    let innerHTML = summaryDiv.innerHTML;
    console.log(innerHTML);

    // 创建正则表达式，匹配函数名和库名
    const regex = new RegExp(`(${term})`, 'gi');

    // 高亮匹配的文本
    innerHTML = innerHTML.replace(regex, '<span style="color: red;">$1</span>');

    // 更新摘要内容
    summaryDiv.innerHTML = innerHTML;

    // 如果需要，滚动到第一个匹配项
    const firstMatch = summaryDiv.querySelector('span');
    if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
