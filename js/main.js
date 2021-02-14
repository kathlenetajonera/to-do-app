const body = document.body;
const themeToggler = document.querySelectorAll(".header__toggle-btn");
const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const inputField = document.querySelector(".header__input");
const toDoContainer = document.querySelector(".toDo");
const optionsTab = document.querySelector(".options");
const categories = document.querySelectorAll(".options__category");
const remainingTasks = document.querySelector(".options__remaining");
const LOCAL_STORAGE_LIST = [];
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

        if (fieldValue) {
            addToDo(fieldValue);
            inputField.value = "";
            inputField.focus();
        } else return;
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

    if (toDoContainer.offsetHeight === 0) {
        optionsTab.style.display = "none";
    } else {
        optionsTab.style.display = "flex";
    }
}

const tasksCounter = (type) => {
    if (type === "inc") {
        activeTasksCount++;
    } else if (type === "dec") {
        activeTasksCount--;
    }
    remainingTasks.textContent = `${activeTasksCount} items left`;
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

function addToDo(task) {
    const toDoItem = `
    <li class="toDo__list" data-complete="false">
        <span class="checkbox"></span>
        <p class="toDo__text">${task}</p>

        <img class="toDo__remove" src="images/icon-cross.svg" alt="remove">
    </li>     
    `

    toDoContainer.insertAdjacentHTML("beforeend", toDoItem);

    saveToStorage(task);
    tasksCounter("inc");
    optionsVisibility();
}

function removeToDo(task) {
    const taskParent = task.parentElement;
    const indexToRemove = Array.from(toDoContainer.children).indexOf(taskParent);

    removeFromStorage(indexToRemove);
    toDoContainer.removeChild(taskParent);

    if (taskParent.dataset.complete === "false") {
        tasksCounter("dec");
    }

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
            tasksCounter("dec");
        } else {
            checkbox.classList.remove("checkbox--checked");
            listText.classList.remove("toDo__text--checked");
            tagAsIncomplete(task);
            tasksCounter("inc");
        }
    }
}

function tagAsComplete(list) {
    const listContainer = list.closest(".toDo__list");
    
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
            const indexToRemove = Array.from(toDoLists).indexOf(list)

            removeFromStorage(indexToRemove);
            toDoContainer.removeChild(list);
        }
    })

    optionsVisibility();
}

function saveToStorage(list) {
    LOCAL_STORAGE_LIST.push(list);

    localStorage.setItem("toDo", JSON.stringify(LOCAL_STORAGE_LIST));
}

function removeFromStorage(taskIndex) {
    LOCAL_STORAGE_LIST.splice(taskIndex, 1)

    localStorage.setItem("toDo", JSON.stringify(LOCAL_STORAGE_LIST))
}

function checkStorage() {
    if (localStorage.getItem("toDo")) {
        const savedList = JSON.parse(localStorage.getItem("toDo"))
    
        savedList.forEach(list => addToDo(list))
    }
}