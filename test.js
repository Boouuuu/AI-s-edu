 
document.addEventListener('DOMContentLoaded', function() {  
    const menuitems = document.querySelectorAll('.menu-content span');  
    const contentBox = document.querySelector('.content-box');  
  
    menuitems.forEach(item => {  
        item.addEventListener('click', function() {  
            const pageType = this.getAttribute('data-page');  
            const url = `${pageType}.html`; // 假设 HTML 文件与主文件在同一目录下  
  
            fetch(url)  
                .then(response => {  
                    if (!response.ok) {  
                        throw new Error('网络响应错误');  
                    }  
                    return response.text(); // 获取 HTML 文本  
                })  
                .then(html => {  
                    contentBox.innerHTML = html; // 设置加载的HTML内容

                    const script = document.createElement('script');  
                    script.src = 'quiz.js'; // 加载quiz.js  
                    script.onload = () => {  
                        console.log('quiz.js加载成功'); // 成功加载的提示  
                    };  
                    script.onerror = () => {  
                        console.error('加载quiz.js失败'); // 加载失败的提示  
                    };  
                    contentBox.appendChild(script); // 将脚本添加到contentBox中  
                })  
                .catch(error => {  
                    console.error('加载内容时发生错误:', error);  
                    // 可以设置一些错误处理的内容  
                    contentBox.innerHTML = '<p>加载内容失败，请重试。</p>';  
                });  
        });  
    });  
});  


let menuItems = document.getElementsByClassName("menu-item-hasChild");
let items = document.getElementsByClassName("menu-first-items");
let noChildItem = document.getElementsByClassName('menu-no-child');
let icons = document.getElementsByClassName("icon");

/** 记录当前打开的一级菜单是哪个 没有打开任何菜单的状态 默认为-1 */
let currentDisplayIndex = -1;

for (let i = 0; i < menuItems.length; i++) {
    menuItems[i].onclick = function () {
        /** 再次点击已打开的菜单，关闭此菜单 */
        if (currentDisplayIndex === i) {
            items[currentDisplayIndex].classList.toggle("ul-active");
            icons[currentDisplayIndex].classList.toggle("reverse-icon");
            menuItems[currentDisplayIndex].classList.toggle('bg-color');
            currentDisplayIndex = -1
            return;
        }

        /** 关闭前一个被打开的菜单 打开当前要打开的菜单 */
        if (currentDisplayIndex != -1) {
            items[currentDisplayIndex].classList.toggle("ul-active");
            icons[currentDisplayIndex].classList.toggle("reverse-icon");
            menuItems[currentDisplayIndex].classList.toggle('bg-color');

            items[i].classList.toggle("ul-active");
            icons[i].classList.toggle("reverse-icon");
            menuItems[i].classList.toggle('bg-color');
        }
        /** 没有任何菜单被打开时 打开新菜单 */
        else{
            items[i].classList.toggle("ul-active");
            icons[i].classList.toggle("reverse-icon");
            menuItems[i].classList.toggle('bg-color');
        }

        // 清除没有下一级列表的菜单的背景
        if(currentDisplayIndex === -1){
            for(let e of noChildItem){
                if(e.classList.contains('bg-color')){
                    e.classList.toggle('bg-color');
                }
            }
        }
        
        currentDisplayIndex = i;   
    };
}

// 当没有子菜单的菜单被点击
for(let e of noChildItem){
    e.addEventListener('click',()=>{
        // 处理非同类菜单
        for(let i = 0 ; i < items.length ; i ++){
            if(items[i].classList.contains('ul-active')){
                items[i].classList.toggle('ul-active');
                icons[i].classList.toggle('reverse-icon');
                menuItems[i].classList.toggle('bg-color');
            }
        }
        // 去除其他同类子菜单的背景色
        for(let i = 0 ; i < noChildItem.length ; i ++){
            if(noChildItem[i].classList.contains('bg-color')){
                noChildItem[i].classList.toggle('bg-color');
            }
        }
        // 为自己添加背景色
        e.classList.toggle('bg-color');
        currentDisplayIndex = -1;
    })
}

// 导航栏的显现与隐藏
let OC = document.getElementsByClassName("open-close")[0];
let menu = document.getElementsByClassName("left-menu")[0];
OC.onclick = function () {
    OC.classList.toggle("reverse-condition");
    menu.classList.toggle("hide-menu");
};



