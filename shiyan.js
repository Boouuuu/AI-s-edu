function showPage(page) {
    const iframes = document.querySelectorAll('.quiz-box iframe');
    iframes.forEach(iframe => {
        iframe.style.display = 'none';
    });

    const iframeToShow = document.getElementById(page + '-iframe');
    if (iframeToShow) {
        iframeToShow.style.display = 'block';
    }
}

// 默认显示待完成页面
showPage('wait');

function toggleNavbar() {
    const navbar = document.getElementById('navbar');
    navbar.classList.toggle('collapsed');

    const toggleButton = document.getElementById('toggle-btn');
    toggleButton.textContent = navbar.classList.contains('collapsed') ? '展开' : '收起';

    // 获取所有按钮
    const buttons = navbar.querySelectorAll('button:not(#toggle-btn)');
    buttons.forEach(button => {
        button.disabled = navbar.classList.contains('collapsed'); // 收缩时禁用其他按钮
    });
}
