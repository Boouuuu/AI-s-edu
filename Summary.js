$(document).ready(function () {
    $('body').fadeIn("slow");
});




//实现提取函数和库
document.addEventListener('DOMContentLoaded', (event) => { 
    document.getElementById('generateSummary').addEventListener('click', () => {
        console.log('总结Button clicked!');
        const mainDiv = document.querySelector('.main');
        mainDiv.style.display = 'block'; // 显示元素
    
        chrome.runtime.sendMessage({ message: 'getCodeSnippets' }, (response) => {
            console.log('总结sendMessage!');
            if (response && response.codeSnippets) { // 确保 response 存在
                console.log('总结catch win!');
                const summary = extractSummary(response.codeSnippets);
                displaySummary(summary);
            } else {
                console.log('总结catch lose!');
            }
        });
    });
 });


function extractSummary(codeSnippets) {
    const functions = new Set(); // 使用 Set 存储唯一的函数
    const libraries = new Set();
    const keywords = new Set([
        "False", "None", "True", "and", "as", "assert", "async", "await",
        "break", "class", "continue", "def", "del", "elif", "else", "except",
        "finally", "for", "from", "global", "if", "import", "in", "is",
        "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
        "try", "while", "with", "yield"
    ]);

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

        // 匹配 Python 关键字
        const keywordRegex = new RegExp(`\\b(${Array.from(keywords).join('|')})\\b`, 'g');
        let keywordMatch;
        while ((keywordMatch = keywordRegex.exec(code)) !== null) {
            keywords.add(keywordMatch[0]); // 添加匹配到的关键字
        }
    });

    return {
        functions: Array.from(functions).sort(), // 转换为数组并排序
        libraries: Array.from(libraries).sort(),  // 转换为数组并排序
        keywords: Array.from(keywords).sort()      // 转换为数组并排序
    };
}




function displaySummary(summary) {
    const summaryDiv = document.getElementById('summary');
    if (!summaryDiv) {
        console.error('Summary div not found.');
        return;
    }

    summaryDiv.innerHTML = ''; // 清空内容

    const functions = summary.functions.join(', ');
    const libraries = summary.libraries.join(', ');
    const keywords = summary.keywords.join(', ');

    const userinput = `本节课目前学习到的内容有函数${functions}还有python库${libraries}以及关键字${keywords}，请帮我进行知识总结，谢谢！`
    chrome.runtime.sendMessage({ message: 'generate_text', UserInput: userinput },
        (response) => {
            let htmlContent = marked(response.data);
            let aiMessageElement = document.getElementById('summary');
            aiMessageElement.classList.add('message', 'aiMessage');
            aiMessageElement.innerHTML = htmlContent; // 设置HTML内容
                                            
            console.log("逐个显示每个新添加的块级元素")
            const mainDiv = document.querySelector('.main'); 
            mainDiv.style.display = 'none';
            
            messageDiv.appendChild(aiMessageElement);
            // 当浏览器扩展返回响应时，代码将响应文本分割成单个单词，并创建一个包含 "message" 和 "aiMessage" 类的段落元素。接着将该段落元素添加到 ID 为 "messages" 的 HTML 元素中。
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
        });
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

// 保存为图片
document.getElementById('savebutton').addEventListener('click', function () {
    const summaryElement = document.getElementById('summary-container');

    html2canvas(summaryElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'summary.png';
        link.click();
    }).catch(error => {
        console.error('转换为图片时出错:', error);
    });
});

// 保存成pdf
// document.getElementById('savebutton').addEventListener('click', () => {
//     const summaryDiv = document.getElementById('summary');
//     if (!summaryDiv) {
//         console.error('Summary div not found.');
//         return;
//     }

//     // 获取 summary 的内容
//     const summaryContent = summaryDiv.innerHTML;
//     console.log("得到summaryContent！")
//     console.log(summaryContent)
//     // 创建 jsPDF 实例
//     const { jsPDF } = window.jspdf;
//     const pdf = new jsPDF();

//     // 将 HTML 内容添加到 PDF 中
//     pdf.html(summaryContent, {
//         callback: function (doc) {
//             doc.save('summary.pdf'); // 保存 PDF
//         },
//         x: 10,
//         y: 10,
//     });
// });

// 导航栏
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    });
