

document.addEventListener("mouseup", function () {
  var selectedText = window.getSelection().toString();
  if (selectedText && selectedText.trim() !== "") {
    chrome.runtime.sendMessage({ action: "updateSelection", text: selectedText });
  }
});

// 词云图new
function extractFunctionNamesAndLibraries(code) {
  const functionPattern = /\b([a-zA-Z_]\w*)\s*=\s*function\s*\(|\bdef\s+([a-zA-Z_]\w*)/g; // 匹配函数名
  const libraryPattern = /import\s+([a-zA-Z_]\w*)|from\s+([a-zA-Z_]\w+)\s+import/g; // 匹配库名

  let functionNames = [];
  let libraries = new Set();
  
  let match;

  // 提取函数名
  while ((match = functionPattern.exec(code)) !== null) {
    functionNames.push(match[1] || match[2]);
  }

  // 提取库名
  while ((match = libraryPattern.exec(code)) !== null) {
    libraries.add(match[1] || match[2]);
  }

  return {
    functions: functionNames,
    libraries: Array.from(libraries),
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("content-respond!")
  if (request.message === 'getcode') {
    const codeText = getCodeSnippets();
      const { functions, libraries } = extractFunctionNamesAndLibraries(codeText);
      allFunctions = allFunctions.concat(functions);
      libraries.forEach(lib => allLibraries.add(lib));

    const result = {
      functions: allFunctions,
      libraries: Array.from(allLibraries),
    };

    sendResponse(result); // 发送包含函数名和库名的响应
    console.log("content已经提取库名！")
  }


  if (request.message === 'getCodeSnippets') {
    
    const snippets = getCodeSnippets();
    sendResponse({ codeSnippets: snippets });
  }


});


// summary

function getCodeSnippets() {
  const codeCells = document.querySelectorAll('.cell .input_area .CodeMirror-code');
  let codeSnippets = [];

  codeCells.forEach((code, index) => {
    const codeText = code.innerText || code.textContent; // 使用 innerText 或 textContent
    console.log(`Code in cell ${index + 1}:`, codeText); // 打印提取的代码内容
    if (codeText) {
        codeSnippets.push(codeText); // 如果找到代码，添加到结果数组中
    } else {
        console.log(`Code cell ${index + 1} is empty or not found.`); // 输出未找到的情况
    }
  });

  console.log(`Collected ${codeSnippets.length} code snippets.`);
  return codeSnippets;
}




