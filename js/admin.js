// 模拟用户数据
const ADMIN_USER = {
    username: 'admin',
    password: 'admin123'
};

// 检查登录状态
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    } else if (isLoggedIn && window.location.href.includes('login.html')) {
        window.location.href = 'index.html';
    }
}

// 处理登录
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        window.location.href = 'index.html';
    } else {
        errorMessage.textContent = '用户名或密码错误';
    }
}

// 处理登出
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// 页面切换
function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.querySelectorAll('.menu li').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(pageName).classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
}

// 显示添加项目模态框
function showAddProjectModal() {
    document.getElementById('addProjectModal').classList.add('active');
}

// 关闭模态框
function closeModal() {
    document.getElementById('addProjectModal').classList.remove('active');
}

// 加载项目列表
function loadProjectList() {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const projectList = document.querySelector('.project-list');
    projectList.innerHTML = '';

    projects.forEach((project, index) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <img src="${project.image}" alt="${project.title}">
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-actions">
                    <button onclick="editProject(${index})">编辑</button>
                    <button onclick="deleteProject(${index})" class="delete-btn">删除</button>
                </div>
            </div>
        `;
        projectList.appendChild(projectCard);
    });

    // 更新项目数量
    document.getElementById('projectCount').textContent = projects.length;
}

// 保存项目
function saveProject(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const project = {
        title: formData.get('title'),
        description: formData.get('description'),
        link: formData.get('link'),
        image: URL.createObjectURL(formData.get('image'))
    };

    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));

    closeModal();
    loadProjectList();
    form.reset();
}

// 删除项目
function deleteProject(index) {
    if (confirm('确定要删除这个项目吗？')) {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        projects.splice(index, 1);
        localStorage.setItem('projects', JSON.stringify(projects));
        loadProjectList();
    }
}

// 保存关于我内容
function saveAbout() {
    const content = document.getElementById('aboutContent').value;
    localStorage.setItem('aboutContent', content);
    alert('保存成功！');
}

// 保存网站设置
function saveSettings() {
    const settings = {
        title: document.getElementById('siteTitle').value,
        themeColor: document.getElementById('themeColor').value
    };
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    alert('设置保存成功！');
}

// 访问统计相关功能
function initializeVisitStats() {
    // 获取访问数据
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    const today = new Date().toLocaleDateString();

    // 计算总访问量
    document.getElementById('totalVisits').textContent = visits.length;

    // 计算今日访问量
    const todayVisits = visits.filter(visit => 
        new Date(visit.time).toLocaleDateString() === today
    ).length;
    document.getElementById('todayVisits').textContent = todayVisits;

    // 计算平均停留时间
    const avgStayTime = visits.reduce((acc, curr) => acc + (curr.duration || 0), 0) / visits.length;
    document.getElementById('avgStayTime').textContent = 
        Math.round(avgStayTime || 0) + '分钟';

    // 初始化图表
    initializeCharts(visits);
    
    // 更新访问记录表格
    updateVisitTable(visits);
}

// 初始化图表
function initializeCharts(visits) {
    // 访问趋势图表
    const visitTrends = processVisitTrends(visits);
    new Chart(document.getElementById('visitsChart'), {
        type: 'line',
        data: {
            labels: visitTrends.labels,
            datasets: [{
                label: '访问量',
                data: visitTrends.data,
                fill: false,
                borderColor: '#ff7675',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // 访问时段分布图表
    const timeDistribution = processTimeDistribution(visits);
    new Chart(document.getElementById('timeDistChart'), {
        type: 'bar',
        data: {
            labels: timeDistribution.labels,
            datasets: [{
                label: '访问次数',
                data: timeDistribution.data,
                backgroundColor: '#ff7675',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 处理访问趋势数据
function processVisitTrends(visits) {
    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString();
    }).reverse();

    const visitCounts = last7Days.map(date => 
        visits.filter(visit => 
            new Date(visit.time).toLocaleDateString() === date
        ).length
    );

    return {
        labels: last7Days,
        data: visitCounts
    };
}

// 处理时段分布数据
function processTimeDistribution(visits) {
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    const hourCounts = new Array(24).fill(0);

    visits.forEach(visit => {
        const hour = new Date(visit.time).getHours();
        hourCounts[hour]++;
    });

    return {
        labels: hours,
        data: hourCounts
    };
}

// 更新访问记录表格
function updateVisitTable(visits) {
    const tbody = document.querySelector('#visitTable tbody');
    tbody.innerHTML = '';

    // 获取最近的20条记录
    const recentVisits = visits.slice(-20).reverse();

    recentVisits.forEach(visit => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(visit.time).toLocaleString()}</td>
            <td>${visit.duration || 0}分钟</td>
            <td>${visit.page || '首页'}</td>
            <td>${visit.referrer || '直接访问'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 记录访问信息
function recordVisit() {
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    const visit = {
        time: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer,
        duration: Math.floor(Math.random() * 30) // 模拟停留时间，实际应该使用真实数据
    };
    visits.push(visit);
    localStorage.setItem('visits', JSON.stringify(visits));
}

// 修改初始化页面函数
function initializePage() {
    // 检查登录状态
    checkAuth();

    if (!window.location.href.includes('login.html')) {
        // 设置用户名
        document.getElementById('currentUser').textContent = 
            localStorage.getItem('username');

        // 加载项目列表
        loadProjectList();

        // 加载访问统计
        initializeVisitStats();

        // 加载关于我内容
        const aboutContent = localStorage.getItem('aboutContent');
        if (aboutContent) {
            document.getElementById('aboutContent').value = aboutContent;
        }

        // 加载网站设置
        const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        if (settings.title) {
            document.getElementById('siteTitle').value = settings.title;
        }
        if (settings.themeColor) {
            document.getElementById('themeColor').value = settings.themeColor;
        }

        // 添加菜单点击事件
        document.querySelectorAll('.menu li').forEach(item => {
            item.addEventListener('click', () => {
                switchPage(item.dataset.page);
            });
        });

        // 添加项目表单提交事件
        document.getElementById('addProjectForm').addEventListener('submit', saveProject);
    } else {
        // 如果是登录页面，记录访问
        recordVisit();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage); 