import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit {
  title = 'todo-reminder';
  todos: Array<Todo> = [];
  doneTodos: Array<Todo> = [];
  todo = { text: '', done: false, reminder: new Date() };

  ngOnInit() {
    this.todos = JSON.parse(localStorage.getItem('todos') || '[]');
    this.doneTodos = JSON.parse(localStorage.getItem('doneTodos') || '[]');
    setInterval(() => this.updateCountdowns(), 1000);
  }

  addTodo() {
    if (this.todo.text.trim()) {
      this.todos.push({ ...this.todo });
      this.updateLocalStorage();
      this.todo = { text: '', done: false, reminder: new Date() };
    }
  }

  deleteTodo(index: number) {
    this.doneTodos.splice(index, 1);
    this.updateLocalStorage();
  }

  done(index: number) {
    this.todos[index].done = true;
    this.doneTodos.push(this.todos[index]);
    this.todos.splice(index, 1);
    this.updateLocalStorage();
  }

  undone(index: number) {
    this.doneTodos[index].done = false;
    this.todos.push(this.doneTodos[index]);
    this.doneTodos.splice(index, 1);
    this.updateLocalStorage();
  }

  updateLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
    localStorage.setItem('doneTodos', JSON.stringify(this.doneTodos));
  }

  updateCountdowns() {
    const now = new Date().getTime();
    this.todos.forEach(todo => {
      if (todo.reminder) {
        const timeLeft = new Date(todo.reminder).getTime() - now;
        todo.timeLeft = this.formatTimeLeft(timeLeft);
      }
    });
  }

  formatTimeLeft(timeLeft: number) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }
}

type Todo = {
  text: string;
  done: boolean;
  reminder?: Date;
  timeLeft?: string;
};
