document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('submission-time-container');
    
    // 从 localStorage 获取用户名
    const username = localStorage.getItem('username');
    console.log(username);
    try {
        console.log('尝试获取提交时间列表...');
        
        // 发送请求时附加用户名
        const response = await fetch(`http://localhost:5000/submission-times?username=${encodeURIComponent(username)}`);

        if (!response.ok) {
            console.error(`请求失败，状态码: ${response.status}`);
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const submissionTimes = await response.json();
        console.log('获取的提交时间列表:', submissionTimes);

        submissionTimes.reverse().forEach((time, index) => {
            const timeBox = document.createElement('div');
            timeBox.classList.add('submission-time-box');
            timeBox.textContent = `提交时间: ${new Date(time).toLocaleString()}`;
            
            // 添加点击事件
            timeBox.addEventListener('click', () => {
                const isoTime = new Date(time).toISOString();
                window.location.href = `paper.html?submitTime=${encodeURIComponent(isoTime)}`;
            });

            container.appendChild(timeBox);
            console.log(`添加提交时间盒子 ${index + 1}: ${time}`);
        });

        console.log('所有提交时间已成功添加到页面。');
    } catch (error) {
        console.error('获取提交时间时出错:', error);
        container.innerHTML = '<p>无法加载提交时间，请稍后再试。</p>';
    }
});
