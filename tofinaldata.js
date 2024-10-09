document.getElementById('submissionForm').addEventListener('submit', async function(event) {
    const startTime = new Date(document.getElementById('startTime').value);
    const endTime = new Date(document.getElementById('endTime').value);
    const errorMessage = document.getElementById('error-message');

    // 清除之前的错误消息
    errorMessage.textContent = '';

    // 检查结束时间是否早于开始时间
    if (endTime < startTime) {
        event.preventDefault(); // 阻止表单提交
        errorMessage.textContent = '结束时间不能早于开始时间。'; // 显示错误消息
        return; // 退出函数
    }

    try {
        // 从 localStorage 获取用户名
        const username = localStorage.getItem('username');
        console.log('从 localStorage 获取的用户名:', username);

        if (!username) {
            console.error('未提供用户名');
            return;
        }

        // 向后端发送请求
        console.log('向后端发送请求...');
        const response = await fetch(`http://localhost:5000/ana?username=${encodeURIComponent(username)}&startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const filteredSubmissions = await response.json();
        console.log('筛选后的提交记录:', filteredSubmissions);

        // 在这里可以处理返回的提交记录，如显示在页面上
        // ...

    } catch (error) {
        console.error('获取提交记录时出错:', error);
        errorMessage.textContent = '获取提交记录时出错，请检查控制台。';
    }
});