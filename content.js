chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log('content js');
  if (message.action === 'contentToInject') {
    const task = message.textToInject;
    console.log('task to inject', { task });

    insertTaskContent(task)
  }
});

function insertTaskContent(tasks) {
    const dashboardSidebar = document.querySelector('.dashboard-sidebar');

    if (dashboardSidebar) {
      const tasksContainer = document.createElement("div");

      tasks.forEach((taskItem, index) => {
        const taskElement = document.createElement('div')
        taskElement.textContent = `Task ${index + 1} : ${taskItem.task}, Time ${new Date(
            taskItem.time
        ).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })}`;

        tasksContainer.appendChild(taskElement)
      })

      dashboardSidebar.appendChild(tasksContainer)
    } else {
      console.log('Target div not found')
    }
}

















