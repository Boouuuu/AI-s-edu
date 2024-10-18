setTimeout(function() {
    document.querySelectorAll('.greeting').forEach(function(element) {
      element.classList.add('faded-out');
    });
    document.querySelector('.description').classList.add('faded-out');
  }, 8000);

  

let bubbleCount = 0; // 记录气泡数量

function showBubble() {
    const bubbleContainer = document.getElementById('bubble-container');

    if (!bubbleContainer) {
        console.error('Bubble container not found!');
        return; // 如果没有找到容器，则退出
    }

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    // 显示什么内容改这！！！
    chrome.runtime.sendMessage({message:'Real_time_monitoring'},(response)=>{
        if (response && response.Data) {  
            bubble.innerHTML = marked(response.Data);  
        } else {  
            console.error('响应不存在或格式不正确', response);  
        }
    })

    // 将气泡添加到容器中
    bubbleContainer.appendChild(bubble);

    // 每次出现新的气泡时，气泡数量增加
    bubbleCount++;

    // 使用 setTimeout 显示气泡并淡入
    
        bubble.classList.add('show'); // 添加 show 类来触发动画
        // for (let i = 0; i < 4; i++) {
        //     const span = document.createElement('span');
        //     // 设置 span 的内容或样式，如果需要的话
        //     bubble.appendChild(span);
        // }
    //}, 10); // 确保 DOM 已更新后再进行显示

    // 检查是否超出页面边界并自动滚动
    const bubbleHeight = bubble.offsetHeight; // 获取气泡高度
    const newBubblePosition = bubbleCount * (bubbleHeight + 10); // 计算新气泡的位置

    // 如果新气泡超出容器高度，则自动滚动
    if (newBubblePosition > bubbleContainer.scrollTop + bubbleContainer.clientHeight) {
        bubbleContainer.scrollTop = newBubblePosition - bubbleContainer.clientHeight + bubbleHeight; // 滚动到新气泡位置
    }
}

// 使用 DOMContentLoaded 确保 DOM 已完全加载
document.addEventListener('DOMContentLoaded', () => {
    

    // 识别改这里！！我这里是每隔一段时间就给提示
    
    showBubble(); // 在页面加载后立即显示气泡
    // 每 5 秒显示一次气泡（5000 毫秒）
    setInterval(showBubble, 90000);
});

// 导航栏
fetch('navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar').innerHTML = data;
  });
