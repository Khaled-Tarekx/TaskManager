let allTasks = [];

fetch('http://localhost:7500/api/tasks/')
  .then(response => response.json())
  .then(data => {
    // Update the allTasks array with the fetched data
    allTasks = data;

    // Call the displayTasks function to render the tasks
    displayTasks();
  })
  .catch(error => {
    console.error('Error fetching tasks data:', error);
  });

function displayTasks() {
  let cartona = '';

  allTasks.forEach(task => {
    cartona += `
      <div class="task-card">
        <div class="task-header">Task Details</div>
        <div class="task-field">
          <label>Priority: </label>
          <span id="task-priority">${task.priority}</span>
        </div>
        <div class="task-field">
          <label>Owner: </label>
          <span id="task-owner">${task.owner}</span>
        </div>
        <div class="task-field">
          <label>Deadline: </label>
          <span id="task-deadline">${task.dead_line}</span>
        </div>
        <div class="task-field">
          <label>Skill Set: </label>
          <span id="task-skillset">${task.skill_set}</span>
        </div>
        <div class="task-field">
          <label>Dependants: </label>
          <span id="task-dependants">${task.dependants}</span>
        </div>
      </div>
    `;
  });

  document.getElementById('tasks-container').innerHTML = cartona;
}
