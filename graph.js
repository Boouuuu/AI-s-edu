const nodes = [  
    { id: "Python", important: true },  
    { id: "基础语法", important: false },  
    { id: "数据类型", important: false },  
    { id: "变量与常量", important: false },  
    { id: "运算符与表达式", important: false },  
    { id: "控制结构", important: false },  
    { id: "数据结构", important: false },  
    { id: "列表与元组", important: false },  
    { id: "字典与集合", important: false },  
    { id: "面向对象", important: true },  
    { id: "类与对象", important: false },  
    { id: "继承与多态", important: false },  
    { id: "封装与抽象", important: false },  
    { id: "常用库", important: true },  
    { id: "标准库", important: false },  
    { id: "第三方库", important: false },  
    { id: "Flask", important: false },  
    { id: "Django", important: false },  
    { id: "数据分析", important: false },  
    { id: "NumPy", important: false },  
    { id: "Pandas", important: false },  
    { id: "机器学习", important: true },  
    { id: "Scikit-learn", important: false },  
    { id: "TensorFlow", important: false },  
    { id: "函数式编程", important: false },  
    { id: "Lambda表达式", important: false },  
    { id: "高阶函数", important: false },  
    { id: "闭包与装饰器", important: false },  
    { id: "模块与包", important: false },  
    { id: "异常处理", important: false },  
    { id: "文件操作", important: false },  
    { id: "I/O操作", important: false },  
    { id: "正则表达式", important: false },  
    { id: "多线程与多进程", important: false },
    { id: "基础知识", important: true }    
];

const links = [
    { source: "基础语法", target: "基础知识" },
    { source: "数据类型", target: "基础知识" },
    { source: "变量与常量", target: "基础知识" },
    { source: "运算符与表达式", target: "基础知识" },
    { source: "控制结构", target: "基础知识" },
    { source: "数据结构", target: "基础知识" },
    { source: "列表与元组", target: "数据结构" },
    { source: "字典与集合", target: "数据结构" },
    { source: "类与对象", target: "面向对象" },
    { source: "继承与多态", target: "面向对象" },
    { source: "封装与抽象", target: "面向对象" },
    { source: "标准库", target: "常用库" },
    { source: "第三方库", target: "常用库" },
    { source: "Flask", target: "常用库" },
    { source: "Django", target: "常用库" },
    { source: "NumPy", target: "数据分析" },
    { source: "Pandas", target: "数据分析" },
    { source: "Scikit-learn", target: "机器学习" },
    { source: "TensorFlow", target: "机器学习" },
    { source: "Lambda表达式", target: "函数式编程" },
    { source: "高阶函数", target: "函数式编程" },
    { source: "闭包与装饰器", target: "函数式编程" },
    { source: "模块与包", target: "Python" },
    { source: "异常处理", target: "Python" },
    { source: "文件操作", target: "Python" },
    { source: "I/O操作", target: "文件操作" },
    { source: "正则表达式", target: "基础知识" },
    { source: "多线程与多进程", target: "Python" },
    { source: "常用库", target: "Python" },
    { source: "面向对象", target: "Python" },
    { source: "函数式编程", target: "Python" },
    { source: "机器学习", target: "Python" },
    { source: "数据分析", target: "Python" },
    { source: "基础知识", target: "Python" },
];

const width = window.innerWidth; // 获取当前窗口宽度
const height = window.innerHeight; // 获取当前窗口高度

const svg = d3.select("#graph-svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .call(d3.zoom().on("zoom", (event) => {
        svg.attr("transform", event.transform);
    }))
    .append("g");


// 设置默认中心坐标
const initialCenter = { x: width / 2, y: height / 2 };

// 在创建仿真之前，设置 "Python" 的固定位置和颜色
nodes.forEach(node => {
    if (node.id === "Python") {
        node.fx = initialCenter.x; // 固定位置为中心
        node.fy = initialCenter.y; // 固定位置为中心
    }
});




const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink().id(d => d.id).distance(110))
    .force("charge", d3.forceManyBody().strength(-800))
    .force("center", d3.forceCenter(initialCenter.x, initialCenter.y));

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
    .attr("r", d => d.important ? 25 : 20)
    .attr("fill", d => d.id === "Python" ? "#ff9999" : (d.important ? "#b8e9f8" : "#b8e9f8")); // 设置 "Python" 为浅红色

// 节点文本
node.append("text")
    .text(d => d.id)
    .attr("dy", 4)
    .attr("text-anchor", "middle")
    .attr("fill", "#000");

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


    const targetX = initialCenter.x; // 页面中心X坐标
    const targetY = initialCenter.y; // 页面中心Y坐标

    // 设置点击节点的新位置
    d.fx = targetX;
    d.fy = targetY;

    // 更新仿真
    simulation.alpha(1).restart();

    // 让其他节点随着点击的节点移动
    simulation.force("center", d3.forceCenter(targetX, targetY));

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

// 搜索功能
const searchInput = d3.select("#search-input");
const searchButton = d3.select("#search-button");

// 搜索功能
searchButton.on("click", () => {
    const searchTerm = searchInput.property("value").toLowerCase();

     // 如果搜索框为空，直接返回
     if (!searchTerm) {
        return; // 不进行任何操作
    }

    // 清除之前的高亮
    node.select("circle")
        .attr("fill", d => d.important ? "#b8e9f8" : "#b8e9f8");

    node.select("text")
        .attr("fill", "#000000");

    // 重置所有节点的固定位置
    nodes.forEach(n => {
        n.fx = null; // 清除上一个中心节点的fx
        n.fy = null; // 清除上一个中心节点的fy
    });

    // 根据搜索内容高亮显示节点并移动视图
    let found = false; // 标记是否找到匹配的节点
    node.each(function(d) {
        if (d.id.toLowerCase().includes(searchTerm)) {
            found = true; // 找到匹配的节点

            d3.select(this).select("circle")
                .attr("fill", "#ff9999"); // 浅红色

            // 将匹配节点的固定位置设置为中心
            d.fx = initialCenter.x; // 页面中心X坐标
            d.fy = initialCenter.y; // 页面中心Y坐标
            
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
searchInput.on("input", () => {
    if (searchInput.property("value") === "") {
        node.select("circle")
            .attr("fill", d => d.important ? "#b8e9f8" : "#b8e9f8");
    }
});
