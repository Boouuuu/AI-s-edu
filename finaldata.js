


/// 定义图表变量
var lineChart1 = echarts.init(document.getElementById('lineChart1'));
var barChart = echarts.init(document.getElementById('barChart'));
var wordCloud = echarts.init(document.getElementById('wordCloud'));
var lineChart2 = echarts.init(document.getElementById('lineChart2'));

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

        console.log('标题统计:', titleCounts);
        console.log('正确答案统计:', correctCounts);
        console.log('提交时间统计:', submissionTimes);
        console.log('问题类型统计:', questionTypeCounts);
        console.log('总题数统计:', questionTypeCounts['单选题']+questionTypeCounts['多选题']);

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

         /*计算单选与多选正确率
        const singleChoiceAccuracy = (questionTypeCounts['单选题'] > 0) ? (correctCounts['单选题'] / totalCounts['单选题']) * 100 : 0;
        const multipleChoiceAccuracy = (questionTypeCounts['多选题'] > 0) ? (correctCounts['多选题'] / totalCounts['多选题']) * 100 : 0;
        console.log('单选题正确率:', singleChoiceAccuracy);
        console.log('多选题正确率:', multipleChoiceAccuracy);
        generateQuestionTypeBarChart(singleChoiceAccuracy, multipleChoiceAccuracy);*/
    })
    .catch(error => console.error('读取数据时出错:', error));
function generateWordCloud(wordCloudData) {
    console.log("Word Cloud Data:", wordCloudData);  // 检查数据
    const wordCloudElement = document.getElementById('wordCloud');
    console.log("Word Cloud Element:", wordCloudElement); // 检查元素

    if (!wordCloudElement) {
        console.error("找不到词云图元素!");
        return;
    }

    // 测试颜色函数
    var testColor = function () {
        const colorValue = 'red'; // 或者随机颜色
        console.log("Color Function Called:", colorValue);
        return colorValue;
    };

    // 使用测试函数
    console.log("Directly Generated Color:", testColor());

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

    // 设置词云图
    const wordCloud = echarts.init(wordCloudElement); // 确保正确初始化
    wordCloud.setOption(wordOption);

    // 确认设置已执行
    console.log("词云图已设置");
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
            name: '用时 (分钟)',
            position: 'right'
        }],
        series: [{
            name: '正确数',
            data: submissionLineChartData.map(item => item.correctCount),
            type: 'line',
            smooth: true,
            yAxisIndex: 0
        }, {
            name: '用时',
            data: submissionLineChartData.map(item => {
                const timeParts = item.totalTime.split(':');
                return parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]); // 转换为秒
            }),
            type: 'line',
            smooth: true,
            yAxisIndex: 1
        }]
    };

    console.log('提交时间折线图配置:', submissionOption);

    // 设置提交时间折线图
    lineChart2.setOption(submissionOption);
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
    lineChart1.setOption(accuracyOption);
}


/*// 生成单选与多选正确率条形图的函数
function generateQuestionTypeBarChart(singleChoiceAccuracy, multipleChoiceAccuracy) {
    const barOption = {
        title: { text: '单选与多选正确率条形图' },
        xAxis: {
            type: 'category',
            data: ['单选题', '多选题']
        },
        yAxis: {
            type: 'value',
            name: '正确率 (%)'
        },
        series: [{
            data: [singleChoiceAccuracy, multipleChoiceAccuracy],
            type: 'bar'
        }]
    };

    // 设置条形图
    barChart.setOption(barOption);
}
*/

// 窗口大小改变时，重置报表大小
window.onresize = function() {
    lineChart1.resize();
    barChart.resize();
    wordCloud.resize();
    lineChart2.resize();
};
