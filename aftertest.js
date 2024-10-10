// 导航栏
fetch('navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar').innerHTML = data;
  });
  
document.getElementById('generate-button').addEventListener('click', async () => {
    console.log('测验Button clicked!');
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

    
    const similarities = data.similarities.join(', ');
    console.log("`推荐的题号: ${recommendedIds}\n相似度: ${similarities}`") ;

    
});




function cleanCode(codes) {
    // 合并所有代码段为一个字符串
    let combinedCode = codes.join(' '); // 使用空格合并数组元素

    // 使用正则表达式去除注释
    // combinedCode = combinedCode.replace(/#.*$/gm, ''); // 删除以 # 开头的注释
    
    // 删除多余的空行并用一个空格替代换行符
    combinedCode = combinedCode.replace(/\n+/g, ' '); // 替换多个换行符为一个空格
    combinedCode = combinedCode.replace(/\s+/g, ' '); // 替换多个空格为一个空格

    return combinedCode.trim(); // 返回清理后的代码
}



