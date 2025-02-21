import { setLocalStorage, getLocalStorage, getTimeFormat, debounce } from "./helpers.js";

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
            createdAt: getTimeFormat(new Date()), // дата создания таски
        }
        tasks.push(task); // добавляем таску в конец массива тасок
        setLocalStorage(tasks); // записываем этот массив в localStorage
        addTaskInput.value = ''; // очищаем поле ввода
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
    // getTimeFormat() приводит формат отображаемого времени к интернациональному стандарту, см. helpers.js

    const taskDelete = taskItem.querySelector('[data-task-delete]');
    taskDelete.disabled = !task.completed;
    // кнопка удалить заблокирована, пока таска не помечена как выполненная в значении completed объекта таски

    // отслеживаем ивент изменения состояния checked галочки
    taskCheckbox.addEventListener('change', (event) => {
        tasks = tasks.map((t) => {
            // метод, который применяет колбэк функцию к элементам массива, и создает новый, измененный, массив
            if (t.id === task.id) { // находит нужную таску по ID
                t.completed = event.target.checked; // присваивает .checked = true в объекте таски
            }
            return t; // возвращает измененную таску
        });
        setLocalStorage(tasks); // записывает таски в localStorage
        renderTasks(); // отрисовывает таски
    })

    // отслеживаем клик по кнопке удалить таску
    taskDelete.addEventListener('click', () => {
        tasks = tasks.filter((t) => {
            // метод, который фильтрует массива на основании параметров, заданных колбеком
            if (t.id !== task.id) { // фильтруем по ID т.о., чтобы фильтр прошли все таски, кроме удаляемой
                return t; // возвращает все элементы массива, ID которых НЕ СООТВЕТСТВУЕТ ID удаляемой таски
            }

        });
        setLocalStorage(tasks); // записывает таски в localStorage
        renderTasks(); // отрисовывает таски
    })

    return taskItem;
}

const renderTasks = () => {
    tasksContainer.innerHTML = ''; // очищает контейнер тасок

    if (tasks.length === 0) { // если массив тасок пуст, то
        tasksContainer.innerHTML = '<h3>No tasks yet.</h3>'; // выведет эту HTML-разметку
        return; // остановит дальнейшее выполнение кода функции
    }

    tasks.forEach((task) => { // для каждой таски в массиве тасок
        const taskItem = createTaskLayout(task); // для каждого объекта таски выполняется функция
        tasksContainer.append(taskItem) // выводит таску на страницу
    })
}

renderTasks(); // вызываем функцию рендера, чтобы при первоначальной загрузке страницы таски отрисовались


//36:00

/*
const search = () => {
    const searchInput = document.querySelector("");

    const debouncedSearch = debounce((event) => {

        });
    }, 600); // здесь передается кастомное время задержки дебаунсера

    searchInput.addEventListener("input", debouncedSearch);
    // по событию ввода в окно поиска, будет осуществляться функция debouncedSearch
};
*/
