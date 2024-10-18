// 切换视图的功能
const toggleButton = document.getElementById('toggle-button');
const graphContainer = document.getElementById('graph-container');
const alternativeContainer = document.getElementById('alternative-container');

toggleButton.addEventListener('click', function() {
    if (graphContainer.style.display === 'none') {
        graphContainer.style.display = 'block';
        alternativeContainer.style.display = 'none';
    } else {
        graphContainer.style.display = 'none';
        alternativeContainer.style.display = 'block';
    }
});

// 在页面加载后加载 navbar.html
document.addEventListener("DOMContentLoaded", function() {
    fetch('navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络错误');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
        })
        .catch(error => {
            console.error('加载导航栏失败:', error);
        });
});

 // 处理提交记录
 var titleCounts = {};
 var correctCounts = {};
 var submissionTimes = {}; // 记录每个提交时间的正确答案数量和总时间

document.addEventListener('DOMContentLoaded', async () => {
    const username = localStorage.getItem('username');
    console.log(username);

    if (!username) {
        console.error('未找到用户名，请先登录。');
        const errorBox = document.createElement('div');
        errorBox.classList.add('submission-time-box');
        errorBox.textContent = '未找到用户名，请先登录。';
        container.appendChild(errorBox);
        return; // 提前退出
    }

    console.log('尝试获取提交记录列表...');
    const response = await fetch(`http://localhost:5000/fianlto?username=${encodeURIComponent(username)}`);

    if (!response.ok) {
        console.error(`请求失败，状态码: ${response.status}`);
        throw new Error(`HTTP错误: ${response.status}`);
    }

    const submissions = await response.json();
    console.log('获取的提交记录:', submissions);

    // 读取 finaldata.json 文件
    const dataResponse = await fetch('finaldata.json');
    if (!dataResponse.ok) {
        throw new Error(`无法读取数据，状态码: ${dataResponse.status}`);
    }
    
    const data = await dataResponse.json();
    console.log('读取的数据:', data);


    data.forEach(submission => {
        const date = new Date(submission.submitTime);
        const submitTime = date.toISOString().slice(0, 19).replace('T', ' ');

        submissionTimes[submitTime] = submissionTimes[submitTime] || { correctCount: 0, totalTime: submission.ttime };

        submission.userAnswers.forEach(answer => {
            const title = answer.questionTitle;
            const isCorrect = answer.isCorrect;

            titleCounts[title] = (titleCounts[title] || 0) + 1; // 统计总提交次数
            if (isCorrect) {
                correctCounts[title] = (correctCounts[title] || 0) + 1; // 统计正确答案次数
                submissionTimes[submitTime].correctCount++;
            }
        });
    });
});

    // 定义一个异步函数用于发送数据
    async function sendDataToServer() {
        // 准备发送到后端的数据
        const postData = {
            knowledge: Object.keys(titleCounts),  // 知识点列表
            titleCounts: titleCounts,  // 各知识点的尝试次数
            correctCounts: correctCounts  // 各知识点的正确次数
        };
        console.log(postData);
        
        // 使用 Axios 发送 POST 请求到后端以训练模型
        try {
            const response = await axios.post('http://127.0.0.1:5001/train', postData);
            console.log('成功:', response.data);  // 输出成功响应
        } catch (error) {
            console.error('错误:', error);  // 输出错误信息
        }
    }


document.addEventListener('DOMContentLoaded', function() {
    const url = './graph.json'; // 远程或本地文件的 URL

    fetch(url)
        .then(response => response.blob())  // 将文件内容作为 Blob 获取
        .then(blob => {
            const file = new File([blob], "graph.json", { type: 'application/json' });
            
            // 将 file 对象传递给 loaddata 函数
            loaddata(file);
            loadGraphData(file);
        })
        .catch(error => console.error('Error fetching file:', error));
});





document.getElementById('import-json-button').addEventListener('click', function() {
    // 创建一个文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json'; // 限制文件类型为 JSON

    // 监听文件选择事件
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            // 调用 loadGraphData 函数并传递选择的文件
            loaddata(file);
            loadGraphData(file);
        }
    });

    // 触发文件选择对话框
    fileInput.click();
});


function loaddata(file) {
    const reader = new FileReader();

    // 读取文件内容
    reader.onload = function(event) {
        const jsonData = event.target.result;
        try {
            const parsedData = JSON.parse(jsonData);
            console.log(parsedData);
            // 发送数据到 Flask 后端
            sendDataToFlask(parsedData);
            sendDataToServer(); // 调用发送数据的函数
        } catch (error) {
            console.error('无效的 JSON 文件:', error);
        }
    };

    // 读取文件为文本
    reader.readAsText(file);
}

function sendDataToFlask(data) {
    // 使用 Axios 发送 POST 请求
    axios.post('http://127.0.0.1:5001/gatdata', data)
        .then(function (response) {
            console.log('成功:', response.data);
            // 在这里处理返回的数据
        })
        .catch(function (error) {
            console.error('错误:', error);
        });
}



// 声明全局变量 nodes 和 links
let nodes = [];
let links = [];
// 定义全局变量，用于保存当前节点的名字
var currentnode="Python";

async function loadGraphData(file) {
    try {
        // 使用 FileReader 读取文件内容
        const reader = new FileReader();
        reader.onload = function(e) {
            const jsonData = JSON.parse(e.target.result);
            // 提取 nodes 和 links 数组
        nodes = jsonData.nodes;
        links = jsonData.links;

            // 这里可以处理 JSON 数据，例如更新 nodes 和 links 数组
            console.log('导入的 JSON 数据:',nodes);

            // 假设你有一个函数 updateGraph 来更新图表
            updateGraph(jsonData);
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('读取文件时出错:', error);
    }}


// 定义一个异步函数来确保 loadGraphData 完成后再执行后续操作
async function updateGraph() {
  
const width = window.innerWidth; // 获取当前窗口宽度
const height = window.innerHeight; // 获取当前窗口高度

console.log(width);


const svg = d3.select("#graph-svg")
    .html('') 
    .attr("viewBox", `0 0 ${width} ${height}`)
    .call(d3.zoom().on("zoom", (event) => {
        svg.attr("transform", event.transform);
    }))
    .append("g");


// 设置默认中心坐标
const initCenter = { x: width / 2, y: height / 2 };

// 在创建仿真之前，设置 "Python" 的固定位置和颜色
nodes.forEach(node => {
    if (node.id === "Python") {
        node.fx = initCenter.x; // 固定位置为中心
        node.fy = initCenter.y; // 固定位置为中心
    }
});




const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink().id(d => d.id).distance(80))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(initCenter.x, initCenter.y));

// 连接线
const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("class", "link");

// 节点
const node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node");

// 节点圆圈
node.append("circle")
    .attr("r", d => d.important ? 25 : 20) //大小
    .attr("fill", d => d.id === "Python" ? "#ff9999" : (d.important ? "#b8e9f8" : "#b8e9f8")); // 设置 "Python" 为浅红色

// 节点文本
node.append("text")
    .text(d => d.id)
    .attr("dy", 4)
    .attr("text-anchor", "middle")
    .attr("fill", "#000")
    .attr("font-size", "13px"); // 设置字体大小

// 处理窗口调整事件
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
    simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
    simulation.alpha(1).restart(); // 重新启动仿真
});

// 更新节点和链接的位置
simulation
    .nodes(nodes)
    .on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

simulation.force("link").links(links);



// 处理点击事件
node.on("click", function(event, d) {

    nodes.forEach(n => {
        n.fx = null; // 清除上一个中心节点的fx
        n.fy = null; // 清除上一个中心节点的fy
    });

    currentnode = d.id; 
    console.log(currentnode); 

    const targetX = initCenter.x; // 页面中心X坐标
    const targetY = initCenter.y; // 页面中心Y坐标

    // 设置点击节点的新位置
    d.fx = targetX;
    d.fy = targetY;


    // 更新仿真
    simulation.alpha(1).restart();

    // 让其他节点随着点击的节点移动
    simulation.force("center", d3.forceCenter(targetX, targetY));



    console.log(width);
    // 计算视口中心
    const offsetX = width / 2 - targetX;
    const offsetY = height / 2 - targetY;

    // 移动 SVG
    svg.transition()
        .duration(500)
        .call(d3.zoom().transform, d3.zoomIdentity.translate(offsetX, offsetY));


    // 过渡效果
    d3.select(this).select("circle").transition()
        .duration(500)
        .attr("r", d.important ? 40 : 30)
        .transition()
        .duration(500)
        .attr("r", d.important ? 30 : 20);

     // 设置中心节点颜色为浅红色
     d3.select(this).select("circle").attr("fill", "#ff9999");
    
     // 清除其他节点的颜色
     node.select("circle").filter(n => n !== d)
         .attr("fill", n => n.important ? "#b8e9f8" : "#b8e9f8");
});
// 更新节点和链接的位置
simulation
    .nodes(nodes)
    .on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

simulation.force("link").links(links);

/// 搜索功能
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");

searchButton.addEventListener("mouseover", () => {
    searchInput.style.display = "inline"; // 鼠标悬停时显示输入框
    setTimeout(() => {
        searchInput.classList.add("active");
        searchInput.focus();
    }, 10);
});

searchButton.addEventListener("mouseout", () => {
    if (!searchInput.value) {
        searchInput.classList.remove("active");
        setTimeout(() => {
            searchInput.style.display = "none";
        }, 300);
    }
});

// 点击搜索按钮的事件
searchButton.addEventListener("click", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    // 如果搜索框为空，直接返回
    if (!searchTerm) {
        return; // 不进行任何操作
    }

    // 清除之前的高亮
    node.select("circle").attr("fill", d => d.important ? "#b8e9f8" : "#b8e9f8");
    node.select("text").attr("fill", "#000000");

    // 重置所有节点的固定位置
    nodes.forEach(n => {
        n.fx = null;
        n.fy = null;
    });

    // 根据搜索内容高亮显示节点并移动视图
    let found = false;
    node.each(function(d) {
        if (d.id.toLowerCase().includes(searchTerm)) {
            found = true;

            d3.select(this).select("circle").attr("fill", "#ff9999"); // 浅红色

            // 将匹配节点的固定位置设置为中心
            d.fx = initialCenter.x;
            d.fy = initialCenter.y;

            // 添加过渡效果
            d3.select(this).transition()
                .duration(500)
                .attr("transform", `translate(${initialCenter.x}, ${initialCenter.y})`);
        }
    });

    // 如果找到了匹配节点，更新仿真
    if (found) {
        simulation.alpha(1).restart();
    }
});

// 清空搜索框时恢复节点颜色
searchInput.addEventListener("input", () => {
    if (searchInput.value === "") {
        node.select("circle").attr("fill", d => d.important ? "#b8e9f8" : "#b8e9f8");
        // 这里可以恢复其他状态，比如隐藏搜索框
        searchInput.classList.remove("active");
        setTimeout(() => {
            searchInput.style.display = "none";
        }, 300);
    }
});

// 处理点击事件，收缩搜索框
searchButton.addEventListener("click", () => {
    searchInput.classList.remove("active"); // 点击后收缩搜索框
    setTimeout(() => {
        searchInput.style.display = "none"; // 确保在过渡结束后隐藏
    }, 300);
});
}


    // 定义主函数，用于处理按钮点击事件
    document.getElementById('toggle-button').addEventListener('click', function() {
        if (currentnode) {
            sendCoreKnowledgePoint(currentnode);
            fetchRecommendedPaths(); // 调用获取推荐路径的函数
        } else {
            console.error("currentnode is not defined."); // 如果没有定义，输出错误
        }
    });



// 定义发送核心知识点的函数
function sendCoreKnowledgePoint(currentnode) {
    console.log(currentnode);
    const formData = new FormData();  // 创建一个 FormData 对象
    formData.append('core_knowledge_point', currentnode);  // 将核心知识点加入表单数据

    // 使用 axios 发送 POST 请求到后端
    axios.post('http://127.0.0.1:5001/gatcenter', formData)
        .then(function(response) {
            // 处理后端返回的推荐学习路径数据
            const recommendedPaths=response.data.recommended_learning_paths;
            console.log('推荐路径:', response.data.recommended_learning_paths);
            processPaths(recommendedPaths) ;
            // 在这里可以进一步处理推荐路径，比如更新前端界面展示推荐的内容
        })
        .catch(function(error) {
            console.error('请求失败:', error);
        });
}

/*

// 定义获取个性化推荐数据的函数
function fetchRecommendedPaths() {
    axios.get('http://127.0.0.1:5001/gatrespond')
        .then(function(response) {
            if (response.data) {
                const recommendedPaths = response.data; // 获取推荐的学习路径数据
                console.log('个性化推荐路径:', recommendedPaths);
                processPaths(recommendedPaths); // 调用处理数据的函数
            } else {
                console.error('响应数据为空');
            }
        })
        .catch(function(error) {
            console.error('获取个性化数据失败:', error);
        });
}
*/



        // 定义处理数据并绘制图形的函数
        function processPaths(recommendedPaths) {
            // 清空原本的SVG内容
            d3.select("#alternative-container").select("svg").remove(); // 清空之前的SVG
            console.log('推荐路径数据:', recommendedPaths); // 打印数据查看格式

            // 使用 Flask 作为核心节点
            const coreNode = {};
            coreNode.id=currentnode;

            // 根据相似度构建节点
            const nodes = recommendedPaths.map(d => ({
                id: d.knowledge_point, // 使用知识点作为节点 ID
                similarity: d.similarity // 相似度存储，但在绘制中不需要用到
            }));

            // 将核心节点添加到节点数组
            nodes.unshift(coreNode);

            // 检查 nodes 的结构
            console.log('节点数据:', nodes); // 打印节点数据查看格式

            // 根据节点的相似度构建边（连线）
            const links = recommendedPaths.map(d => ({
                source: coreNode.id,
                target: d.knowledge_point,
                length: 1 / (1 - d.similarity) * 1000 // 放大差异比例，增加节点之间的距离
            }));

            // 检查 links 的结构
            console.log('连线数据:', links); // 打印连线数据查看格式

            // 获取备用内容容器中的SVG画布
            const svg = d3.select("#alternative-container").append("svg")
                .attr("width", 800)
                .attr("height", 600)
                .call(d3.zoom().on("zoom", function(event) {
                    svgGroup.attr("transform", event.transform); // 移动和缩放
                }));

            // 创建一个组元素，用于放置节点和连线
            const svgGroup = svg.append("g");

            // 创建力导向图模拟
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink().distance(d => {
                    const link = links.find(l => l.target === d.id);
                    return link ? link.length : 50; // 增加默认距离
                }).id(d => d.id))
                .force("charge", d3.forceManyBody().strength(-3000)) // 增加节点之间的斥力
                .force("center", d3.forceCenter(800 / 2, 600 / 2)); // 800 和 600 是 SVG 的宽和高

            // 绘制连线
            const link = svgGroup.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(links)
                .enter().append("line")
                .attr("class", "link");

            // 绘制节点
            const nodeGroup = svgGroup.append("g")
                .attr("class", "nodes")
                .selectAll("g")
                .data(nodes)
                .enter().append("g")
                .attr("class", "node");

            // 节点圆圈
            nodeGroup.append("circle")
                .attr("class", "node")
                .attr("r", d => d.id === 'Flask' ? 25 : 20) // 核心节点大一点，其他节点稍小
                .attr("fill", d => {
                    // 根据相似度设置节点颜色
                    if (d.id === currentnode) {
                        return "#ff9999"; // 核心节点浅红色
                    } else if (d.similarity && d.similarity >= 0.999999) {
                        return "#FFA07A"; // 相似度在 0.995 内的节点橙色
                    } else {
                        return "#ADD8E6"; // 其他节点蓝色
                    }
                });

            // 节点文本
            nodeGroup.append("text")
                .text(d => d.id) // 显示知识点中文名字
                .attr("dy", 4) // 垂直位置调整
                .attr("text-anchor", "middle")
                .attr("fill", "#000")
                .attr("font-size", "12px"); // 设置字体大小

            // 启动模拟
            simulation
                .nodes(nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(links);

            // 定义每个tick的行为
            function ticked() {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                nodeGroup
                    .attr("transform", d => `translate(${d.x}, ${d.y})`); // 更新节点位置
            }


        // 处理节点点击的函数
        function NodeClick(node) {
        // 固定核心节点位置
        const coreNodeIndex = nodes.findIndex(n => n.id === 'Flask');
        const coreNode = nodes[coreNodeIndex];

        coreNode.fx = coreNode.x; // 固定核心节点X位置
        coreNode.fy = coreNode.y; // 固定核心节点Y位置

        // 增大与其他节点的斥力
        const originalStrength = -2000; // 原始斥力
        const increasedStrength = -5000; // 增强的斥力

        simulation.force("charge").strength(increasedStrength);
        simulation.alpha(1).restart(); // 重新启动模拟

        // 恢复原状
        setTimeout(() => {
            coreNode.fx = null; // 释放核心节点的位置
            simulation.force("charge").strength(originalStrength); // 恢复原始斥力
            simulation.alpha(1).restart(); // 重新启动模拟
        }, 3000);
    }
}

