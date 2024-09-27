// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const API_ENDPOINT = 'https://agentapi.baidu.com/assistant/getAnswer';  
const APP_ID = 'pIbemxB5mjF1LZTCPdDXfCgLLydbhltb'; // 替换为实际appId  
const SECRET_KEY = 'ngqDuVcVQtK9ScEldSdcueWMlTHJDOuH'; // 替换为实际secretKey  
const JUYPTER_ORIGIN = 'https://8888/';
// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
	if (!tab.url) return;
	await chrome.sidePanel.setOptions({
	  tabId,
	  path: 'sidepanel.html',
	  enabled: true
	});
});


let conversationHistory = [];
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'generate_text') {
    chrome.storage.local.get(['openai_key'], function (result) {
      console.log(result.openai_key);
      const openai_key = result.openai_key;

      conversationHistory.push({ role: 'user', content: request.UserInput });

      fetch(`${API_ENDPOINT}?appId=${APP_ID}&secretKey=${SECRET_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {  
            content: {  
              type: 'text',  
              value: {  
                showText: request.UserInput  
              }  
            }  
          },  
          source: APP_ID, // 使用实际的appId作为source  
          from: 'openapi',  
          openId: '123' // 替换为实际openId   // Replace with a unique identifier for your end-user
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          // Add the AI's message to the conversation history
          conversationHistory.push({
            role: 'assistant',
            content: response.data.content[0].data,
          });
          sendResponse({ data: response.data.content[0].data });
        })
        .catch((error) => console.error('Error:', error));
    });
    // Must return true to indicate that the response is sent asynchronously
    return true;
  }
});