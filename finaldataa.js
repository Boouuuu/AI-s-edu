// ECharts 实例化示例
var chart1 = echarts.init(document.querySelector('.chart1'));
var chart2 = echarts.init(document.querySelector('.chart2'));
var wordcloud = echarts.init(document.querySelector('.wordcloud'));
var barChart = echarts.init(document.querySelector('.barChart'));

// 读取 finaldata.json 文件
fetch('finaldata.json')
    .then(response => response.json())
    .then(data => {
        console.log('读取的数据:', data);

        const titleCounts = {};
        const correctCounts = {};
        const submissionTimes = {};
        const questionTypeCounts = { 单选题: 0, 多选题: 0 };
        const TypeCounts = { 单选题: 0, 多选题: 0 };

        // 遍历数据
        data.forEach(submission => {
            const date = new Date(submission.submitTime);
            const submitTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
            // 提取可读的日期和时间
            submissionTimes[submitTime] = submissionTimes[submitTime] || { correctCount: 0, totalTime: submission.ttime };
            
            submission.userAnswers.forEach(answer => {
                const title = answer.questionTitle;
                const isCorrect = answer.isCorrect;

                // 统计标题出现次数
                titleCounts[title] = (titleCounts[title] || 0) + 1;

                // 统计正确答案的数量
                if (isCorrect) {
                    correctCounts[title] = (correctCounts[title] || 0) + 1;
                    submissionTimes[submitTime].correctCount++;
                }

                // 统计问题类型
                const questionType = answer.questionType;
                if (questionType === "单选题") {
                    questionTypeCounts['单选题']++;
                    // 统计正确答案的数量
                    if (isCorrect) {
                        TypeCounts['单选题']++;
                }
                } else if (questionType === "多选题") {
                    questionTypeCounts['多选题']++;
                    // 统计正确答案的数量
                    if (isCorrect) {
                        TypeCounts['多选题']++;
                }

            }
        });
    });

     // 计算条形图正确率
    const totalQuestions = questionTypeCounts['单选题'] + questionTypeCounts['多选题'];
    const singleChoiceAccuracy = (TypeCounts['单选题'] / questionTypeCounts['单选题']) * 100 || 0; // 避免除以零
    const multipleChoiceAccuracy = (TypeCounts['多选题'] / questionTypeCounts['多选题']) * 100 || 0; // 避免除以零
       

    console.log('单选正确率:', TypeCounts['单选题']);
   console.log('多选正确:', TypeCounts['多选题']);
    

        console.log('标题统计:', titleCounts);
        console.log('正确答案统计:', correctCounts);
        console.log('提交时间统计:', submissionTimes);
        console.log('问题类型统计:', questionTypeCounts);
        console.log('总题数统计:', totalQuestions);


    // 调用生成条形图的函数
    generateQuestionTypeBarChart(singleChoiceAccuracy, multipleChoiceAccuracy);

        const submissionTimeKeys = Object.keys(submissionTimes);
        const earliestSubmission = new Date(submissionTimeKeys[0]);
        const latestSubmission = new Date(submissionTimeKeys[submissionTimeKeys.length - 1]);
        // 格式化时间为可读格式
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const formattedEarliest = earliestSubmission.toLocaleString('zh-CN', options);
        const formattedLatest = latestSubmission.toLocaleString('zh-CN', options);
        // 将时间戳插入到对应部分
        const timestampBox = document.querySelector('.timestamp');
        timestampBox.innerHTML = ` 回溯时间：${formattedEarliest}<br> 当前时间：${formattedLatest}`;
        
        
        const scrollingContainer = document.getElementById('scrolling-container');

        // 示例内容
        const content = [
            "这里是滚动内容1",
            "这里是滚动内容2",
            "这里是滚动内容3",
            "这里是滚动内容4",
            "这里是滚动内容5",
            "这里是滚动内容6",
            "这里是滚动内容7",
            "这里是滚动内容8"
        ];

        // 填充内容
        function fillContent() {
            content.forEach(text => {
                // 创建一个新的 div 作为框
                const box = document.createElement('div');
                box.classList.add('content-box'); // 添加类名以便于样式设置

                // 创建一个 p 元素并填充文本
                const p = document.createElement('p');
                p.textContent = text;

                // 将 p 元素添加到框中
                box.appendChild(p);

                // 将框添加到滚动容器中
                scrollingContainer.appendChild(box);
            });

            // 复制内容以实现循环效果
            content.forEach(text => {
                const box = document.createElement('div');
                box.classList.add('content-box');

                const p = document.createElement('p');
                p.textContent = text;

                box.appendChild(p);
                scrollingContainer.appendChild(box);
            });
        }

        fillContent();

        
        
        
        // 生成词云图数据
        const wordCloudData = Object.keys(titleCounts).map(title => ({
            name: title,
            value: titleCounts[title]
        }));
        generateWordCloud(wordCloudData);
        console.log(wordCloudData);
        console.log("成功");

     // 生成正确率数据
        const accuracyData = Object.keys(titleCounts).map(title => {
            const total = titleCounts[title];
            const correct = correctCounts[title] || 0;
            return {
                title: title,
                accuracy: (correct / total) * 100 // 转换为百分比
            };
        });
        console.log('正确率数据:', accuracyData);
        generateAccuracyLineChart(accuracyData);

       // 生成提交时间折线图数据
        const submissionLineChartData = Object.keys(submissionTimes).map(date => ({
            date: date,
            correctCount: submissionTimes[date].correctCount,
            totalTime: submissionTimes[date].totalTime
        }));
        console.log('提交时间折线图数据:', submissionLineChartData);
        generateSubmissionTimeLineChart(submissionLineChartData);
    })
    .catch(error => console.error('读取数据时出错:', error));








function generateWordCloud(wordCloudData) {
    console.log("Word Cloud Data:", wordCloudData);  // 检查数据
    
    var wordOption = {
        title: { text: '词云图' },
        series: [{
            type: 'wordCloud',
            gridSize: 18,
            sizeRange: [12, 60],
            textStyle: {
                normal: {
                    color: function () {
                        return testColor(); // 使用测试颜色函数
                    }
                },
                emphasis: { shadowBlur: 10, shadowColor: '#333' }
            },
            data: wordCloudData
        }]
    };

    // 输出配置
    console.log("Word Cloud Option:", wordOption); 

    wordcloud.setOption(wordOption);

    // 确认设置已执行
    console.log("词云图已设置");
}



// 生成单选与多选正确率条形图的函数
function generateQuestionTypeBarChart(singleChoiceAccuracy, multipleChoiceAccuracy) {
    const barOption = {
        title: { text: '题型正确率条形图' },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}%'
        },
        xAxis: {
            type: 'category',
            data: ['单选题', '多选题']
        },
        yAxis: {
            type: 'value',
            name: '正确率 (%)',
            min: 0,
            max: 100
        },
        series: [{
            name: '单选题',
            data: [singleChoiceAccuracy],
            type: 'bar',
            itemStyle: {
                color: '#4CAF50' // 单选题颜色
            }
        }, {
            name: '多选题',
            data: [multipleChoiceAccuracy],
            type: 'bar',
            itemStyle: {
                color: '#FF7F7F' // 多选题颜色
            }
        }],
        barCategoryGap: '50%', // 控制类别之间的间隔，调整以实现居中对齐
    };

    // 设置条形图
    barChart.setOption(barOption);
}












function generateSubmissionTimeLineChart(submissionLineChartData) {
    console.log('提交时间折线图:', submissionLineChartData);

    const submissionOption = {
        title: { text: '提交时间折线图' },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                const point1 = params[0];
                const point2 = params[1];
                return `${point1.name}<br />正确数: ${point1.data}<br />用时: ${point2.data}`;
            }
        },
        xAxis: {
            type: 'category',
            data: submissionLineChartData.map(item => item.date),
            axisLabel: {
                rotate: 45,
                align: 'right'
            }
        },
        yAxis: [{
            type: 'value',
            name: '正确数',
            position: 'left'
        }, {
            type: 'value',
            name: '用时 (秒)',
            position: 'right'
        }],
        series: [{
            name: '正确数',
            data: submissionLineChartData.map(item => item.correctCount),
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            itemStyle: {
                color: '#FF7F7F' 
            }
        }, {
            name: '用时',
            data: submissionLineChartData.map(item => {
                const timeParts = item.totalTime.split(':');
                return parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]); // 转换为秒
            }),
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            itemStyle: {
                color: '#4CAF50' // 设置折线颜色为绿色
            }
        }]
    };

    console.log('提交时间折线图配置:', submissionOption);

    // 设置提交时间折线图
    chart2.setOption(submissionOption);
}



function generateAccuracyLineChart(accuracyData) {
    const accuracyOption = {
        title: { text: '类型正确率折线图' },
        tooltip: {
            trigger: 'axis', // 触发类型为轴
            formatter: function (params) {
                const point = params[0]; // 获取第一个数据点
                return `${point.name}<br />正确率: ${point.data}%`;
            }
        },
        xAxis: {
            type: 'category',
            data: accuracyData.map(item => item.title),
            axisLabel: {
                rotate: 45, // 旋转角度
                align: 'right' // 右对齐
            }
        },
        yAxis: {
            type: 'value',
            name: '正确率 (%)'
        },
        series: [{
            data: accuracyData.map(item => item.accuracy),
            type: 'line',
            smooth: true
        }]
    };

    // 设置正确率折线图
    chart1.setOption(accuracyOption);
}


// 窗口大小改变时，重置报表大小
window.onresize = function() {
    chart1.resize();
    chart2.resize();
    wordcloud.resize();
    barChart.resize();
};











