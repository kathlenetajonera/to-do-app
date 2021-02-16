const body = document.body;
const themeToggler = document.querySelectorAll(".header__toggle-btn");
const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const inputField = document.querySelector(".header__input");
const toDoContainer = document.querySelector(".toDo");
const optionsTab = document.querySelector(".options");
const categories = document.querySelectorAll(".options__category");
const remainingTasks = document.querySelector(".options__remaining");
let LOCAL_STORAGE_LIST = [];
let activeTasksCount = 0;

//detect the device's color mode
if (isDarkMode) {
    toggleTheme();
}

themeToggler.forEach(btn => {
    btn.addEventListener("click", toggleTheme);
});

inputField.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        e.preventDefault();

        const fieldValue = inputField.value;
        const savedLists = LOCAL_STORAGE_LIST.map(list => list.toDo);

        if (fieldValue && !savedLists.includes(fieldValue)) {
            addToDo(fieldValue, false);
            inputField.value = "";
            inputField.focus();
        } else console.log("already exist");
    }
});

toDoContainer.addEventListener("click", e => {
    const target = e.target;

    if (target.matches(".toDo__list") || target.matches(".toDo__text") || target.matches(".checkbox")) {
        updateTaskStatus(target);
    } else if (target.matches(".toDo__remove")) {
        removeToDo(target);
    }
});

optionsTab.addEventListener("click", e => {
    const target = e.target;

    if (target.matches(".options__category")) {
        filterList(target);
    } else if (target.matches(".options__clear")) {
        clearCompleted();
    }
});

const optionsVisibility = () => {
    //if the list is empty, hide the options
    if (toDoContainer.offsetHeight === 0 && toDoContainer.childElementCount === 0) {
        optionsTab.style.display = "none";
    } else if (toDoContainer.offsetHeight > 0) {
        optionsTab.style.display = "flex";
    }
}

checkStorage();
optionsVisibility();

function toggleTheme() {
    if (body.classList.contains("dark-theme")) {
        body.classList.remove("dark-theme");
    } else {
        body.classList.add("dark-theme");
    }
}

function addToDo(task, status) {
    const toDoItem = `
    <li class="toDo__list" data-complete="${status}" draggable="true">
        <span class="checkbox ${ status === true ? 'checkbox--checked' : '' }"></span>
        <p class="toDo__text ${ status === true ? 'toDo__text--checked' : '' }">${task}</p>

        <img class="toDo__remove" src="images/icon-cross.svg" alt="remove">
    </li>     
    `

    toDoContainer.insertAdjacentHTML("beforeend", toDoItem);

    saveToStorage(task, status);

    taskCounter();
    optionsVisibility();
}

function removeToDo(task) {
    const taskParent = task.parentElement;
    const indexToRemove = Array.from(toDoContainer.children).indexOf(taskParent);

    removeFromStorage(indexToRemove);
    toDoContainer.removeChild(taskParent);

    taskCounter();
    optionsVisibility();
}

function updateTaskStatus(task) {
    const elementTag = task.tagName.toLowerCase();

    if (elementTag === "span") {
        toggleCheckbox(task);

    } else if (elementTag === "li") {
        const firstElement = task.firstElementChild;

        toggleCheckbox(firstElement);
    } else if (elementTag === "p") {
        const previousSibling = task.previousElementSibling;

        toggleCheckbox(previousSibling);
    }

    function toggleCheckbox(checkbox){
        const listText = checkbox.nextElementSibling;

        if (!checkbox.classList.contains("checkbox--checked")) {
            checkbox.classList.add("checkbox--checked");
            listText.classList.add("toDo__text--checked");
            tagAsComplete(task);
            taskCounter();

            updateStorage(listText);
        } else {
            checkbox.classList.remove("checkbox--checked");
            listText.classList.remove("toDo__text--checked");
            tagAsIncomplete(task);
            taskCounter();

            updateStorage(listText);
        }
    }
}

function tagAsComplete(listElement) {
    const listContainer = listElement.closest(".toDo__list");

    listContainer.setAttribute("data-complete", "true");
}

function tagAsIncomplete(list) {
    const listContainer = list.closest(".toDo__list");
    
    listContainer.setAttribute("data-complete", "false");  
}

function filterList(selectedCategory) {
    const categoryText = selectedCategory.textContent;
    const toDoLists = document.querySelectorAll(".toDo__list");
    const activeSelectedCategory = () => {
        categories.forEach(category => {
            category.classList.remove("options__category--active");
            selectedCategory.classList.add("options__category--active");
        })
    };

    if (categoryText === "Completed") {
        activeSelectedCategory();

        toDoLists.forEach(list => {
            list.style.display = "flex"
        
            if (list.dataset.complete === "false") {
                list.style.display = "none"
            }
        });
    } else if (categoryText === "Active") {
        activeSelectedCategory();
        
        toDoLists.forEach(list => {
            list.style.display = "flex"
        
            if (list.dataset.complete === "true") {
                list.style.display = "none"
            }
        });
    } else {
        activeSelectedCategory();

        toDoLists.forEach(list => list.style.display = "flex");
    }
}

function clearCompleted() {
    const toDoLists = document.querySelectorAll(".toDo__list");

    toDoLists.forEach(list => {
        if (list.dataset.complete === "true") {
            toDoContainer.removeChild(list);
            removeCompletedFromStorage();
        }
    })

    optionsVisibility();
}

function saveToStorage(list, status) {
    const taskList = {
        toDo: list,
        completed: status
    }

    LOCAL_STORAGE_LIST.push(taskList);

    localStorage.setItem("toDo", JSON.stringify(LOCAL_STORAGE_LIST));
}

function updateStorage(list) {
    const listText = list.textContent;
    const listIndex = LOCAL_STORAGE_LIST.findIndex(list => list.toDo === listText);

    if (LOCAL_STORAGE_LIST[listIndex].completed === false) {
        LOCAL_STORAGE_LIST[listIndex].completed = true;
    } else {
        LOCAL_STORAGE_LIST[listIndex].completed = false;
    }

    localStorage.setItem("toDo", JSON.stringify(LOCAL_STORAGE_LIST))
}

function removeFromStorage(index) {
    LOCAL_STORAGE_LIST.splice(index, 1)

    localStorage.setItem("toDo", JSON.stringify(LOCAL_STORAGE_LIST));
}

function removeCompletedFromStorage() {
    const incompleteTasks = LOCAL_STORAGE_LIST.filter(list => list.completed === false);

    LOCAL_STORAGE_LIST.forEach(list => {
        if (list.completed === true) {
            const listIndex = LOCAL_STORAGE_LIST.indexOf(list);

            LOCAL_STORAGE_LIST.splice(listIndex, 1)
        }
    })

    localStorage.setItem("toDo", JSON.stringify(incompleteTasks));
}

function checkStorage() {
    if (localStorage.getItem("toDo")) {
        const savedList = JSON.parse(localStorage.getItem("toDo"))

        savedList.forEach(list => {
            addToDo(list.toDo, list.completed)
        })
    }
}

function taskCounter() {
    const incompleteTasks = [...document.querySelectorAll(".toDo__list")].filter(list => list.dataset.complete === "false");

    remainingTasks.textContent = `${incompleteTasks.length} items left`;
}

toDoContainer.addEventListener("dragstart", e => {
    const target = e.target;
    target.classList.add("toDo__list--dragging");

    const inactive = toDoContainer.querySelectorAll(".toDo__list:not(.toDo__list--dragging)");

    inactive.forEach(list => list.classList.add("toDo__list--inactive"));
});

toDoContainer.addEventListener("dragend", e => {
    const target = e.target;
    const inactive = toDoContainer.querySelectorAll(".toDo__list:not(.toDo__list--dragging)");

    target.classList.remove("toDo__list--dragging");

    inactive.forEach(list => {
        list.classList.remove("toDo__list--inactive");
        list.classList.remove("toDo__list--dropzone")
    })
})

toDoContainer.addEventListener("dragenter", e => {
    const target = e.target; 

    if (!target.classList.contains("toDo__list--dragging")) {
        target.classList.add("toDo__list--dropzone");
    }
})

toDoContainer.addEventListener("dragleave", e => {
    const target = e.target; 

    target.classList.remove("toDo__list--dropzone");
})

toDoContainer.addEventListener("dragover", e => {
    e.preventDefault();
})

toDoContainer.addEventListener("drop", e => {
    const target = e.target;
    const listContainer = target.parentElement;
    const selectedList = document.querySelector(".toDo__list--dragging");

    listContainer.insertBefore(selectedList, target);
})