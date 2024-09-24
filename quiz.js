/*let currentQuestionIndex = 0; // 当前题目的索引
let selectedAnswers = {}; // 存储用户的选择
let selectedQuestions; // 随机选择的题目列表

// 加载 data.json 数据
fetch('data.json')
    .then(response => {
        if (!response.ok) throw new Error('网络错误');
        return response.json();
    })
    .then(quizData => {
        // 随机选择10个题目
        selectedQuestions = getRandomQuestions(quizData, 10);
        fillQuestions(selectedQuestions);

        // 绑定按钮事件
        document.querySelector('.next-question').addEventListener('click', () => {
            if (currentQuestionIndex < selectedQuestions.length - 1) {
                currentQuestionIndex++;
                fillQuestions(selectedQuestions);
            }
        });

        document.querySelector('.prev-question').addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                fillQuestions(selectedQuestions);
            }
        });
    })
    .catch(error => console.error('加载数据失败:', error));

// 随机选择题目函数
function getRandomQuestions(data, num) {
    const shuffled = data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

// 填充题目和选项
function fillQuestions(questions) {
    const titleContainer = document.querySelector('.title-container .scrollable-title p');
    const optionBoxes = document.querySelectorAll('.options-box');

    const question = questions[currentQuestionIndex]; // 根据当前索引选择问题
    
    titleContainer.textContent = question.题目; // 填充题目
    const optionsString = question.选项;
    const options = JSON.parse(optionsString.replace(/'/g, '"'));

    optionBoxes.forEach((box, idx) => {
        const span = box.querySelector('.scrollable-content');
        span.textContent = options[idx] || ''; // 填充选项

         options.forEach((option, idx) => {
        const optionBox = document.createElement('div');
        optionBox.classList.add('option-box');
        optionBox.innerHTML = `
            <label>
                <input type="radio" name="question" value="${idx}"> 
                <span class="scrollable-content">${option}</span>
            </label>
        `;
        optionContainer.appendChild(optionBox);

        // 保留单选框的状态
        const radioInput = box.querySelector('input[type="radio"]');
        radioInput.value = idx; // 设置单选框的值
        radioInput.checked = selectedAnswers[currentQuestionIndex] == idx; // 保留用户的选择

        // 为单选框添加事件监听器，保存选择
        radioInput.addEventListener('change', () => {
            selectedAnswers[currentQuestionIndex] = idx; // 存储用户选择
        });
    });
}
*/


console.log('quiz.js已加载');

let currentQuestionIndex = 0; // 当前题目的索引
let selectedAnswers = {}; // 存储用户的选择
let selectedQuestions; // 随机选择的题目列表

// 加载 data.json 数据
fetch('data.json')
    .then(response => {
        if (!response.ok) throw new Error('网络错误');
        return response.json();
    })
    .then(quizData => {
        // 随机选择10个题目
        selectedQuestions = getRandomQuestions(quizData, 10);
        fillQuestions(selectedQuestions);

        // 绑定按钮事件
        document.querySelector('.next-question').addEventListener('click', () => {
            if (currentQuestionIndex < selectedQuestions.length - 1) {
                currentQuestionIndex++;
                fillQuestions(selectedQuestions);
            }
        });

        document.querySelector('.prev-question').addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                fillQuestions(selectedQuestions);
            }
        });
    })
    .catch(error => console.error('加载数据失败:', error));

// 随机选择题目函数
function getRandomQuestions(data, num) {
    const shuffled = data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

// 填充题目和选项
function fillQuestions(questions) {
    const titleContainer = document.querySelector('.title-container .scrollable-title p');
    const optionContainer = document.querySelector('.options-box'); // 假设这是选项的父容器
    const questionInfo = document.querySelector('.question-info'); // 获取题目信息容器
    optionContainer.innerHTML = ''; // 清空之前的选项

    const question = questions[currentQuestionIndex]; // 根据当前索引选择问题
    
    titleContainer.textContent = question.题目; // 填充题目
    const optionsString = question.选项.replace(/‘|’/g, '"').replace(/'/g, '"');
    const options = JSON.parse(optionsString);

   // 更新题目信息
   questionInfo.textContent = `${currentQuestionIndex + 1}/${questions.length}`; // 当前题目/总题数


    options.forEach((option, idx) => {
        const optionBox = document.createElement('div');
        optionBox.classList.add('option-box');
        optionBox.innerHTML = `
            <label>
                <input type="radio" name="question" value="${idx}"> 
                <span class="scrollable-content">${option}</span>
            </label>
        `;
        optionContainer.appendChild(optionBox);

        // 保留单选框的状态
        const radioInput = optionBox.querySelector('input[type="radio"]');
        radioInput.checked = selectedAnswers[currentQuestionIndex] == idx; // 保留用户的选择

        // 为单选框添加事件监听器，保存选择
        radioInput.addEventListener('change', () => {
            selectedAnswers[currentQuestionIndex] = idx; // 存储用户选择
        });
    });
}

let timer; // 定义计时器
let timeLeft = 300; // 300秒（5分钟）

function startTimer() {
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("时间到！"); // 时间到时的提示
            // 可以添加提交逻辑
        } else {
            timeLeft--;
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElement = document.querySelector('.timer');
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 点击提交按钮时清除计时器
document.querySelector('.submit-button').addEventListener('click', () => {
    clearInterval(timer);
    alert("提交成功！"); // 提交逻辑
});

// 启动计时器
startTimer();








ldocument.addEventListener('DOMContentLoaded', function() {  
    const title = document.querySelector('.title');  
    const titleWrapper = document.querySelector('.title-wrapper');  
    const toggleBtn = document.querySelector('.toggle-btn');  
  
    // 检查标题是否超出容器宽度  
    if (title.scrollWidth > titleWrapper.offsetWidth) {  
        // 如果超出，显示下拉按钮（但这里不实现真正的下拉框，只是显示按钮）  
        toggleBtn.style.display = 'inline-block';  
  
        // 为下拉按钮添加点击事件（这里只是示例，实际应实现下拉效果）  
        toggleBtn.addEventListener('click', function() {  
            // 这里可以弹出一个模态框、工具提示或其他UI元素来显示完整标题  
            alert('完整标题是: ' + title.textContent);  
        });  
    }  
  
    // 注意：高度检查在这个场景中可能不太必要，因为容器高度已经固定  
    // 如果需要处理高度超出的情况，可以添加类似的逻辑  
});


