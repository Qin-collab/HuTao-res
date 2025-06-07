// 项目数据
const projects = [
    {
        title: "项目一",
        description: "这是一个示例项目描述...",
        image: "https://via.placeholder.com/300x200",
        link: "#"
    },
    {
        title: "项目二",
        description: "这是另一个示例项目描述...",
        image: "https://via.placeholder.com/300x200",
        link: "#"
    },
    {
        title: "项目三",
        description: "这是第三个示例项目描述...",
        image: "https://via.placeholder.com/300x200",
        link: "#"
    }
];

// 加载项目数据
function loadProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    projectsGrid.innerHTML = '';
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        projectCard.innerHTML = `
            <img src="${project.image}" alt="${project.title}">
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <a href="${project.link}" target="_blank">了解更多</a>
            </div>
        `;
        
        projectsGrid.appendChild(projectCard);
    });
}

// 加载关于我内容
function loadAboutContent() {
    const aboutContent = localStorage.getItem('aboutContent');
    if (aboutContent) {
        document.querySelector('.about-text p').textContent = aboutContent;
    }
}

// 应用网站设置
function applySettings() {
    const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    
    // 更新网站标题
    if (settings.title) {
        document.title = settings.title;
        document.querySelector('.nav-brand').textContent = settings.title;
    }
    
    // 更新主题颜色
    if (settings.themeColor) {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --theme-color: ${settings.themeColor};
            }
            .nav-brand,
            .nav-links a:hover,
            .nav-links a.active {
                color: var(--theme-color);
            }
            .hero {
                background: linear-gradient(135deg, var(--theme-color) 0%, ${adjustColor(settings.themeColor, 40)} 100%);
            }
            button,
            .project-info a {
                background-color: var(--theme-color);
            }
            button:hover,
            .project-info a:hover {
                background-color: ${adjustColor(settings.themeColor, -20)};
            }
        `;
        document.head.appendChild(style);
    }
}

// 辅助函数：调整颜色明度
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
}

// 更新访问统计
function updateVisitCount() {
    let visitCount = parseInt(localStorage.getItem('visitCount') || '0');
    visitCount++;
    localStorage.setItem('visitCount', visitCount.toString());
}

// 导航栏活跃状态
function updateNavigation() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadAboutContent();
    applySettings();
    updateVisitCount();
    updateNavigation();
}); 