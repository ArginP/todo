const TASKS_KEY = 'tasks';

export const setLocalStorage = (tasks) => { // записывает массив тасок в LocalStorage
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export const getLocalStorage = () => { // вынимает массив тасок из LocalStorage
    return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
}