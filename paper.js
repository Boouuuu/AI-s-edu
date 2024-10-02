// 获取提交记录，支持根据 submitTime 查询
async function fetchSubmissionsByTime(submitTime) {
    try {
        // 打印当前提交时间
        console.log('提交的 submitTime:', submitTime);

        // 如果提供了 submitTime，则将其作为查询参数传递到请求 URL 中
        const url = submitTime 
            ? `http://localhost:5000/submissions?submitTime=${encodeURIComponent(submitTime)}`
            : 'http://localhost:5000/submissions';
        
        // 打印请求的 URL
        console.log('请求的 URL:', url);

        const response = await fetch(url); // 发送请求到后端
        
        // 打印响应状态码
        console.log('响应状态:', response.status);

        if (!response.ok) {  // 处理非200响应
            console.error('未找到相关提交记录:', response.status, response.statusText);
            return []; // 返回空数组
        }

        // 获取响应数据并打印
        const submissions = await response.json();
        console.log('获取的提交记录:', submissions);
        
        return submissions;
    } catch (error) {
        console.error('获取数据时出错:', error);
        return []; // 返回空数组
    }

}

async function loadData() {
   // 获取URL中的提交时间参数
   const urlParams = new URLSearchParams(window.location.search);
   const submitTime = urlParams.get('submitTime');

   // 输出获取到的提交时间
   if (submitTime) {
       console.log('从 completed 页面传过来的 submitTime:', submitTime);
   } else {
       console.error('未找到 submitTime 参数');
   }
    const submissionData = await fetchSubmissionsByTime(submitTime); 

    // 确保 submissionData 有效
    if (submissionData && submissionData.length > 0) {
        console.log('提交数据:', submissionData); // 打印数据
        loadSubmissionData(submissionData[0]); // 传入有效的提交数据
    } else {
        console.error('没有找到提交数据');
    }
}

loadData()

// 确保在数据成功加载后再执行后续代码
async function loadSubmissionData(submissionData) {

// 确保 submissionData 不为空
if (!submissionData) {
    console.error('提交数据为空');
    return;
}

// 填充提交时间
document.getElementById('submitTime').textContent = `${new Date(submissionData.submitTime).toLocaleString()}`;
console.log('显示提交时间:', submissionData.submitTime);

// 填充已做、未做、标记数量
document.getElementById('doneCount').textContent = submissionData.doneCount;
document.getElementById('notDoneCount').textContent = submissionData.notDoneCount;
document.getElementById('markedCount').textContent = submissionData.markedCount;

document.getElementById('ttime').textContent =submissionData.ttime;

const container = document.getElementById('container');

 // 初始化分数
 
let totalScore = 0; // 用户总得分
const totalQuestions = submissionData.userAnswers.length; // 总题目数

// 遍历 userAnswers 数组
submissionData.userAnswers.forEach((question, index) => {
    const questionBox = document.createElement('div');
    questionBox.classList.add('question-box');
    questionBox.id = `question-${index + 1}`; // 为每个题目添加唯一 ID

    // 第一层
    const header = document.createElement('div');
    header.classList.add('header');

    const questionNumber = document.createElement('span');
    questionNumber.classList.add('purple-box', 'question-num');
    questionNumber.textContent = "第 " + (index + 1) + " 题";

    const questionType = document.createElement('span');
    questionType.classList.add('purple-box');
    questionType.textContent = question.questionType;

    header.appendChild(questionNumber);
    header.appendChild(questionType);
    questionBox.appendChild(header);

    // 第二层
    const questionText = document.createElement('div');
    questionText.classList.add('question-text');
    questionText.textContent = question.questionText;
    questionBox.appendChild(questionText);

    // 第三层
    


    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('options');

    // 处理正确答案为数组格式（适应多选题）
    const correctAnswers = question.correctAnswer.split(','); // 将 "B,C" 转换为 ["B", "C"]

    if (question.questionType === '单选') {
        // 单选题：如果用户选择了正确答案，则加1分
        if (question.userSelection[0] === correctAnswers[0]) {
            totalScore += 1;
        }
    } else if (question.questionType === '多选') {
        // 多选题：用户选择完全正确才加1分
        const isAllCorrect = correctAnswers.every(answer => question.userSelection.includes(answer));
        const isUserSelectionCorrect = question.userSelection.length === correctAnswers.length;
        if (isAllCorrect && isUserSelectionCorrect) {
            totalScore += 1;
        }
    }
    
// 遍历每个选项
question.options.forEach((option, optionIndex) => {
    const optionLabel = document.createElement('label');
    optionLabel.classList.add('option');


    // 创建单选框或多选框
    const inputType = question.questionType === '单选' ? 'radio' : 'checkbox';
    const input = document.createElement('input');
    input.type = inputType;
    input.name = `question${index + 1}`; // 根据题号设置 name 属性

    input.value = option; // 设置输入框的值
    input.disabled = true; // 禁用输入框，禁止用户操作

    // 选项文本
    const optionText = document.createTextNode(option);
    optionLabel.appendChild(input);
    optionLabel.appendChild(optionText);
    optionsContainer.appendChild(optionLabel);

    // 选项序号，如 A, B, C, D
    const optionLetter = String.fromCharCode(65 + optionIndex); // 将选项索引转换为 A、B、C、D 等

    // 判断是否为用户选择的选项
    const isUserSelection = Array.isArray(question.userSelection) 
        ? question.userSelection.includes(optionLetter) 
        : question.userSelection === optionLetter;

    // 如果是用户选择的选项
    if (isUserSelection) {
        input.checked = true; // 将选中状态赋值
        if (correctAnswers.includes(optionLetter)) {
            optionLabel.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // 用户选择正确
        } else {
            optionLabel.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // 用户选择错误
        }
    }

    // 如果该选项是正确答案
    if (correctAnswers.includes(optionLetter)) {
        optionLabel.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // 正确答案高亮为绿色
    }
    });

   


questionBox.appendChild(optionsContainer);
container.appendChild(questionBox); // 将 questionBox 添加到 container
  

// 更新分数显示
const scoresElement = document.getElementById('scores');
scoresElement.textContent = `分数: ${totalScore}/${totalQuestions}`; // 显示 "分数: 得分/总分"
   

});

 

// 获取 userAnswers 数组的元素数量
const userAnswersCount = submissionData.userAnswers.length;
// 创建题目序号按钮
const questionsContainer = document.querySelector('.questions-number');

// 动态生成题目序号按钮
for (let i = 1; i <= userAnswersCount ; i++) {
    const questionCircle = document.createElement('div');
    questionCircle.classList.add('question-circle');
    questionCircle.textContent = i;

    // 点击按钮时，滑动到对应题号
    questionCircle.addEventListener('click', () => {
        const questionBox = document.querySelector(`#question-${i}`);
        if (questionBox) {
            questionBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    questionsContainer.appendChild(questionCircle);
}












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
        //const timer = document.getElementById('Time');
        const returniuu = document.getElementById('returniu');
        const layers = navbar.querySelectorAll('.time-layer,.three-layer,.middle-layer, .bottom-layer');
        layers.forEach(layer => {
            layer.classList.add('hidden'); // 隐藏层
        });
        //timer.classList.add('hidden'); // 隐藏时间
        returniuu.classList.add('hidden'); // 隐藏分数

    } else {
        navbar.classList.remove('collapsed'); // 移除收起样式
        // 显示时间和提交按钮
        //const timer = document.getElementById('Time');
        const returniuu = document.getElementById('returniu');
        //timer.classList.remove('hidden'); // 显示时间
        returniuu.classList.remove('hidden'); // 显示分数
        const layers = navbar.querySelectorAll('.time-layer,.three-layer,.middle-layer, .bottom-layer');
        layers.forEach(layer => {
            layer.classList.remove('hidden'); // 显示层
        });
    }
});


/*function adjustHeight() {  
    var slider = document.getElementById("heightSlider");  
    var box = document.getElementById("resizableBox");  
    box.style.height = slider.value + 'px'; // 根据滑动条的值动态调整高度  
}  
  
// 初始化时设置一次高度，确保页面加载时高度正确  
adjustHeight();
}
*/
function adjustHeight() {  
    var slider = document.getElementById("heightSlider");  
    var box = document.getElementById("resizableBox");  

    if (box) { // 检查 box 是否存在
        box.style.height = slider.value + 'px'; // 根据滑动条的值动态调整高度  
    } else {
        console.warn('Resizable box not found');
    }
}  

// 初始化时设置一次高度，确保页面加载时高度正确  
document.addEventListener('DOMContentLoaded', function() {
    adjustHeight(); // 确保在 DOM 加载完成后调用
});

}

// 调用加载数据的函数
loadSubmissionData();



const returnButton = document.getElementById('returniu');

returnButton.addEventListener('click', () => {
    console.log('返回按钮被点击，跳转到 completed.html');
    window.location.href = 'completed.html'; // 跳转到 completed.html
});
