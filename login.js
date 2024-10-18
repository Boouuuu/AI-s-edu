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

$('.modal-login form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
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
      console.log(username);

      alert(data.message);
        // 在这里可以处理登录成功后的逻辑，比如跳转到首页
        window.location.href = 'graph.html'; // 替换为你的首页地址
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
