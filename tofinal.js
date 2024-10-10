document.addEventListener('DOMContentLoaded', () => {
    const errorMessage = document.getElementById('errorMessage');
    const generateButton = document.getElementById('generateButton');

    generateButton.addEventListener('click', async () => {
        try {
            // 从 localStorage 获取用户名
            const username = localStorage.getItem('username');
            console.log('从 localStorage 获取的用户名:', username);

            if (!username) {
                console.error('未提供用户名');
                errorMessage.textContent = '未提供用户名';
                return;
            }

            // 向后端发送请求
            console.log('向后端发送请求...');
            const response = await fetch(`http://localhost:5000/ana?username=${encodeURIComponent(username)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const filteredSubmissions = await response.json();
            console.log('筛选后的提交记录:', filteredSubmissions);

            // 在这里可以处理返回的提交记录，如显示在页面上
            // ...
            window.location.href = 'finaldataa.html';

        } catch (error) {
            console.error('获取提交记录时出错:', error);
            errorMessage.textContent = '获取提交记录时出错，请检查控制台。';
        }
    });
});
