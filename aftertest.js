// 导航栏
fetch('navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar').innerHTML = data;
  });
  window.onload = function() {
    var s = ["#050626", "#0a0b44", "#0f1165", "#1a1d95", "#1c1fa7", "#1c20c8", "#060cff"];
    // s = ["#333333","#555555","#777777","#999999","#AAAAAA","#CCCCCC","#EEEEEE"];

    var div1 = document.getElementById('div1');
    var div2 = document.getElementById('div22');
    var pimg = document.getElementById('pimg');

    

    function Larrange() {
        pimg.innerHTML = "";
        for (let i = 0; i < 9; i++) {
            pimg.innerHTML += "<input style='width:15px;height:10px;border:0;background:" + s[i] + ";margin:1'>";
        }
    }

    function Rarrange() {
        pimg.innerHTML = "";
        for (let i = 9; i >= 0; i--) {
            pimg.innerHTML += "<input style='width:15px;height:10px;border:0;background:" + s[i] + ";margin:1'>";
        }
    }

    var is = 0; // 用于控制移动方向
    var size = 0; // 用于标识当前样式

    function move() {
        if (pimg.offsetLeft < 350 && is === 0) {
            if (size === 0) {
                Larrange();
                size = 1;
            }
            pimg.style.left = pimg.offsetLeft + 6 + "px"; // 每次向右移动 6 像素
            setTimeout(move, 50); // 每 50 毫秒移动一次
        } else if (is === 0) {
            is = 1; // 改变方向
        }

        if (pimg.offsetLeft > -200 && is === 1) {
            if (size === 1) {
                Rarrange();
                size = 0;
            }
            pimg.style.left = pimg.offsetLeft - 6 + "px"; // 每次向左移动 6 像素
            setTimeout(move, 50); // 每 50 毫秒移动一次
        } else if (is === 1) {
            is = 0; // 改变方向
        }
    }

    function flashs() {
        if (div2.style.color === "#ffffff") {
            div2.style.color = "#707888";
        } else {
            div2.style.color = "#ffffff";
        }
        setTimeout(flashs, 500); // 每 500 毫秒闪烁一次
    }

    Larrange(); // 初始化样式
    for (let i = 0; i < 9; i++) {
        flashs(); // 启动闪烁效果
        move(); // 启动移动效果
    }
}



  

document.getElementById('loader').style.display = 'block';
document.getElementById('generate-button').addEventListener('click', async () => {
    console.log('测验Button clicked!');
    const readyElement = document.getElementById('readyElement');
    readyElement.style.display = 'flex'; // 显示元素并设置为flex布局


    
    chrome.runtime.sendMessage({ message: 'getCodeSnippets' }, (response) => {
        console.log('测验sendMessage!');
        if (response && response.codeSnippets) { // 确保 response 存在
            console.log('测验catch win!');
            const text = cleanCode(response.codeSnippets);
            console.log(text);    
        } else {
            console.log('catch lose!');
        }
    });
    const response = await fetch('http://localhost:5001/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "example_key": "example_value" })
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const recommendedIds = data.recommended_ids.join(', ');
    // 跳转到 quiz.html，并将推荐的题号作为查询参数传递
    window.location.href = `quuuiz.html?recommendedIds=${encodeURIComponent(recommendedIds)}`;
    document.getElementById('loader').style.display = 'none'; // 隐藏加载动画
    
    const similarities = data.similarities.join(', ');
    console.log("`推荐的题号: ${recommendedIds}\n相似度: ${similarities}`") ;
    debugger;

    
});




function cleanCode(codeSnippets) {
    const functions = new Set(); // 用来存储唯一的函数
    const libraries = new Set(); // 用来存储唯一的库
    const keywords = new Set([
        "False", "None", "True", "and", "as", "assert", "async", "await",
        "break", "class", "continue", "def", "del", "elif", "else", "except",
        "finally", "for", "from", "global", "if", "import", "in", "is",
        "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
        "try", "while", "with", "yield"
    ]);

    // 合并所有代码段为一个字符串
    let combinedCode = codeSnippets.join(' '); // 使用空格合并数组元素

    // 删除多余的空行并用一个空格替代换行符
    combinedCode = combinedCode.replace(/\n+/g, ' '); // 替换多个换行符为一个空格
    combinedCode = combinedCode.replace(/\s+/g, ' '); // 替换多个空格为一个空格

    // 处理每段代码
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

    // 将函数、库和关键字合并为一个字符串，且用空格分隔
    let result = [
        ...Array.from(functions),
        ...Array.from(libraries),
        ...Array.from(keywords)
    ].join(' ');

    return result.trim(); // 返回清理后的代码并包含函数、库和关键字
}




