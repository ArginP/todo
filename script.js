import { setLocalStorage, getLocalStorage } from "./helpers.js";

const addTaskInput = document.querySelector('[data-add-task-input]');
const addTaskButton = document.querySelector('[data-add-task-button]');
const tasksContainer = document.querySelector('[data-tasks-container]');
const taskTemplate = document.querySelector('[data-task-template]');

let tasks = getLocalStorage();

const addTask = () => {
    if (addTaskInput.value.trim()) { // проверяет что поле текста таски не пустое
        const task = { // задаем объект таски
            id: Date.now(), // костыль псевдоуникального ID
            description: addTaskInput.value.trim(), // текст таски без пробелов с концов
            completed: false, // по-умолчанию не выполнено
            createdAt: new Date(), // дата создания таски
        }
        tasks.push(task); // добавляем таску в конец массива тасок
        setLocalStorage(tasks); // записываем этот массив в LocalStorage
        addTaskInput.value = ''; // очищаем поле вввода
        renderTasks(); // отрисовываем текущий массив тасок
    }
}

addTaskButton.addEventListener('click', addTask) // обработчик по клику на кнопку
addTaskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { // обработчик по нажатию клавиши Enter
        addTask();
    }
})

const createTaskLayout = (task) => {
    const taskItem = document.importNode(taskTemplate.content, true);
    // получаем HTML нод из темплейта, true = с вложениями

    const taskCheckbox = taskItem.querySelector('[data-task-checkbox]');
    taskCheckbox.checked = task.completed; // чекбокс будет соответствовать значению completed в объекте таски

    const taskDescription = taskItem.querySelector('[data-task-description]');
    taskDescription.textContent = task.description; // описание таски берется из значения description в объекте таски

    const taskTimeCreated = taskItem.querySelector('[data-task-time-created]');
    taskTimeCreated.textContent = task.createdAt; // дата создания берется их значения createdAt

    const taskDelete = taskItem.querySelector('[data-task-delete]');
    taskDelete.disabled = !task.completed;
    // кнопка удалить заблокирована, пока таска не помечена как выполненная в значении completed объекта таски

    return taskItem;
}

const renderTasks = () => {
    tasksContainer.innerHTML = ''; // очищает контейнер тасок

    tasks.forEach((task) => { // для каждой таски в массиве тасок
        const taskItem = createTaskLayout(task); // для каждого объекта таски выполняется функция
        tasksContainer.append(taskItem) // выводит таску на страницу
    })
}