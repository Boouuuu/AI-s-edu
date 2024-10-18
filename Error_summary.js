 const API_ENDPOINT = 'https://agentapi.baidu.com/assistant/getAnswer';  
const APP_ID = 'pIbemxB5mjF1LZTCPdDXfCgLLydbhltb'; // 替换为实际appId  
const SECRET_KEY = 'ngqDuVcVQtK9ScEldSdcueWMlTHJDOuH'; // 替换为实际secretKey  
const JUYPTER_ORIGIN = 'https://8888/';
// 定义全局变量
let questions
let all
let UserInput

async function errorSummary() {
  try {
    const summaryFilePath =await fetch('everysummary.json');
      questions = await summaryFilePath.json();
      const allQuestionsFilePath = await fetch('dataa.json');
      all=await allQuestionsFilePath.json();
      console.log('加载的问题:', questions); // 输出加载的问题
      console.log('加载的题库:', all); // 输出加载的问题
      main();
  } catch (error) {
      console.error('加载问题时出错:', error);
  }
}
// 整合数据  
function integrateData(summaryData, allQuestionsData) {  
    const integratedData = [];  
    summaryData.forEach(summaryItem => {  
        const questionNumber = summaryItem.questionNumber;  
        const question = allQuestionsData.find(question => question.number === questionNumber);  
        if (question) {  
            const integratedItem = {  
                questionNumber: questionNumber,  
                title: question.title,  
                content: question.content,  
                options: question.options,  
                isCorrect: summaryItem.isCorrect  
            };  
            integratedData.push(integratedItem);  
        }  
    });  
    return integratedData;  
}  
  
// 向智能体发送请求 
function main() {  
    try {  

        const summaryData = questions; 
        console.log(summaryData);
         
        const allQuestionsData = all;  
        console.log(allQuestionsData);
        
        const integratedData = integrateData(summaryData, allQuestionsData);  
        
        const JSONSTRING=JSON.stringify(integratedData, null, 2);
        UserInput=JSONSTRING
        console.log(UserInput); // 输出整合后的JSON对象，格式化输出便于阅读  
        // 将JSON对象转化为字符串对象

    } catch (error) {  
        console.error('Error:', error);  
    }  
    let userinput=`请根据下面题目内容以及回答情况，帮学生进行总结！具体题目内容以及回答情况如下：${UserInput}`
    console.log(userinput);
    
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
                showText: userinput
              }  
            }  
          },  
          source: APP_ID, // 使用实际的appId作为source  
          from: 'openapi',  
          openId: '123' // 替换为实际openId   
        }),
      })
        .then((response) => response.json()).then((response)=>{console.log(response.data.content[0].data)
        const summary=document.createElement('div');
        summary.innerHTML=marked(response.data.content[0].data);
        document.body.appendChild(summary);
        console.log('插入成功');
        })
        .catch((error) => console.error('Error:', error))
}  
  

// 执行程序  
document.addEventListener("DOMContentLoaded", () => {
  errorSummary();})


