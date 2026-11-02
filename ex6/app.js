
// =====================================
// LEARNSPHERE - STUDENT STUDY PLANNER
// EXERCISE 06 - JAVASCRIPT FUNCTIONS
// =====================================


// 1. STATE MANAGEMENT

let tasks = JSON.parse(localStorage.getItem("learnSphereTasks")) || [];

let currentFilter = "all";


// GET HTML ELEMENTS

const form = document.getElementById("taskForm");

const input = document.getElementById("taskInput");

const list = document.getElementById("taskList");

const counter = document.getElementById("counter");


// 2. CREATE TASK FUNCTION

function createTask(text) {

    return {
        id: Date.now() + Math.random(),
        text: text,
        done: false
    };

}


// 3. ADD TASK FUNCTION

function addTask(text) {

    tasks.push(createTask(text));

    saveAndRender();

}


// 4. TOGGLE TASK FUNCTION

function toggleTask(id) {

    tasks = tasks.map(function(task) {

        return task.id === id
            ? { ...task, done: !task.done }
            : task;

    });

    saveAndRender();

}


// 5. DELETE TASK FUNCTION

function deleteTask(id) {

    tasks = tasks.filter(function(task) {

        return task.id !== id;

    });

    saveAndRender();

}


// 6. EDIT TASK FUNCTION

function editTask(id) {

    const task = tasks.find(function(task) {

        return task.id === id;

    });

    if (!task) return;

    const updatedText = prompt(
        "Edit your study task:",
        task.text
    );

    if (updatedText !== null && updatedText.trim() !== "") {

        task.text = updatedText.trim();

        saveAndRender();

    }

}


// 7. GET VISIBLE TASKS FUNCTION

function getVisible() {

    if (currentFilter === "open") {

        return tasks.filter(function(task) {

            return !task.done;

        });

    }

    if (currentFilter === "done") {

        return tasks.filter(function(task) {

            return task.done;

        });

    }

    return tasks;

}


// 8. COUNT PENDING TASKS FUNCTION

function countOpen() {

    return tasks.filter(function(task) {

        return !task.done;

    }).length;

}


// 9. CREATE TASK ITEM FUNCTION

function taskItem(task) {

    const li = document.createElement("li");

    li.className = "task-item";

    if (task.done) {

        li.classList.add("completed");

    }


    // LEFT SIDE

    const left = document.createElement("div");

    left.className = "task-left";


    // CHECKBOX

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.className = "task-checkbox";

    checkbox.checked = task.done;

    checkbox.addEventListener("change", function() {

        toggleTask(task.id);

    });


    // TASK TEXT

    const span = document.createElement("span");

    span.className = "task-text";

    span.textContent = task.text;


    left.appendChild(checkbox);

    left.appendChild(span);


    // ACTION BUTTONS

    const actions = document.createElement("div");

    actions.className = "task-actions";


    // EDIT BUTTON

    const editButton = document.createElement("button");

    editButton.textContent = "Edit";

    editButton.className = "edit-btn";

    editButton.addEventListener("click", function() {

        editTask(task.id);

    });


    // DELETE BUTTON

    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";

    deleteButton.className = "delete-btn";

    deleteButton.addEventListener("click", function() {

        deleteTask(task.id);

    });


    actions.appendChild(editButton);

    actions.appendChild(deleteButton);


    li.appendChild(left);

    li.appendChild(actions);


    return li;

}


// 10. SAVE AND RENDER FUNCTION

function saveAndRender() {

    localStorage.setItem(
        "learnSphereTasks",
        JSON.stringify(tasks)
    );

    renderTasks();

}


// 11. RENDER TASKS FUNCTION

function renderTasks() {

    // Clear previous list

    list.innerHTML = "";


    // Get filtered tasks

    const visibleTasks = getVisible();


    // Display each task

    visibleTasks.forEach(function(task) {

        list.appendChild(taskItem(task));

    });


    // Update statistics

    document.getElementById("totalCount").textContent =
        tasks.length;

    document.getElementById("openCount").textContent =
        countOpen();

    document.getElementById("completedCount").textContent =
        tasks.length - countOpen();


    // Update counter

    counter.textContent =
        countOpen() + " tasks remaining";


    // Empty message

    document.getElementById("emptyMessage").style.display =
        visibleTasks.length === 0 ? "block" : "none";


    // Update active filter

    document.querySelectorAll(".filter-btn").forEach(function(button) {

        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );

    });

}


// 12. HANDLE FORM SUBMISSION

function handleSubmit(event) {

    event.preventDefault();

    const text = input.value.trim();

    if (text !== "") {

        addTask(text);

    }

    input.value = "";

    input.focus();

}


// 13. CONNECT FORM TO FUNCTION

form.addEventListener("submit", handleSubmit);


// 14. FILTER BUTTON EVENTS

document.querySelectorAll(".filter-btn").forEach(function(button) {

    button.addEventListener("click", function() {

        currentFilter = button.dataset.filter;

        renderTasks();

    });

});


// 15. INITIAL RENDER

renderTasks();
