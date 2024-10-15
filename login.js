function $(selector){
  return document.querySelector(selector)
}
function $$(selector){
  return document.querySelectorAll(selector)
}
$('header .login').onclick = function(e){
  e.stopPropagation()
  $('.flip-modal').style.display = 'block'
}
$('.flip-modal').addEventListener('click', function(e){
  e.stopPropagation()
  if(e.target.classList.contains('login')){
    $('.flip-modal').classList.remove('register')
    $('.flip-modal').classList.add('login')
  }
  if(e.target.classList.contains('register')){
    $('.flip-modal').classList.add('register')
    $('.flip-modal').classList.remove('login')
  }
  console.log(e.target)
  console.log(this)
  window.target = e.target
  if(e.target.classList.contains('close')){
    $('.flip-modal').style.display = 'none'
  }
})


document.addEventListener('click', function(){
  $('.flip-modal').style.display = 'none'
})


let isSubmitted = false; // 用于跟踪提交状态
console.log(isSubmitted);
$('.modal-login form').addEventListener('submit', async function(e) {
  e.preventDefault();
  console.log(isSubmitted);
    // 如果已经提交成功，判断用户点击的是什么按钮
    if (isSubmitted) {
      console.log(isSubmitted);
      // 直接跳转到 graph.html
      window.location.href = 'graph.html'; 
      return;
    }
  
  const username = $('.modal-login input[name=username]').value;
  const password = $('.modal-login input[name=password]').value;
  
  if (!/^\w{3,12}$/.test(username)) {
    $('.modal-login .errormsg').innerText = '用户名需输入3-11个字符，包括字母数字下划线';
    return false;
}

  if (!/^\w{3,10}$/.test(password)) {
    $('.modal-login .errormsg').innerText = '密码需输入6-10个字符，包括字母数字下划线';
    return false;
  }

  try {
    // 发送登录请求
    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }) // 假设 username 和 password 是已经定义的变量
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('username', data.username); // 存储用户名
      alert(data.message);
      
      // 显示新的按钮
      const redirectButton = document.getElementById('redirectButton');
      redirectButton.style.display = 'block'; // 显示按钮

      // 处理 redirectButton 的点击事件
      redirectButton.addEventListener('click',  function() {
        
            window.location.href = 'finaldataa.html';
      });

      isSubmitted = true; // 标记为已提交
      console.log(isSubmitted);
          
    } else {
        const errorMessage = await response.text();
        document.querySelector('.modal-login .errormsg').innerText = errorMessage; // 显示错误信息
    }
} catch (error) {
    console.error('提交过程中出现错误:', error);
}

});



$('.modal-register form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const username = $('.modal-register input[name=username]').value;
  const password = $('.modal-register input[name=password]').value;
  
 
  if (!/^\w{3,11}$/.test(username)) {
    $('.modal-login .errormsg').innerText = '用户名需输入3-11个字符，包括字母数字下划线';
    return false;
  }

  if (!/^\w{3,10}$/.test(password)) {
    $('.modal-login .errormsg').innerText = '密码需输入6-10个字符，包括字母数字下划线';
    return false;
  }
  
  // 检查密码确认
  if (password !== $('.modal-register input[name=password2]').value) {
    $('.modal-register .errormsg').innerText = '两次输入的密码不一致';
    return false;
  }
  
  // 发送注册请求
  const response = await fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  if (response.ok) {
    alert('注册成功');
    this.reset(); // 重置表单
  } else {
    const errorMessage = await response.text();
    $('.modal-register .errormsg').innerText = errorMessage; // 显示错误信息
  }
});


// 导航栏
fetch('navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar').innerHTML = data;
  });
