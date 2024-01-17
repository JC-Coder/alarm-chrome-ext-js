document.addEventListener('DOMContentLoaded', function () {
  const timeInput = document.querySelector('#reminder-time');
  const taskInput = document.querySelector('#task-input');
  const reminderBtn = document.querySelector('#reminder-btn');
  const contentBtn = document.querySelector('#content-btn');
  const tasksContainer = document.querySelector('.tasks-container');

  renderTasks();

  reminderBtn.addEventListener('click', function () {
    const reminderTime = timeInput.value;
    const task = taskInput.value;

    console.log({ reminderTime, task });

    if (reminderTime && task) {
      const taskId = uid();
      const taskObject = {
        taskId,
        time: reminderTime,
        task
      };

      console.log({ taskObject });

      saveTask(taskObject);
    } else {
      alert('Please enter reminder time and task');
    }
  });

  contentBtn.addEventListener('click', function () {
    chrome.storage.sync.get('tasks', function (data) {
      const tasks = data.tasks || [];

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log({ tabs });
        const currentTab = tabs[0];
        const currentUrl = currentTab.url;

        if (currentUrl.includes('github.com')) {
          console.log('page');
          chrome.tabs.sendMessage(currentTab.id, {
            action: 'contentToInject',
            textToInject: tasks
          });
        }
      });
    });
  });

  // contentBtn.addEventListener('click', sendMessageToActiveTab);

  // async function sendMessageToActiveTab(message) {
  //   console.log('sendMessageToActiveTab');
  //   const tasks = (await chrome.storage.sync.get('tasks')) || [];

  //   const [tab] = await chrome.tabs.query({
  //     active: true,
  //     currentWindow: true
  //   });
  //   console.log('t', tab);

  //   const response = await chrome.tabs.sendMessage(tab.id, {
  //     action: 'contentToInject',
  //     textToInject: tasks
  //   });

  //   console.log('r', response);
  // }

  function renderTasks() {
    chrome.storage.sync.get('tasks', function (data) {
      const tasks = data.tasks || [];

      if (tasks.length > 0) {
        tasksContainer.style.display = 'block';
        tasksContainer.innerHTML = '';

        for (const taskObject of tasks) {
          const taskElement = document.createElement('div');
          taskElement.classList.add('task');
          taskElement.innerHTML = `
          <p><strong>Task:</strong> ${taskObject.task}</p>
          <p><strong>Reminder Time:</strong> ${new Date(
            taskObject.time
          ).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          })}</p>
          <button id="remove-btn">Remove</button>
          `;
          const removeButton = taskElement.querySelector('#remove-btn');
          removeButton.addEventListener('click', function () {
            removeTask(taskObject.taskId);
          });

          tasksContainer.appendChild(taskElement);
        }
      } else {
        tasksContainer.style.display = 'none';
      }
    });
  }

  function removeTask(id) {
    console.log('remove task action');
    chrome.storage.sync.get('tasks', function (data) {
      const tasks = data.tasks || [];
      console.log('remove', { tasks }, { id });

      const updatedTasks = tasks.filter((task) => task.taskId !== id);

      chrome.storage.sync.set(
        {
          tasks: updatedTasks
        },
        function () {
          renderTasks();
        }
      );
    });
  }

  function saveTask(taskObject) {
    chrome.storage.sync.get('tasks', function (data) {
      const tasks = data.tasks || [];
      const newTask = [...tasks, taskObject];

      console.log({ newTask, tasks });

      chrome.storage.sync.set(
        {
          tasks: newTask
        },
        function () {
          timeInput.value = '';
          taskInput.value = '';

          renderTasks();
          setAlarm(taskObject);
        }
      );
    });
  }

  function setAlarm(taskObject) {
    const alarmName = taskObject.taskId;
    const reminderTime = new Date(taskObject.time).getTime();

    chrome.alarms.create(alarmName, {
      when: reminderTime
    });
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
});
