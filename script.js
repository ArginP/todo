import {setLocalStorage, getLocalStorage, getTimeFormat, debounce} from "./helpers.js";

const addTaskInput = document.querySelector('[data-add-task-input]');
const addTaskButton = document.querySelector('[data-add-task-button]');
const searchInput = document.querySelector('[data-search-input]');
const tasksContainer = document.querySelector('[data-tasks-container]');
const taskTemplate = document.querySelector('[data-task-template]');
const clearSearchInputBtn = document.querySelector('[data-search-btn]');
const taskCountWidget = document.querySelector('[data-task-count]');
const deleteAllTasksBtn = document.querySelector('[data-delete-all-btn]');

let tasks = getLocalStorage();
let filteredTasks = [];

// --- Логика создания новой таски ---
const addTask = () => {
    if (addTaskInput.value.trim()) { // проверяет что поле текста таски не пустое
        const task = { // задает объект таски
            id: Date.now(), // костыль псевдоуникального ID
            description: addTaskInput.value.trim(), // текст таски без пробелов с концов
            completed: false, // по-умолчанию не выполнено
            createdAt: getTimeFormat(new Date()), // дата создания таски
            // getTimeFormat() приводит формат отображаемого времени к интернациональному стандарту, см. helpers.js
        }

        tasks.push(task); // добавляет таску в конец массива тасок
        setLocalStorage(tasks); // записывает этот массив в localStorage
        addTaskInput.value = ''; // очищает поле ввода

        countTasks();
        whichRenderTasks();
    }
}

// --- Обработчики событий добавления новой таски ---
addTaskButton.addEventListener('click', addTask) // обработчик по клику на кнопку
addTaskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { // обработчик по нажатию клавиши Enter
        addTask();
    }
})

// --- Поиск без задержки, срабатывает при нажатии кнопок ---
const search = (searchValue) => {
    filteredTasks = tasks.filter((t) => {
        // отфильтровывает массив тасок, и передает подходящие значения в массив filteredTasks, хранящийся в памяти вкладки
        return t.description.toLowerCase().includes(searchValue); // возвращает таски, подходящие под ключ поиска
    });

    renderFilteredTasks(); // отрисовывает отфильтрованные таски
}

// --- Дебаунс поиск, срабатывает при вводе в поле поиска ---
const debouncedSearch = debounce((searchValue) => {
    search(searchValue);
})

// --- Обработчик ввода в поле поиска ---
searchInput.addEventListener('input', (event) => {
    debouncedSearch(event.target.value.toLowerCase().trim());
})

// --- Обработчик кнопки очистки поля поиска ---
clearSearchInputBtn.addEventListener('click', () => {
    searchInput.value = ''; // очищает поле поиска
    renderTasks(); // отрисовывает все таски
})

// --- Обработчик кнопки удалить все выполненные таски ---
deleteAllTasksBtn.addEventListener('click', () => {
    tasks = tasks.filter((t) => {
        if (t.completed === true) { // если таска в массиве помечена как "выполненная", присваивает ей стиль
            return document.querySelector(`.${CSS.escape(t.id)}`).classList.add('deleted');
        } else { // если нет, то возвращает ее в новый массив
            return t;
        }
    });

    setLocalStorage(tasks); // перезаписывает таски в localStorage за исключением выполненных

    countTasks();
    setTimeout(whichRenderTasks, 400); // дает время проиграться анимации удаления, потом отрисовывает таски
})

// --- Логика счетчика тасок ---
const countTasks = () => {
    let finishedTasks = tasks.filter((t) => { // фильтрует массив тасок, вытягивает .completed = true
        return t.completed;
    })

    taskCountWidget.innerText = `Completed: ${finishedTasks.length}/${tasks.length}`;
    // вписывает актуальную информацию в блок текста счетчика тасок
}

// --- Генерация динамической HTML разметки под таски ---
const createTaskLayout = (task) => {
    const taskItem = document.importNode(taskTemplate.content, true);
    // получает HTML нод из темплейта, true = с вложениями

    const taskCheckbox = taskItem.querySelector('[data-task-checkbox]');
    taskCheckbox.checked = task.completed; // чекбокс будет соответствовать значению completed в объекте таски

    const taskDescription = taskItem.querySelector('[data-task-description]');
    taskDescription.textContent = task.description; // описание таски берется из значения description в объекте таски

    const taskTimeCreated = taskItem.querySelector('[data-task-time-created]');
    taskTimeCreated.textContent = task.createdAt; // дата создания берется их значения createdAt

    const taskDelete = taskItem.querySelector('[data-task-delete]');
    taskDelete.disabled = !task.completed;
    // кнопка удалить заблокирована, пока таска не помечена как выполненная в значении completed объекта таски

    // отслеживает ивент изменения состояния checked галочки
    taskCheckbox.addEventListener('change', (event) => {
        tasks = tasks.map((t) => {
            // метод, который применяет колбек функцию к элементам массива, и создает новый, измененный, массив
            if (t.id === task.id) { // находит нужную таску по ID
                t.completed = event.target.checked; // присваивает .checked = true в объекте таски
            }
            return t; // возвращает измененную таску
        });

        setLocalStorage(tasks); // записывает таски в localStorage

        countTasks();
        whichRenderTasks();
    })

    // отслеживает клик по кнопке удалить таску
    taskDelete.addEventListener('click', () => {
        document.querySelector(`.${CSS.escape(task.id)}`).classList.add('deleted');
        // по добавленному классу c ID таски находит удаляемый элемент, и присваивает ему класс
        tasks = tasks.filter((t) => {
            // метод, который фильтрует массива на основании параметров, заданных колбеком
            if (t.id !== task.id) { // фильтрует по ID т.о., чтобы фильтр прошли все таски, кроме удаляемой
                return t; // возвращает все элементы массива, ID которых НЕ СООТВЕТСТВУЕТ ID удаляемой таски
            }
        });

        setLocalStorage(tasks); // записывает таски в localStorage

        countTasks();
        setTimeout(whichRenderTasks, 400); // дает время проиграться анимации удаления, потом отрисовывает таски
    })

    return taskItem;
}

// --- Отрисовка тасок ---
const renderTasks = () => {
    tasksContainer.innerHTML = ''; // очищает контейнер тасок

    if (tasks.length === 0) { // если массив тасок пуст, то
        tasksContainer.innerHTML = '<h3>No tasks yet.</h3>'; // выведет эту HTML-разметку
        return; // остановит дальнейшее выполнение кода функции
    }

    tasks.forEach((task) => { // для каждой таски в массиве тасок
        const taskItem = createTaskLayout(task); // для каждого объекта таски выполняется функция
        tasksContainer.append(taskItem) // выводит таску на страницу
        document.querySelector('.tasks-container').lastElementChild.classList.add(task.id);
        // для каждого сгенерированного элемента таски присваивает класс в виде его ID
    })
}

// --- Отрисовка отфильтрованных тасок ---
const renderFilteredTasks = () => {
    tasksContainer.innerHTML = ''; // очищает контейнер тасок

    if (filteredTasks.length === 0) { // если массив отфильтрованных тасок пуст, то
        tasksContainer.innerHTML = '<h3>No tasks found.</h3>'; // выведет эту HTML-разметку
        return; // остановит дальнейшее выполнение кода функции
    }

    filteredTasks.forEach((task) => { // для каждой таски в массиве тасок
        const taskItem = createTaskLayout(task); // для каждого объекта таски выполняется функция
        tasksContainer.append(taskItem) // выводит таску на страницу
        document.querySelector('.tasks-container').lastElementChild.classList.add(task.id);
        // для каждого сгенерированного элемента таски присваивает класс в виде его ID
    })
}

// --- Какой рендер использовать, для всех тасок, или фильтрованных? ---
const whichRenderTasks = () => {
    if (searchInput.value.trim()) { // если в окне поиска что-то введено
        search(searchInput.value.toLowerCase().trim()); // отрисовывает таски по фильтру
    } else {
        renderTasks(); // отрисовывает все таски
    }
}

countTasks(); // отрисовать интерфейс при первоначальной загрузке страницы
whichRenderTasks();
