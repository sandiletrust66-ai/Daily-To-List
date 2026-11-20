// Key used to save your tasks in the browser, so they are still there after a refresh
var KEY = "daily-wins-tasks";

// Example tasks shown the first time the page opens
function defaultTasks() {
  return [
    { id: "a1", text: "Tick this task to see it succeed", done: false },
    { id: "a2", text: "Delete a finished task", done: false },
    { id: "a3", text: "Add my own first task", done: false }
  ];
}

// Load saved tasks (or the examples if nothing is saved yet)
function load() {
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return defaultTasks();
}

// Save the current tasks
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch (e) {}
}

var tasks = load();

// Grab the elements from the page
var form = document.getElementById("add-form");
var input = document.getElementById("task-input");
var errorEl = document.getElementById("error");
var listEl = document.getElementById("list");
var countEl = document.getElementById("count");
var noteEl = document.getElementById("progress-note");
var barEl = document.getElementById("bar-fill");

// Show today's date in the speech card
document.getElementById("today").textContent =
  "Today, " +
  new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

// Draw the whole list on the page
function render() {
  listEl.textContent = "";

  // Message when there are no tasks
  if (tasks.length === 0) {
    var empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Nothing here yet. Add your first task above.";
    listEl.appendChild(empty);
  }

  tasks.forEach(function (task) {
    var li = document.createElement("li");
    if (task.done) li.className = "done";

    // Checkbox: ticking it marks the task as finished
    var box = document.createElement("input");
    box.type = "checkbox";
    box.id = "chk-" + task.id;
    box.checked = task.done;
    box.addEventListener("change", function () {
      task.done = box.checked;
      save();
      render();
    });

    // Task text
    var wrap = document.createElement("div");
    wrap.className = "task-text";

    var label = document.createElement("label");
    label.htmlFor = box.id;
    label.textContent = task.text;
    wrap.appendChild(label);

    // Green "Success!" message, only when the task is finished
    if (task.done) {
      var ok = document.createElement("span");
      ok.className = "success";
      ok.textContent = "Success!";
      wrap.appendChild(ok);
    }

    li.appendChild(box);
    li.appendChild(wrap);

    // Delete button, only when the task is finished
    if (task.done) {
      var del = document.createElement("button");
      del.type = "button";
      del.className = "btn-delete";
      del.textContent = "Delete";
      del.setAttribute("aria-label", "Delete task: " + task.text);
      del.addEventListener("click", function () {
        tasks = tasks.filter(function (t) {
          return t.id !== task.id;
        });
        save();
        render();
      });
      li.appendChild(del);
    } else {
      li.appendChild(document.createElement("span")); // keeps the layout even
    }

    listEl.appendChild(li);
  });

  // Update the counter and the progress bar
  var done = tasks.filter(function (t) { return t.done; }).length;
  countEl.textContent = done + " of " + tasks.length;
  barEl.style.width = tasks.length ? (done / tasks.length) * 100 + "%" : "0%";
  noteEl.textContent =
    tasks.length && done === tasks.length ? "All done. Well played." : "";
}

// Add a new task when the form is submitted (button click or Enter key)
form.addEventListener("submit", function (e) {
  e.preventDefault();

  var text = input.value.trim();
  if (!text) {
    errorEl.textContent = "Type a task first, then press Add task.";
    input.focus();
    return;
  }

  errorEl.textContent = "";
  tasks.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: text,
    done: false
  });

  input.value = "";
  save();
  render();
  input.focus();
});

// Clear the error message as soon as the user starts typing
input.addEventListener("input", function () {
  errorEl.textContent = "";
});

// Draw the list when the page first opens
render();