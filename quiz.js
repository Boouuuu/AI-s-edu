document.addEventListener('DOMContentLoaded', function() {  
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


// 假设你的JSON文件位于与HTML相同的目录中  
const dataUrl = 'data.json';  
  
// 加载JSON文件  
fetch(dataUrl)  
    .then(response => response.json())  
    .then(data => {  
        // 假设data是JSON对象数组中的一个元素，这里我们直接处理单个对象  
        const { 题目, 选项, 答案 } = data;  
  
        // 更新题目标题  
        document.getElementById('question-title').textContent = 题目;  
  
        // 清除之前的选项  
        const optionsContainer = document.getElementById('options-container');  
        optionsContainer.innerHTML = '';  
  
        // 动态创建选项  
        const options = JSON.parse(选项); // 将字符串转换为数组  
        options.forEach((optionText, index) => {  
            const optionBox = document.createElement('div');  
            optionBox.classList.add('option-box');  
  
            const label = document.createElement('label');  
            const radio = document.createElement('input');  
            radio.type = 'radio';  
            radio.name = 'question';  
            radio.value = String.fromCharCode(65 + index); // 使用A, B, C, D作为值  
  
            const span = document.createElement('span');  
            span.classList.add('scrollable-content');  
            span.textContent = optionText;  
  
            label.appendChild(radio);  
            label.appendChild(span);  
  
            optionBox.appendChild(label);  
            optionsContainer.appendChild(optionBox);  
        });  
  
        // （可选）标记正确答案，这里以改变背景色为例  
        const correctOption = document.querySelector(`input[value='${答案}']`);  
        if (correctOption) {  
            const label = correctOption.closest('label');  
            label.style.backgroundColor = 'lightgreen';  
        }  
    })  
    .catch(error => console.error('Error loading data:', error));
