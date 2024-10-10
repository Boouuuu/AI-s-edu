async function loadQuestions() {
    try {
        const response = await fetch('dataa.json');
        const questions = await response.json();
        console.log('加载的问题:', questions); // 输出加载的问题
        generateQuestions(questions);
    } catch (error) {
        console.error('加载问题时出错:', error);
    }
}

const num = 10;

let doneCount = 0;
let notDoneCount = num; // 根据 num 初始化未做的题目数量
let markedCount = 0;

// 创建题目序号按钮
const questionsContainer = document.querySelector('.questions-number');

// 动态生成题目序号按钮
for (let i = 1; i <= num; i++) {
    const questionCircle = document.createElement('div');
    questionCircle.classList.add('question-circle');
    questionCircle.textContent = i;

    // 点击按钮时，滑动到对应题号
    questionCircle.addEventListener('click', () => {
        const questionBox = document.querySelector(`#question-${i}`);
        if (questionBox) {
            questionBox.scrollIntoView({ behavior: 'smooth' });
        }
    });

    questionsContainer.appendChild(questionCircle);
}



let answers = Array(num).fill(null); // 初始化答案数组
let correctAnswers = []; // 存储正确答案
let titles = []; // 存储每道题的 title
let iid = [];
// 生成题目内容
function generateQuestions(questions) {
    const container = document.getElementById('container');
    const limitedQuestions = getRandomQuestions(questions, num);
    console.log('选中的问题:', limitedQuestions); // 输出选中的问题

    limitedQuestions.forEach((question, index) => {
        const questionBox = document.createElement('div');
        questionBox.classList.add('question-box');
        questionBox.id = `question-${index + 1}`; // 为每个题目添加唯一 ID

        // 第一层
        const header = document.createElement('div');
        header.classList.add('header');

        const questionNumber = document.createElement('span');
        questionNumber.classList.add('purple-box', 'question-num');
        questionNumber.textContent = "第" + (index + 1) + "题";

        // 创建新的 div
        const biaoqian = document.createElement('div');
        header.classList.add('biaoqian');
        biaoqian.classList.add('light-box');
        // 根据 index + 1 的值来设置文本内容
        const questionIndex = index + 1;
        if (questionIndex >= 1 && questionIndex <= 3) {
            biaoqian.textContent = "巩固";
        } else if (questionIndex >= 4 && questionIndex <= 7) {
            biaoqian.textContent = "提升";
        } else if (questionIndex >= 8 && questionIndex <= 10) {
            biaoqian.textContent = "挑战";
        }
        

        const questionType = document.createElement('span');
        questionType.classList.add('purple-box');
        questionType.textContent = question.type;

        header.appendChild(questionNumber);
        header.appendChild(biaoqian);
        header.appendChild(questionType);
        questionBox.appendChild(header);



        // 第二层
        const questionText = document.createElement('div');
        questionText.classList.add('question-text');
        questionText.textContent = question.content;
        console.log(`题目 ${index + 1}:`, question.content); // 输出题目内容
        questionBox.appendChild(questionText);

        // 将题目的 title 添加到 titles 数组中
        titles.push(question.title); // 假设每个 question 对象都有 title 属性

        // 将题目的 iid添加到 iids 数组中
        iid.push(question.iid); // 

       // 第三层
       const optionsContainer = document.createElement('div');
       optionsContainer.classList.add('options');

       // 将选项对象转换为数组
       const options = Object.values(question.options);
       console.log(`题目 ${index + 1} 的选项:`, options); // 输出选项内容
       correctAnswers.push(question.answer); // 保存正确答案

       options.forEach((option) => {
           const optionLabel = document.createElement('label');
           optionLabel.classList.add('option');

           const inputType = question.type === '单选题' ? 'radio' : 'checkbox';
           const input = document.createElement('input');
           input.type = inputType;
           input.name = `question${index}`; 

           // 添加事件监听器
           input.addEventListener('change', () => {
               console.log(`题目 ${index + 1} 的选项被选中:`, option); // 输出被选中的选项
               updateQuestionStatus(index);
           });

            const optionText = document.createTextNode(option);
            optionLabel.appendChild(input);
            optionLabel.appendChild(optionText);
            optionsContainer.appendChild(optionLabel);
        });

        questionBox.appendChild(optionsContainer);
        container.appendChild(questionBox);
    });
}


// 初始化加载题目
loadQuestions();



function getRandomQuestions(questions, num) {
    // 获取查询字符串
    const queryString = window.location.search;

    // 使用 URLSearchParams 解析查询字符串
    const urlParams = new URLSearchParams(queryString);

    // 获取 recommendedIds 参数
    const recommendedIds = urlParams.get('recommendedIds');

    // 将推荐的题号解析成列表
    const recommendedIdsList = recommendedIds ? recommendedIds.split(',').map(Number) : [];


    const selectedQuestions = [];
    const usedIndices = new Set();
    for (let i = 0; i < recommendedIdsList.length; i++) {
        const index = recommendedIdsList[i] - 1; // 减 1 以匹配数组索引
        if (index >= 0 && index < questions.length) {
            selectedQuestions.push(questions[index]);
            usedIndices.add(index);
        }
    }

    return selectedQuestions;
}

/*
// 随机选择指定数量的题目
function getRandomQuestions(questions, num) {
    const selectedQuestions = [];
    const usedIndices = new Set();

    while (selectedQuestions.length < num && selectedQuestions.length < questions.length) {
        const randomIndex = Math.floor(Math.random() * questions.length);
        if (!usedIndices.has(randomIndex)) {
            selectedQuestions.push(questions[randomIndex]);
            usedIndices.add(randomIndex);
        }
    }

    return selectedQuestions;
}

*/




// 更新题目状态
function updateQuestionStatus(questionIndex) {
    const circle = document.querySelector(`.questions-number .question-circle:nth-child(${questionIndex + 1})`);
    const inputs = document.querySelectorAll(`#question-${questionIndex + 1} input`);
    const anyChecked = Array.from(inputs).some(input => input.checked);

    if (anyChecked) {
        circle.classList.add('completed');
    } else {
        circle.classList.remove('completed');
    }

    updateCounts();
}

// 更新状态统计
function updateCounts() {
    doneCount = 0; // 重置已做计数
    notDoneCount = num; // 重置未做计数

    // 遍历所有题目，判断已做和未做
    for (let i = 0; i < num; i++) {
        const inputs = document.querySelectorAll(`#question-${i + 1} input`);
        const anyChecked = Array.from(inputs).some(input => input.checked);

        if (anyChecked) {
            doneCount++; // 有一个或多个选项被选中
            notDoneCount--; // 对应的未做题目减一
        }
    }

    // 更新显示
    document.getElementById('done').textContent = `已做: ${doneCount}`;
    document.getElementById('not-done').textContent = `未做: ${notDoneCount}`;
    document.getElementById('marked').textContent = `标记: ${markedCount}`;
}

let time = 0; // 初始化时间为0秒
let timer; // 声明一个变量用于存储计时器
const timerElement = document.getElementById('timer');

// 启动计时器
function startTimer() {
    timer = setInterval(() => {
        time++;
        updateTimer();
    }, 1000);
}

// 更新显示的计时器
function updateTimer() {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    timerElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

// 停止计时器
function stopTimer() {
    clearInterval(timer);
    alert("答案已提交");
}

// 在页面加载时启动计时器
window.onload = startTimer;

// 禁用所有选项并显示答题结果
function displayResults() {
    for (let i = 0; i < num; i++) {
        const questionBox = document.getElementById(`question-${i + 1}`);
        const inputs = questionBox.querySelectorAll('input');
        
        // 禁用选项
        inputs.forEach(input => {
            input.disabled = true;
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById('submit-btn');
    
    submitButton.addEventListener('click', async () => {
        stopTimer(); // 点击提交按钮时停止计时
        displayResults(); // 显示结果

       
    const userAnswers = []; // 存储用户答案

    for (let i = 0; i < num; i++) {
        const inputs = document.querySelectorAll(`#question-${i + 1} input`);
        const userSelection = Array.from(inputs)
            .filter(input => input.checked)
            .map(input => {
                const optionIndex = Array.from(inputs).indexOf(input); // 获取当前选项的索引
                return String.fromCharCode(65 + optionIndex); // 将索引转换为字母（A=65）
            }); // 获取用户选择的答案

        const questionType = inputs[0].type === 'radio' ? '单选题' : '多选题';
        const questionText = document.querySelector(`#question-${i + 1} .question-text`).textContent;
        


        // 判断用户选择和正确答案是否一致
        let isCorrect = false; // 每道题的正误
        if (questionType === '单选题') {
            // 对于单选题，比较用户选择和正确答案
            if (userSelection[0] === correctAnswers[i]) {
                isCorrect = true; // 如果用户选择正确
            }
        } else if (questionType === '多选题') {
            // 对于多选题，比较用户选择和正确答案
            const correctAnswerSet = new Set(correctAnswers[i]); // 使用集合来判断
            const userSelectionSet = new Set(userSelection);

            // 检查用户选择的答案是否与正确答案完全一致
            if (userSelectionSet.size === correctAnswerSet.size && 
                [...userSelectionSet].every(answer => correctAnswerSet.has(answer))) {
                isCorrect = true; // 如果用户选择完全正确
            }
            console.log(isCorrect);
        }

        // 将每道题的详细信息和正误存入 userAnswers
        userAnswers.push({
            questionNumber: i + 1,
            questionType: questionType,
            questionText: questionText,
            options: Array.from(inputs).map(input => input.nextSibling.textContent), // 获取所有选项
            userSelection: userSelection, // 用户的选择（以字母形式）
            correctAnswer: correctAnswers[i], // 正确答案
            isCorrect: isCorrect, // 每道题的正误
            questionTitle:titles[i],
            iid:iid[i]
        });
    }
    console.log(userAnswers);

    
        
        

        const username = localStorage.getItem('username'); // 从 localStorage 获取用户名
        console.log(username);
        const ttime= timerElement.textContent;
        console.log(ttime); // 检查其值

        const submitTime = new Date().toISOString(); // 获取当前时间
        const submissionData = {
            username,
            submitTime,
            ttime,
            doneCount,
            notDoneCount,
            markedCount,
            userAnswers // 将用户答案存储到这里
        };

        try {
            const response = await fetch('http://localhost:5000/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });

            if (response.ok) {
                console.log('数据成功提交');
                // 创建一个自定义事件
                const event = new CustomEvent('submitTimeEvent', { detail: { submitTime } });
                // 派发事件
                window.dispatchEvent(event);
                console.log("事件派发")

               // window.location.href = `paper.html?submitTime=${encodeURIComponent(submitTime)}`;
            } else {
                console.error('数据提交失败:', response.statusText);
            }
        } catch (error) {
            console.error('提交过程中出现错误:', error);
        }

    });
});




/*
// 定时器倒计时功能（简单实现）
let time = 600; // 10分钟 = 600秒
const timerElement = document.getElementById('timer');

function updateTimer() {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    timerElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    if (time > 0) {
        time--;
        setTimeout(updateTimer, 1000);
    } else {
        alert("时间到！");
    }
}
*/

updateTimer();

/*

const navbar = document.getElementById('navbar');
let offsetX, offsetY, isDragging = false;

// 鼠标按下事件
navbar.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - navbar.getBoundingClientRect().left;
    offsetY = e.clientY - navbar.getBoundingClientRect().top;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// 鼠标移动事件
function onMouseMove(e) {
    if (isDragging) {
        // 计算新的位置
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;

        // 确保不超出边界
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (newLeft < 0) newLeft = 0; // 左边界
        if (newTop < 0) newTop = 0; // 上边界
        if (newLeft + navbar.offsetWidth > windowWidth) newLeft = windowWidth - navbar.offsetWidth; // 右边界
        if (newTop + navbar.offsetHeight > windowHeight) newTop = windowHeight - navbar.offsetHeight; // 下边界

        // 更新位置
        navbar.style.left = `${newLeft}px`;
        navbar.style.top = `${newTop}px`;
    }
}

// 鼠标抬起事件
function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

// 处理窗口大小调整
window.addEventListener('resize', () => {
    // 计算新的左侧位置以保持居中
    const newLeft = (window.innerWidth / 2) - (navbar.offsetWidth / 2);
    navbar.style.left = `${newLeft}px`;
});

*/
const navbar = document.getElementById('navbar');
let offsetX, offsetY, isDragging = false;


navbar.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - navbar.getBoundingClientRect().right;
    offsetY = e.clientY - navbar.getBoundingClientRect().bottom;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
    if (isDragging) {
        
        let newRight = window.innerWidth - (e.clientX - offsetX);
        let newBottom = window.innerHeight - (e.clientY - offsetY);

        if (newRight < 0) newRight = 0; 
        if (newBottom < 0) newBottom = 0; 
        if (newRight > window.innerWidth - navbar.offsetWidth) newRight = window.innerWidth - navbar.offsetWidth; // Left boundary
        if (newBottom > window.innerHeight - navbar.offsetHeight) newBottom = window.innerHeight - navbar.offsetHeight; // Top boundary

       
        navbar.style.right = `${newRight}px`;
        navbar.style.bottom = `${newBottom}px`;
    }
}


function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}


window.addEventListener('resize', () => {
    const newRight = Math.max(window.innerWidth - navbar.offsetWidth - 10, 0);
    const newBottom = Math.max(window.innerHeight - navbar.offsetHeight - 10, 0);
    navbar.style.right = `${newRight}px`;
    navbar.style.bottom = `${newBottom}px`;
});


// 点击白板图标收起/展开导航栏
const whiteboardIcon = document.querySelector('.whiteboard-icon');
let isCollapsed = false;

whiteboardIcon.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
        navbar.classList.add('collapsed'); // 添加收起样式
        // 隐藏时间和提交按钮
        const timer = document.getElementById('timer');
        const submitButton = document.getElementById('submit-btn');
        const layers = navbar.querySelectorAll('.middle-layer, .bottom-layer');
        layers.forEach(layer => {
            layer.classList.add('hidden'); // 隐藏层
        });
        timer.classList.add('hidden'); // 隐藏时间
        submitButton.classList.add('hidden'); // 隐藏提交按钮
    } else {
        navbar.classList.remove('collapsed'); // 移除收起样式
        // 显示时间和提交按钮
        const timer = document.getElementById('timer');
        const submitButton = document.getElementById('submit-btn');
        timer.classList.remove('hidden'); // 显示时间
        submitButton.classList.remove('hidden'); // 显示提交按钮
        const layers = navbar.querySelectorAll('.middle-layer, .bottom-layer');
        layers.forEach(layer => {
            layer.classList.remove('hidden'); // 显示层
        });
    }
});


function adjustHeight() {  
    var slider = document.getElementById("heightSlider");  
    var box = document.getElementById("resizableBox");  
    box.style.height = slider.value + 'px'; // 根据滑动条的值动态调整高度  
}  
  
// 初始化时设置一次高度，确保页面加载时高度正确  
adjustHeight();




   
