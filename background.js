let conversationHistory = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'generate_text') {
    chrome.storage.local.get(['openai_key'], function (result) {
      console.log(result.openai_key);
      const openai_key = result.openai_key;

      conversationHistory.push({ role: 'user', content: request.userInput });

      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openai_key}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: conversationHistory,
          max_tokens: 1000,
          temperature: 0.3,
          user: 'unique-user-id', 
        }),
      })
        .then((response) => response.json())
        .then((data) => {
         
          conversationHistory.push({
            role: 'assistant',
            content: data.choices[0].message.content,
          });
          sendResponse({ data: data.choices[0].message.content });
        })
        .catch((error) => console.error('Error:', error));
    });
    
    return true;
  }

  if (request.message === 'getCodeSnippets') {
    const snippets = getCodeSnippets();
    console.log("code have got!")
    sendResponse({ codeSnippets: snippets });
  }
});



