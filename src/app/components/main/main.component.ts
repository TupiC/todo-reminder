import { Component } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
})
export class MainComponent {
  title = 'todo-reminder';
  todos: Array<Todo> = [];
  doneTodos: Array<Todo> = [];
  todo = { text: '', done: false, reminder: new Date() };


  addTodo() {
    this.todos.push(this.todo);
    this.todo = { text: '', done: false, reminder: new Date() };
  }

  deleteTodo(index: number) {
    this.doneTodos.splice(index, 1);
  }

  clearTodos() {
    this.todos = [];
  }

  done(index: number) {
    this.todos[index].done = true;
    this.doneTodos.push(this.todos[index]);
    this.todos.splice(index, 1);
  }

  undone(index: number) {
    this.doneTodos[index].done = false;
    this.todos.push(this.doneTodos[index]);
    this.doneTodos.splice(index, 1);
  }

  get todosCount() {
    return this.todos.length;
  }
}

type Todo = {
  text: string;
  done: boolean;
  reminder?: Date;
};