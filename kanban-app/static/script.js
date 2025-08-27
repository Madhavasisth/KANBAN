document.addEventListener('DOMContentLoaded', async () => {
  // Load tasks from API instead of hardcoded
  let tasks = [];

  // Load tasks from Flask API
  async function loadTasks() {
    try {
      const response = await fetch('/api/tasks');
      tasks = await response.json();
      renderTasks();
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Fallback to empty array if API fails
      tasks = [];
      renderTasks();
    }
  }

  // Save task to API
  async function saveTask(taskData) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });
      if (response.ok) {
        await loadTasks(); // Reload to get the ID from database
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }

  // Update task in API
  async function updateTask(taskId, taskData) {
    try {
      const response = await fetch(/api/tasks/${taskId}, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });
      if (response.ok) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  // Delete task from API
  async function deleteTaskFromAPI(taskId) {
    try {
      const response = await fetch(/api/tasks/${taskId}, {
        method: 'DELETE'
      });
      if (response.ok) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const columns = document.querySelectorAll('.column');
  const searchInput = document.querySelector('.search-input');

  const priorityClassMap = {
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low',
    info: 'priority-info'
  };

  // Valid priorities for database
  const validPriorities = ['high', 'medium', 'low'];

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
    editBtn.textContent = '✏';
    editBtn.title = 'Edit Task';
    editBtn.addEventListener('click', e => {
      e.stopPropagation();
      openEditTaskModal(task.id);
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑';
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

  async function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id == taskId);
    if (task && task.status !== newStatus) {
      task.status = newStatus;
      // Update in API
      await updateTask(taskId, task);
    }
  }

  async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTaskFromAPI(taskId);
    }
  }

  const addTaskBtns = document.querySelectorAll('.add-task-btn');

  addTaskBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const column = btn.closest('.column');
      openAddTaskModal(column.dataset.status);
    });
  });

  async function openAddTaskModal(status) {
    const title = prompt('Enter task title:');
    if (!title) return alert('Title is required.');
    const description = prompt('Enter task description:');
    const priorityInput = prompt('Enter priority (high, medium, low):', 'medium');
    const priority = validPriorities.includes(priorityInput.toLowerCase()) ? priorityInput.toLowerCase() : 'medium';

    const newTask = {
      title,
      description: description || '',
      status,
      priority
    };

    await saveTask(newTask);
  }

  async function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id == taskId);
    if (!task) return;
    const newTitle = prompt('Edit task title:', task.title);
    if (!newTitle) return alert('Title is required.');
    const newDesc = prompt('Edit task description:', task.description);
    const newPriorityInput = prompt('Edit priority (high, medium, low):', task.priority);
    const newPriority = validPriorities.includes(newPriorityInput.toLowerCase()) ? newPriorityInput.toLowerCase() : task.priority;

    const updatedTask = {
      ...task,
      title: newTitle,
      description: newDesc || '',
      priority: newPriority
    };

    await updateTask(taskId, updatedTask);
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const query = e.target.value.toLowerCase();
      columns.forEach(col => {
        const container = col.querySelector('.tasks-container');
        container.querySelectorAll('.task-card').forEach(card => {
          const task = tasks.find(t => t.id == card.dataset.id);
          const match = task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query);
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  // Load tasks from API on startup
  await loadTasks();
});]\