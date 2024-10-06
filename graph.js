const topics = [
    "基础知识",
    "语言基础",
    "数据结构",
    "文件操作",
    "面向对象编程",
    "模块与包",
    "异常处理",
    "常用标准库",
    "网络编程",
    "数据库",
    "测试",
    "高级主题",
    "数据科学与机器学习",
    "项目实践",
    "资源与学习路径",
    // 添加子主题
    "Python 概述",
    "安装与环境配置",
    "基本语法",
    "控制结构",
    // ... 其他子主题
];

const edges = [
    ["基础知识", "Python 概述"],
    ["基础知识", "安装与环境配置"],
    ["语言基础", "基本语法"],
    ["语言基础", "控制结构"],
    // ... 其他边（根据实际需求添加）
];

// 构建数据结构
const data = {
    nodes: topics.map(topic => ({ id: topic })),
    links: edges.map(edge => ({ source: edge[0], target: edge[1] }))
};

// 设置 SVG 画布
const svg = d3.select('#graph'),
    width = +svg.attr('width'),
    height = +svg.attr('height');

// 创建力导向图
const simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink().id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2));

// 添加链接（有向边）
const link = svg.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(data.links)
    .enter().append('line')
    .attr('stroke-width', 2)
    .attr('stroke', 'gray')
    .attr('marker-end', 'url(#arrowhead)');  // 添加箭头

// 定义箭头
svg.append('defs').selectAll('marker')
    .data(['arrowhead']) // 唯一标识
    .enter().append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 15) // 箭头的偏移量
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5') // 箭头的形状
    .attr('fill', 'gray');

// 添加节点
const node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(data.nodes)
    .enter().append('circle')
    .attr('r', 5)
    .attr('fill', 'blue')
    .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

// 添加节点标签
node.append('title')
    .text(d => d.id);

// 更新节点和链接的位置
simulation.on('tick', () => {
    link.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    node.attr('cx', d => d.x)
        .attr('cy', d => d.y);
});

// 拖动事件
function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
}

function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
}

function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
}
