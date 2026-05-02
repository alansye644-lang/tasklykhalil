// تطبيق Taskly - إدارة المهام
class TaskManager {
    constructor() {
        this.tasks = this.getTasksFromStorage();
        this.currentFilter = 'all';
        this.init();
    }

    // تهيئة التطبيق
    init() {
        this.setupEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // نموذج إضافة مهمة
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        }

        // أزرار التصفية
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // زر تسجيل الخروج
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // نموذج التسجيل
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // نموذج تسجيل الدخول
        const loginForm = document.querySelector('.form-group');
        if (loginForm && window.location.pathname.includes('login.html')) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    // معالجة إضافة مهمة جديدة
    handleAddTask(e) {
        e.preventDefault();
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();

        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };

            this.tasks.push(newTask);
            this.saveTasksToStorage();
            this.renderTasks();
            this.updateStats();
            taskInput.value = '';
        }
    }

    // معالجة تصفية المهام
    handleFilter(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;

        // تحديث الأزرار النشطة
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.renderTasks();
    }

    // تبديل حالة المهمة (مكتملة/غير مكتملة)
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasksToStorage();
            this.renderTasks();
            this.updateStats();
        }
    }

    // حذف المهمة
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasksToStorage();
        this.renderTasks();
        this.updateStats();
    }

    // عرض المهام
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) return;

        let filteredTasks = this.tasks;

        if (this.currentFilter === 'active') {
            filteredTasks = this.tasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = this.tasks.filter(task => task.completed);
        }

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '<p class="no-tasks">لا توجد مهام لعرضها</p>';
            return;
        }

        tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="taskManager.toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})">حذف</button>
                </div>
            </div>
        `).join('');
    }

    // تحديث الإحصائيات
    updateStats() {
        const totalTasks = document.getElementById('totalTasks');
        const completedTasks = document.getElementById('completedTasks');
        const remainingTasks = document.getElementById('remainingTasks');

        if (totalTasks && completedTasks && remainingTasks) {
            const completed = this.tasks.filter(task => task.completed).length;
            totalTasks.textContent = this.tasks.length;
            completedTasks.textContent = completed;
            remainingTasks.textContent = this.tasks.length - completed;
        }
    }

    // حفظ المهام في localStorage
    saveTasksToStorage() {
        localStorage.setItem('taskly_tasks', JSON.stringify(this.tasks));
    }

    // جلب المهام من localStorage
    getTasksFromStorage() {
        const tasks = localStorage.getItem('taskly_tasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    // معالجة التسجيل
    handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('كلمات المرور غير متطابقة!');
            return;
        }

        // حفظ بيانات المستخدم
        const user = {
            name,
            email,
            password,
            registeredAt: new Date().toISOString()
        };

        localStorage.setItem('taskly_user', JSON.stringify(user));
        alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
        window.location.href = 'login.html';
    }

    // معالجة تسجيل الدخول
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const storedUser = localStorage.getItem('taskly_user');
        
        if (storedUser) {
            const user = JSON.parse(storedUser);
            
            if (user.email === email && user.password === password) {
                localStorage.setItem('taskly_loggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                alert('البريد الإلكتروني أو كلمة المرور غير صحيحة!');
            }
        } else {
            alert('لا يوجد حساب بهذه البيانات! يرجى إنشاء حساب جديد.');
        }
    }

    // معالجة تسجيل الخروج
    handleLogout() {
        localStorage.removeItem('taskly_loggedIn');
        window.location.href = 'index.html';
    }

    // التحقق من حالة تسجيل الدخول
    checkAuth() {
        const isLoggedIn = localStorage.getItem('taskly_loggedIn');
        
        if (window.location.pathname.includes('dashboard.html') && !isLoggedIn) {
            window.location.href = 'login.html';
        }
        
        if ((window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('singin.html')) && isLoggedIn) {
            window.location.href = 'dashboard.html';
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.taskManager = new TaskManager();
    taskManager.checkAuth();
});