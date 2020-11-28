import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js';

const $btnTheme = document.getElementById('btn-theme'),
	$form = document.getElementById('form'),
	$todoInput = document.getElementById('todo-input'),
	$todoList = document.getElementById('todo-list'),
	$todoLeft = document.getElementById('todo-left'),
	$todoFooter = document.getElementById('todo-footer');

Sortable.create($todoList);

let todoList = JSON.parse(localStorage.getItem('todoList')) || [];

const applyTheme = (theme) => {
	const icon = $btnTheme.firstElementChild;
	document.body.classList.remove(theme === 'dark' ? 'light' : 'dark');
	document.body.classList.add(theme);
	if (theme === 'dark') {
		icon.src = 'img/icon-sun.svg';
	} else {
		icon.src = 'img/icon-moon.svg';
	}
};

const toggleTheme = () => {
	const isDark = document.body.classList.contains('dark');
	applyTheme(isDark ? 'light' : 'dark');
	localStorage.setItem('theme', !isDark);
};

const changeThemeIcon = ({ matches }) => {
	// Si el tema se ha elegido, no hace nada
	if (localStorage.getItem('theme') !== null) {
		return;
	}
	// No hay un tema elegido, así que aplica la preferencia del sistema
	const icon = $btnTheme.firstElementChild;
	if (matches) {
		applyTheme('dark');
		icon.src = 'img/icon-sun.svg';
	} else {
		applyTheme('light');
		icon.src = 'img/icon-moon.svg';
	}
};

const addTodo = (text, id, completed) => {
	const todo = document.createElement('li');
	todo.className = `todo__item ${completed ? 'todo__item--completed' : ''}`;
	todo.setAttribute('data-id', id);
	todo.innerHTML = `
  <label class="checkbox">
    <input
      type="checkbox"
      ${completed ? 'checked' : ''}
      class="checkbox__hide"
      aria-label="Check todo"
    />
    <span class="checkbox__circle"></span>
  </label>
  <p class="todo__text">${text}</p>
  <button class="todo__delete" title="Delete">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
    >
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z"
      />
    </svg>
  </button>
  `;
	$todoList.appendChild(todo);
};

const addTodos = () => {
	todoList.forEach(({ text, id, completed }) => {
		addTodo(text, id, completed);
	});
};

const saveTodos = () => {
	localStorage.setItem('todoList', JSON.stringify(todoList));
};

const getCountItemsLeft = () => {
	return todoList.filter(({ completed }) => completed === false).length;
};

const updateLeftLegend = () => {
	$todoLeft.innerText = `${getCountItemsLeft()} items left`;
};

const showAlert = () => {
	const alert = document.createElement('div');
	alert.className = 'alert__overlay';
	alert.innerHTML = `
    <div class="alert">
      <p class="alert__text">Please enter a todo</p>
      <button class="alert__btn" id="alert-btn">Close</button>
    </div>
  `;
	document.body.appendChild(alert);
	document.getElementById('alert-btn').addEventListener('click', () => {
		closeAlert(alert);
	});
};

const closeAlert = (alert) => {
	alert.firstElementChild.classList.add('slideUpOut');
	alert.addEventListener('animationend', () => {
		alert.remove();
		$todoInput.focus();
	});
};

const handleSubmit = (e) => {
	e.preventDefault();
	const value = $todoInput.value.trim();
	if (value === '') {
		$todoInput.blur();
		showAlert();
		return;
	}
	let id = nanoid();
	addTodo(value, id);
	todoList.push({ id, text: value, completed: false });
	updateLeftLegend();
	$form.reset();
	saveTodos();
};

const markAsCompleted = (todo) => {
	const todoObj = todoList.find(({ id }) => id === todo.dataset.id);
	todoObj.completed = !todoObj.completed;
	if (todoObj.completed) {
		todo.classList.add('todo__item--completed');
	} else {
		todo.classList.remove('todo__item--completed');
	}
	updateLeftLegend();
};

const deleteTodo = (todo) => {
	const { id } = todo.dataset;
	todoList = todoList.filter((item) => item.id !== id);
	todo.remove();
	updateLeftLegend();
};

const handleTodoClick = ({ target }) => {
	const todo = target.closest('.todo__item');
	const isCheck = target.classList.contains('checkbox__hide');
	if (isCheck) {
		markAsCompleted(todo);
		saveTodos();
		return;
	}
	const isDelete = target.closest('.todo__delete');
	if (isDelete) {
		deleteTodo(todo);
		saveTodos();
	}
};

const clearCompleted = () => {
	Array.from($todoList.children).forEach((todo) => {
		if (todo.classList.contains('todo__item--completed')) {
			todo.remove();
		}
	});
	todoList = todoList.filter(({ completed }) => completed === false);
	saveTodos();
};

const markCurrentFilter = (filters, currentFilter) => {
	filters = Array.from(filters.children);
	filters.forEach((filter) => {
		if (filter.classList.contains(currentFilter)) {
			filter.classList.add('todo__filter--applied');
		} else {
			filter.classList.remove('todo__filter--applied');
		}
	});
};

const applyFilter = (filter) => {
	const todos = Array.from($todoList.children);
	if (filter === 'all') {
		todos.forEach((todo) => (todo.style.display = 'grid'));
	} else if (filter === 'active') {
		todos.forEach((todo) => {
			if (todo.classList.contains('todo__item--completed')) {
				todo.style.display = 'none';
			} else {
				todo.style.display = 'grid';
			}
		});
	} else {
		todos.forEach((todo) => {
			if (todo.classList.contains('todo__item--completed')) {
				todo.style.display = 'grid';
			} else {
				todo.style.display = 'none';
			}
		});
	}
};

const handleFooterClick = ({ target }) => {
	if (target.classList.contains('todo__action--clear')) {
		clearCompleted();
	} else if (target.classList.contains('todo__filter')) {
		markCurrentFilter(target.parentElement, target.classList[2]);
		applyFilter(target.classList[2].substring(14));
	}
};

$btnTheme.addEventListener('click', toggleTheme);
$form.addEventListener('submit', handleSubmit);
$todoList.addEventListener('click', handleTodoClick);
$todoFooter.addEventListener('click', handleFooterClick);
document.addEventListener('DOMContentLoaded', () => {
	const isDark = JSON.parse(localStorage.getItem('theme'));
	const mql = matchMedia('(prefers-color-scheme: dark)');
	if (isDark === null) {
		applyTheme(mql.matches ? 'dark' : 'light');
	} else {
		applyTheme(isDark ? 'dark' : 'light');
	}
	// Escucha cambios en la preferencia de color del S.O. para cambiar el icono y aplicar el nuevo tema
	mql.addListener(changeThemeIcon);
	if (todoList.length > 0) {
		addTodos();
		updateLeftLegend();
	}
});
