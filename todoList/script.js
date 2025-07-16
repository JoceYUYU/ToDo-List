document.addEventListener('DOMContentLoaded', function() {
    // 初始化日期
    const today = new Date();
    const dateStr = formatDate(today);
    document.getElementById('journalDate').textContent = dateStr;
    document.getElementById('datePicker').value = dateStr;
    
    // 初始化日历
    initCalendar(today);
    
    // 加载当天的日记数据
    loadJournalData(dateStr);
    
    // 日期选择器点击事件
    document.getElementById('datePicker').addEventListener('click', function() {
        const calendar = document.getElementById('calendar');
        calendar.classList.toggle('show');
    });
    
    // 添加待办事项
    document.getElementById('addTodo').addEventListener('click', addTodo);
    document.getElementById('newTodo').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
    });
    
    // 心情选择
    document.querySelectorAll('.mood-options i').forEach(icon => {
        icon.addEventListener('click', function() {
            document.querySelectorAll('.mood-options i').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            
            // 保存心情
            const date = document.getElementById('journalDate').textContent;
            let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
            if (!journalData[date]) journalData[date] = { todos: [], essay: { text: '', images: [] }, mood: '' };
            
            journalData[date].mood = this.getAttribute('data-mood');
            localStorage.setItem('journalData', JSON.stringify(journalData));
        });
    });
    
    // 随笔编辑功能
    const editEssayBtn = document.getElementById('editEssayBtn');
    const essayInput = document.getElementById('essayInput');
    const essayContent = document.getElementById('essayContent');
    const cancelEditEssay = document.getElementById('cancelEditEssay');
    
    editEssayBtn.addEventListener('click', function() {
        // 进入编辑模式
        document.querySelector('.essay-section').classList.add('essay-edit-mode');
        
        // 将现有内容填充到编辑区域
        const currentText = essayContent.querySelector('.essay-text')?.textContent || '';
        document.getElementById('newEssay').value = currentText;
    });
    
    cancelEditEssay.addEventListener('click', function() {
        // 退出编辑模式
        document.querySelector('.essay-section').classList.remove('essay-edit-mode');
    });
    
    // 添加图片
    document.getElementById('addImage').addEventListener('click', function() {
        document.getElementById('essayImage').click();
    });
    
    document.getElementById('essayImage').addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageContainer = document.createElement('div');
                imageContainer.className = 'essay-image-container';
                imageContainer.innerHTML = `
                    <img src="${event.target.result}" class="essay-image">
                    <button class="remove-image" title="删除图片">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                
                document.getElementById('essayContent').appendChild(imageContainer);
                
                // 添加删除图片事件
                imageContainer.querySelector('.remove-image').addEventListener('click', function() {
                    imageContainer.remove();
                });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // 保存随笔
    document.getElementById('saveEssay').addEventListener('click', saveEssay);
    
    // 初始化未来七天日期选择器
    initFutureDateSelector(dateStr);
    
    // 添加未来待办事项
    document.getElementById('addFutureTodo').addEventListener('click', addFutureTodo);
    document.getElementById('newFutureTodo').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addFutureTodo();
    });
});

function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

function initCalendar(selectedDate) {
    const calendar = document.getElementById('calendar');
    const today = new Date();
    
    // 创建日历头部
    const header = document.createElement('div');
    header.className = 'calendar-header';
    
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&lt;';
    prevBtn.addEventListener('click', () => navigateMonth(-1));
    
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&gt;';
    nextBtn.addEventListener('click', () => navigateMonth(1));
    
    const monthYear = document.createElement('div');
    monthYear.id = 'monthYear';
    
    header.appendChild(prevBtn);
    header.appendChild(monthYear);
    header.appendChild(nextBtn);
    calendar.appendChild(header);
    
    // 创建星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekdaysRow = document.createElement('div');
    weekdaysRow.className = 'calendar-weekdays';
    
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        weekdaysRow.appendChild(dayElement);
    });
    
    calendar.appendChild(weekdaysRow);
    
    // 创建日期网格
    const daysGrid = document.createElement('div');
    daysGrid.className = 'calendar-days';
    daysGrid.id = 'calendarDays';
    calendar.appendChild(daysGrid);
    
    // 渲染日历
    renderCalendar(selectedDate);
    
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // 更新月份标题
        document.getElementById('monthYear').textContent = `${year}年 ${month + 1}月`;
        
        // 获取当月第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // 获取第一天是星期几
        const firstDayOfWeek = firstDay.getDay();
        
        // 获取上个月的最后几天
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        // 清空日期网格
        const daysGrid = document.getElementById('calendarDays');
        daysGrid.innerHTML = '';
        
        // 添加上个月的日期
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = prevMonthLastDay - i;
            daysGrid.appendChild(dayElement);
        }
        
        // 添加当月的日期
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;
            
            // 检查是否是今天
            const currentDate = new Date(year, month, i);
            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            // 检查是否是选中的日期
            const selectedDate = document.getElementById('journalDate').textContent;
            const formattedDate = formatDate(currentDate);
            if (formattedDate === selectedDate) {
                dayElement.classList.add('selected');
            }
            
            // 添加点击事件
            dayElement.addEventListener('click', () => {
                // 更新选中的日期
                document.querySelectorAll('.calendar-day').forEach(day => {
                    day.classList.remove('selected');
                });
                dayElement.classList.add('selected');
                
                // 更新日记日期
                const newDate = formatDate(currentDate);
                document.getElementById('journalDate').textContent = newDate;
                document.getElementById('datePicker').value = newDate;
                
                // 更新未来日期选择器
                initFutureDateSelector(newDate);
                
                // 加载新日期的日记数据
                loadJournalData(newDate);
                
                // 隐藏日历
                document.getElementById('calendar').classList.remove('show');
            });
            
            daysGrid.appendChild(dayElement);
        }
        
        // 计算需要添加的下个月日期数量
        const totalCells = firstDayOfWeek + lastDay.getDate();
        const nextMonthDays = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
        
        // 添加下个月的日期
        for (let i = 1; i <= nextMonthDays; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = i;
            daysGrid.appendChild(dayElement);
        }
    }
    
    function navigateMonth(direction) {
        const currentMonth = document.getElementById('monthYear').textContent;
        const [year, month] = currentMonth.split('年 ').map(str => parseInt(str));
        const newDate = new Date(year, month - 1 + direction, 1);
        renderCalendar(newDate);
    }
}

function loadJournalData(date) {
    // 从本地存储加载数据
    let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
    
    // 如果该日期没有数据，初始化一个空对象
    if (!journalData[date]) {
        journalData[date] = { todos: [], essay: { text: '', images: [] }, mood: '' };
        localStorage.setItem('journalData', JSON.stringify(journalData));
    }
    
    const data = journalData[date];
    
    // 加载待办事项
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    data.todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} data-index="${index}">
            <span class="todo-text">${todo.text}</span>
            <div class="todo-actions">
                <button class="edit-todo" data-index="${index}"><i class="fas fa-edit"></i></button>
                <button class="delete-todo" data-index="${index}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        todoList.appendChild(li);
        
        // 添加复选框事件
        li.querySelector('input[type="checkbox"]').addEventListener('change', function() {
            const index = parseInt(this.getAttribute('data-index'));
            let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
            journalData[date].todos[index].completed = this.checked;
            localStorage.setItem('journalData', JSON.stringify(journalData));
            
            // 更新UI
            this.parentElement.classList.toggle('completed', this.checked);
        });
        
        // 添加编辑事件
        li.querySelector('.edit-todo').addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const todoText = document.querySelector(`.todo-item:nth-child(${index + 1}) .todo-text`);
            const newText = prompt('编辑任务:', todoText.textContent);
            
            if (newText !== null) {
                let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
                journalData[date].todos[index].text = newText;
                localStorage.setItem('journalData', JSON.stringify(journalData));
                
                todoText.textContent = newText;
            }
        });
        
        // 添加删除事件
        li.querySelector('.delete-todo').addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
            journalData[date].todos.splice(index, 1);
            localStorage.setItem('journalData', JSON.stringify(journalData));
            
            // 重新加载今日和未来待办事项
            loadJournalData(date);
            loadFutureTodos(date);
        });
    });
    
    // 加载随笔
    const essayContent = document.getElementById('essayContent');
    essayContent.innerHTML = '';
    
    if (data.essay?.text) {
        const textDiv = document.createElement('div');
        textDiv.className = 'essay-text';
        textDiv.textContent = data.essay.text;
        essayContent.appendChild(textDiv);
    }
    
    if (data.essay?.images && data.essay.images.length > 0) {
        data.essay.images.forEach(imgSrc => {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'essay-image-container';
            imageContainer.innerHTML = `
                <img src="${imgSrc}" class="essay-image">
                <button class="remove-image" title="删除图片">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            essayContent.appendChild(imageContainer);
            
            // 添加删除图片事件
            imageContainer.querySelector('.remove-image').addEventListener('click', function() {
                // 从存储中删除图片
                let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
                const index = data.essay.images.indexOf(imgSrc);
                if (index !== -1) {
                    journalData[date].essay.images.splice(index, 1);
                    localStorage.setItem('journalData', JSON.stringify(journalData));
                    imageContainer.remove();
                }
            });
        });
    }
    
    // 加载心情
    if (data.mood) {
        document.querySelectorAll('.mood-options i').forEach(icon => {
            icon.classList.remove('selected');
            if (icon.getAttribute('data-mood') === data.mood) {
                icon.classList.add('selected');
            }
        });
    }
    
    // 退出编辑模式
    document.querySelector('.essay-section').classList.remove('essay-edit-mode');
    
    // 加载未来七天待办事项
    loadFutureTodos(date);
}

function addTodo() {
    const input = document.getElementById('newTodo');
    const text = input.value.trim();
    const date = document.getElementById('journalDate').textContent;
    
    if (text) {
        let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
        
        if (!journalData[date]) {
            journalData[date] = { todos: [], essay: { text: '', images: [] }, mood: '' };
        }
        
        journalData[date].todos.push({
            text: text,
            completed: false
        });
        
        localStorage.setItem('journalData', JSON.stringify(journalData));
        input.value = '';
        
        loadJournalData(date);
    }
}

function saveEssay() {
    const date = document.getElementById('journalDate').textContent;
    const essayText = document.getElementById('newEssay').value.trim();
    const essayContent = document.getElementById('essayContent');
    
    // 收集所有图片的Base64数据
    let images = [];
    essayContent.querySelectorAll('.essay-image').forEach(img => {
        images.push(img.src);
    });
    
    let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
    
    if (!journalData[date]) {
        journalData[date] = { todos: [], essay: { text: '', images: [] }, mood: '' };
    }
    
    journalData[date].essay = {
        text: essayText,
        images: images
    };
    
    localStorage.setItem('journalData', JSON.stringify(journalData));
    
    // 清空输入
    document.getElementById('newEssay').value = '';
    
    // 重新加载随笔内容
    loadJournalData(date);
}

function initFutureDateSelector(selectedDateStr) {
    const futureTodoDate = document.getElementById('futureTodoDate');
    futureTodoDate.innerHTML = '';
    
    // 解析选中的日期
    const selectedDateParts = selectedDateStr.match(/(\d+)年(\d+)月(\d+)日/);
    const selectedDate = new Date(
        parseInt(selectedDateParts[1]),
        parseInt(selectedDateParts[2]) - 1,
        parseInt(selectedDateParts[3])
    );
    
    for (let i = 1; i <= 7; i++) {
        const date = new Date(selectedDate);
        date.setDate(selectedDate.getDate() + i);
        const dateStr = formatDate(date);
        
        const option = document.createElement('option');
        option.value = dateStr;
        option.textContent = `${dateStr} (${['日','一','二','三','四','五','六'][date.getDay()]})`;
        futureTodoDate.appendChild(option);
    }
}

function addFutureTodo() {
    const input = document.getElementById('newFutureTodo');
    const text = input.value.trim();
    const dateStr = document.getElementById('futureTodoDate').value;
    const selectedDateStr = document.getElementById('journalDate').textContent;
    
    if (text && dateStr) {
        let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
        
        if (!journalData[dateStr]) {
            journalData[dateStr] = { todos: [], essay: { text: '', images: [] }, mood: '' };
        }
        
        // 添加任务
        journalData[dateStr].todos.push({
            text: text,
            completed: false
        });
        
        localStorage.setItem('journalData', JSON.stringify(journalData));
        input.value = '';
        
        // 重新加载未来待办事项（基于当前选中日期）
        loadFutureTodos(selectedDateStr);
    }
}

function loadFutureTodos(selectedDateStr) {
    const container = document.getElementById('futureTodosContainer');
    container.innerHTML = '';
    
    // 解析选中的日期
    const selectedDateParts = selectedDateStr.match(/(\d+)年(\d+)月(\d+)日/);
    const selectedDate = new Date(
        parseInt(selectedDateParts[1]),
        parseInt(selectedDateParts[2]) - 1,
        parseInt(selectedDateParts[3])
    );
    
    let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
    let hasFutureTodos = false;
    
    // 为选中日期的未来7天创建任务组
    for (let i = 1; i <= 7; i++) {
        const date = new Date(selectedDate);
        date.setDate(selectedDate.getDate() + i);
        const dateStr = formatDate(date);
        
        // 获取该日期的所有任务
        const todos = journalData[dateStr]?.todos || [];
        
        if (todos.length > 0) {
            hasFutureTodos = true;
            
            // 创建日期分组
            const group = document.createElement('div');
            group.className = 'future-todo-group';
            group.dataset.date = dateStr;
            
            // 分组标题
            const header = document.createElement('div');
            header.className = 'future-todo-group-header';
            header.innerHTML = `
                <span class="future-todo-date">${dateStr} (${['日','一','二','三','四','五','六'][date.getDay()]})</span>
                <span class="future-todo-count">${todos.length}项</span>
            `;
            
            // 任务列表
            const list = document.createElement('ul');
            list.className = 'future-todo-list';
            
            // 添加每个任务
            todos.forEach((todo, index) => {
                const li = document.createElement('li');
                li.className = 'future-todo-item';
                li.innerHTML = `
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} data-date="${dateStr}" data-index="${index}">
                    <span class="future-todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                    <div class="future-todo-actions">
                        <button class="delete-future-todo" data-date="${dateStr}" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                // 添加复选框事件
                li.querySelector('input[type="checkbox"]').addEventListener('change', function() {
                    const date = this.dataset.date;
                    const index = parseInt(this.dataset.index);
                    
                    let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
                    if (journalData[date]?.todos?.[index]) {
                        journalData[date].todos[index].completed = this.checked;
                        localStorage.setItem('journalData', JSON.stringify(journalData));
                        
                        // 更新UI
                        this.nextElementSibling.classList.toggle('completed', this.checked);
                    }
                });
                
                // 添加删除事件
                li.querySelector('.delete-future-todo').addEventListener('click', function() {
                    const date = this.dataset.date;
                    const index = parseInt(this.dataset.index);
                    
                    let journalData = JSON.parse(localStorage.getItem('journalData') || '{}');
                    if (journalData[date]?.todos?.[index]) {
                        journalData[date].todos.splice(index, 1);
                        localStorage.setItem('journalData', JSON.stringify(journalData));
                        
                        // 重新加载未来待办事项
                        loadFutureTodos(selectedDateStr);
                    }
                });
                
                list.appendChild(li);
            });
            
            group.appendChild(header);
            group.appendChild(list);
            container.appendChild(group);
        }
    }
    
    // 如果没有未来任务，显示提示信息
    if (!hasFutureTodos) {
        container.innerHTML = '<p class="no-future-todos">未来七天暂无待办事项</p>';
    }
}