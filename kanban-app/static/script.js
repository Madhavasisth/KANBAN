document.addEventListener('DOMContentLoaded', () => {
  // Initialize with example hardcoded tasks
  let tasks = [
    {
      id: 'task-1',
      title: 'Design landing page',
      description: 'Create a modern, responsive landing page with engaging visuals and clear call-to-actions. Include hero section, features, testimonials, and contact form.',
      status: 'todo',
      priority: 'info'
    },
    {
      id: 'task-2',
      title: 'Write documentation',
      description: 'Document the API endpoints and create user guides for the new features. Include examples and troubleshooting section.',
      status: 'todo',
      priority: 'medium'
    },
    {
      id: 'task-3',
      title: 'Implement authentication',
      description: 'Build secure user authentication system with JWT tokens and password encryption. Add login, signup, and password reset functionality.',
      status: 'inprogress',
      priority: 'high'
    },
    {
      id: 'task-4',
      title: 'Fix bugs in code',
      description: 'Resolve critical bugs in the user registration flow and payment processing. Test all edge cases and error handling.',
      status: 'inprogress',
      priority: 'high'
    },
    {
      id: 'task-5',
      title: 'Update dependencies',
      description: 'Update all project dependencies to latest stable versions and test compatibility. Check for security vulnerabilities.',
      status: 'inprogress',
      priority: 'medium'
    },
    {
      id: 'task-6',
      title: 'Code refactoring',
      description: 'Clean up legacy code and improve performance of database queries. Optimize loading times and reduce memory usage.',
      status: 'review',
      priority: 'low'
    }
  ];

  const columns = document.querySelectorAll('.column');
  const searchInput = document.querySelector('.search-input');

  const priorityClassMap = {
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low',
    info: 'priority-info'
  };

  function createTaskCard(task) {
    const card = document.createElement('div');
    card.classList.add('task-card');
    card.setAttribute('draggable', true);
    card.dataset.id = task.id;

    const priorityBar = document.createElement('div');
    priorityBar.className = 'task-priority ' + priorityClassMap[task.priority];
    card.appendChild(priorityBar);

    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = task.title;
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'task-description';
    desc.textContent = task.description;
    card.appendChild(desc);

    const options = document.createElement('div');
    options.className = 'task-options';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit Task';
    editBtn.addEventListener('click', e => {
      e.stopPropagation();
      openEditTaskModal(task.id);
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.title = 'Delete Task';
    delBtn.addEventListener('click', e => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    options.appendChild(editBtn);
    options.appendChild(delBtn);
    card.appendChild(options);

    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);

    return card;
  }

  function renderTasks() {
    columns.forEach(col => {
      const status = col.dataset.status;
      const container = col.querySelector('.tasks-container');
      container.innerHTML = '';
      const filteredTasks = tasks.filter(t => t.status === status);
      filteredTasks.forEach(task => {
        container.appendChild(createTaskCard(task));
      });
      updateTaskCount(col, filteredTasks.length);
    });
  }

  function updateTaskCount(column, count) {
    const countBadge = column.querySelector('.task-count');
    if (countBadge) countBadge.textContent = count;
  }

  let draggedTaskId = null;

  function dragStart(e) {
    draggedTaskId = this.dataset.id;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  function dragEnd() {
    this.classList.remove('dragging');
    draggedTaskId = null;
    columns.forEach(c => c.classList.remove('drag-over'));
  }

  columns.forEach(column => {
    column.addEventListener('dragover', e => {
      e.preventDefault();
      column.classList.add('drag-over');
    });
    column.addEventListener('dragleave', () => {
      column.classList.remove('drag-over');
    });
    column.addEventListener('drop', e => {
      e.preventDefault();
      column.classList.remove('drag-over');
      if (!draggedTaskId) return;
      const newStatus = column.dataset.status;
      updateTaskStatus(draggedTaskId, newStatus);
    });
  });

  function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      task.status = newStatus;
      renderTasks();
    }
  }

  function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
  }

  const addTaskBtns = document.querySelectorAll('.add-task-btn');

  addTaskBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const column = btn.closest('.column');
      openAddTaskModal(column.dataset.status);
    });
  });

  function openAddTaskModal(status) {
    const title = prompt('Enter task title:');
    if (!title) return alert('Title is required.');
    const description = prompt('Enter task description:');
    const priorityInput = prompt('Enter priority (high, medium, low, info):', 'info');
    const priority = priorityClassMap[priorityInput.toLowerCase()] ? priorityInput.toLowerCase() : 'info';

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description: description || '',
      status,
      priority
    };

    tasks.push(newTask);
    renderTasks();
  }

  function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newTitle = prompt('Edit task title:', task.title);
    if (!newTitle) return alert('Title is required.');
    const newDesc = prompt('Edit task description:', task.description);
    const newPriorityInput = prompt('Edit priority (high, medium, low, info):', task.priority);
    const newPriority = priorityClassMap[newPriorityInput.toLowerCase()] ? newPriorityInput.toLowerCase() : task.priority;

    task.title = newTitle;
    task.description = newDesc || '';
    task.priority = newPriority;

    renderTasks();
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const query = e.target.value.toLowerCase();
      columns.forEach(col => {
        const container = col.querySelector('.tasks-container');
        container.querySelectorAll('.task-card').forEach(card => {
          const task = tasks.find(t => t.id === card.dataset.id);
          const match = task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query);
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  // Initial render including hardcoded tasks
  renderTasks();
});
