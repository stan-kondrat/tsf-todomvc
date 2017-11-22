import { TodoDataService } from './todo.data';
const template = require('./todo.html');

const ENTER = 13;

export class Todo {
	id: number;
	title: string = '';
	completed: boolean = false;

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}

export class TodoComponent {
	public $template = template;
	public todos: Todo[] = [];
	private todoDataService;

	constructor() {
		this.todoDataService = new TodoDataService();
		this.todos = this.todoDataService.getAllTodos();
	}

	public addTodo(event) {
		if (event.which == ENTER) {
			this.todoDataService.addTodo(new Todo({title: event.target.value}));
			event.target.value = '';
		}
	}

	public toggleTodoComplete(event, todo) {
		this.todoDataService.toggleTodoComplete(todo);
	}

	public removeTodo(event, todo) {
		this.todoDataService.deleteTodoById(todo.id);
		this.todos = this.todoDataService.getAllTodos();
	}
}
