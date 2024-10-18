// summary.js

// 事件监听器
window.addEventListener('submitTimeEvent', async (event) => {
    const submitTime = event.detail.submitTime;
    console.log('接收到的提交时间:', submitTime);
    
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
        const response = await fetch(`http://localhost:5000/submission-all?username=${encodeURIComponent(username)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const submissions = await response.json();
        console.log('提交记录:', submissions);

        // 格式化数据
        console.log('正在格式化提交记录...');
       
        const formattedSubmissions = submissions.flatMap((submission) => {
            // 仅处理与 submitTime 匹配的提交
            if (submission.submitTime === submitTime) {
                return submission.userAnswers.map((answer) => ({
                    isCorrect: answer.isCorrect,
                    questionTitle: answer.questionTitle,
                    serialNumber: answer.iid 
                }));
            }
            return []; // 不匹配时返回空数组
        });

        console.log('格式化后的提交记录:', formattedSubmissions);

        // 发送到后端保存
        console.log('正在发送格式化后的数据到后端...');
        const saveResponse = await fetch('http://localhost:5000/summary-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedSubmissions),
        });

        if (saveResponse.ok) {
            console.log('数据成功保存到 everysummary.json！');
        } else {
            console.error('保存数据时出错:', saveResponse.status);
        }

    } catch (error) {
        console.error('获取提交记录时出错:', error);
    }

    window.location.href = `paper.html?submitTime=${encodeURIComponent(submitTime)}`;
});

// 监听 DOMContentLoaded 事件（可以在这里做一些初始化操作）
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 已完全加载');
    
});
