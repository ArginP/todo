const TASKS_KEY = 'tasks';

export const setLocalStorage = (tasks) => { // записывает массив тасок в LocalStorage
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export const getLocalStorage = () => { // вынимает массив тасок из LocalStorage
    return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
}

export const getTimeFormat = (time) => {
    return Intl.DateTimeFormat("ru-RU", {
        // приводит формат даты к интернациональному стандарту в соответствии с локалью и настройками
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(time);
}

export const debounce = (func, ms = 300) => {
    let timerID;
    // при вызове функции debounce создается таймер
    return (...args) => {
        clearTimeout(timerID);
        // если до истечения таймера функция вызывается снова, то таймер сбрасывается
        timerID = setTimeout(() => func.apply(this, args), ms);
        // по окончании таймера исходная функция func возвращается в debounce со всеми исходными аргументами
        // также можно вместе с функцией func передать кастомное время задержки в ms
    };
};