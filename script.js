import { setLocalStorage, getLocalStorage, getTimeFormat, debounce } from "./helpers.js";

const addTaskInput = document.querySelector('[data-add-task-input]');
const addTaskButton = document.querySelector('[data-add-task-button]');
const searchInput = document.querySelector('[data-search-input]');
const tasksContainer = document.querySelector('[data-tasks-container]');
const taskTemplate = document.querySelector('[data-task-template]');

let tasks = getLocalStorage();
let filteredTasks = [];

// --- логика создания новой таски ---
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
        renderTasks(); // отрисовывает текущий массив тасок
    }
}

// --- обработчики событий добавления новой таски ---
addTaskButton.addEventListener('click', addTask) // обработчик по клику на кнопку
addTaskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { // обработчик по нажатию клавиши Enter
        addTask();
    }
})

// --- обработчик ввода в поле поиска и логика фильтрования тасок под поиск ---
searchInput.addEventListener('input', (event) => { // обработчик по вводу в поле поиска
    // const searchValue = event.target.value.toLowerCase().trim(); // введенное значение

    debouncedSearch(event.target.value.toLowerCase().trim());
})

// --- поиск без задержки, срабатывает при нажатии кнопок ---
const search = (searchValue) => {
    filteredTasks = tasks.filter((t) => {
        // отфильтровываем массив тасок, и передаем подходящие значения в массив filteredTasks, хранящийся в памяти вкладки
        return t.description.toLowerCase().includes(searchValue) // возвращаем таски, подходящие под ключ поиска
    });

    renderFilteredTasks(); // отрисовывает отфильтрованные таски
}

// --- дебаунс поиск, срабатывает при вводе в поле поиска ---
const debouncedSearch = debounce((searchValue) => {
    filteredTasks = tasks.filter((t) => {
        // отфильтровываем массив тасок, и передаем подходящие значения в массив filteredTasks, хранящийся в памяти вкладки
        return t.description.toLowerCase().includes(searchValue) // возвращаем таски, подходящие под ключ поиска
    });

    renderFilteredTasks(); // отрисовывает отфильтрованные таски
});


// --- генерация динамической HTML разметки под таски ---
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
            // метод, который применяет колбек функцию к элементам массива, и создает новый, измененный, массив
            if (t.id === task.id) { // находит нужную таску по ID
                t.completed = event.target.checked; // присваивает .checked = true в объекте таски
            }
            return t; // возвращает измененную таску
        });
        setLocalStorage(tasks); // записывает таски в localStorage

        if (searchInput.value.trim()) { // если в окне поиска что-то введено
            search(searchInput.value.toLowerCase().trim()); // отрисовывает таски по фильтру
        } else {
            renderTasks(); // отрисовывает все таски
        }
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

        if (searchInput.value.trim()) { // если в окне поиска что-то введено
            search(searchInput.value.toLowerCase().trim()); // отрисовывает таски по фильтру
        } else {
            renderTasks(); // отрисовывает все таски
        }
    })

    return taskItem;
}

// --- отрисовка тасок ---
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

// --- отрисовка отфильтрованных тасок ---
const renderFilteredTasks = () => {
    tasksContainer.innerHTML = ''; // очищает контейнер тасок

    if (filteredTasks.length === 0) { // если массив отфильтрованных тасок пуст, то
        tasksContainer.innerHTML = '<h3>No tasks found.</h3>'; // выведет эту HTML-разметку
        return; // остановит дальнейшее выполнение кода функции
    }

    filteredTasks.forEach((task) => { // для каждой таски в массиве тасок
        const taskItem = createTaskLayout(task); // для каждого объекта таски выполняется функция
        tasksContainer.append(taskItem) // выводит таску на страницу
    })
}