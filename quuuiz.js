async function loadQuestions() {
    try {
        const response = await fetch('data.json');
        const questions = await response.json();
        generateQuestions(questions);
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

const num=10;

let answers = Array(num).fill(null); // 初始化答案数组
let correctAnswers = []; // 存储正确答案

// 生成题目内容
function generateQuestions(questions) {
    const container = document.getElementById('container');
    const limitedQuestions = getRandomQuestions(questions, num);

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

        const questionType = document.createElement('span');
        questionType.classList.add('purple-box');
        questionType.textContent = question.类型;

        header.appendChild(questionNumber);
        header.appendChild(questionType);
        questionBox.appendChild(header);

        // 第二层
        const questionText = document.createElement('div');
        questionText.classList.add('question-text');
        questionText.textContent = question.题目;
        questionBox.appendChild(questionText);

        // 第三层
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options');

        const options = JSON.parse(question.选项.replace(/'/g, '"'));
        correctAnswers.push(question.答案); // 保存正确答案


        options.forEach((option) => {
            const optionLabel = document.createElement('label');
            optionLabel.classList.add('option');

            const inputType = question.类型 === '单选题' ? 'radio' : 'checkbox';
            const input = document.createElement('input');
            input.type = inputType;
            input.name = `question${index}`; 


             // 添加事件监听器
            input.addEventListener('change', () => {
                // 调用更新状态的方法
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

            userAnswers.push({
                questionNumber: i + 1,
                questionType: questionType,
                questionText: questionText,
                options: Array.from(inputs).map(input => input.nextSibling.textContent), // 获取所有选项
                userSelection: userSelection, // 用户的选择（以字母形式）
                correctAnswer: correctAnswers[i] // 正确答案
            });
        }

        const ttime= timerElement.textContent;
        console.log(ttime); // 检查其值

        const submitTime = new Date().toISOString(); // 获取当前时间
        const submissionData = {
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
                console.log('数据已成功提交');
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




   
