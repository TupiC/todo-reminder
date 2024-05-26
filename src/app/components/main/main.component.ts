import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit {
  title = 'todo-reminder';
  todos: Array<Todo> = [];
  doneTodos: Array<Todo> = [];
  expiredTodos: Array<Todo> = [];
  todo = { text: '', done: false, reminder: new Date(), sentPush: false };

  //log service worker registration/error
  constructor() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('ngsw-worker.js').then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(err => {
        console.error('ServiceWorker registration failed: ', err);
      });
    }

    setInterval(() => {
      this.todos.filter(todo => todo.sentPush === false).forEach(todo => {
        if (todo.reminder && new Date(todo.reminder).getTime() - new Date().getTime() <= 5000) {
          if (Notification.permission === 'granted') {
            todo.sentPush = true;
            this.updateLocalStorage();
            new Notification('Todo Reminder', {
              body: todo.text,
              icon: 'assets/icons/icon-72x72.png',
            });
          }
        }
      });
    }, 1000);
  }

  ngOnInit() {
    this.todos = JSON.parse(localStorage.getItem('todos') || '[]');
    this.doneTodos = JSON.parse(localStorage.getItem('doneTodos') || '[]');
    setInterval(() => this.updateCountdowns(), 1000);
  }

  addTodo() {
    if (this.todo.text.trim()) {
      this.todos.push({ ...this.todo });
      this.updateLocalStorage();
      this.todo = { text: '', done: false, reminder: new Date(), sentPush: false };
      //ask for permission to send notifications but only if the browser supports it and the user hasn't already denied it
      if (Notification.permission === 'default' && 'Notification' in window) {
        Notification.requestPermission();
      }
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

  moveToDone(index: number) {
    this.expiredTodos[index].done = true;
    this.doneTodos.push(this.expiredTodos[index]);
    this.expiredTodos.splice(index, 1);
    this.updateLocalStorage();
  }

  updateLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
    localStorage.setItem('doneTodos', JSON.stringify(this.doneTodos));
    localStorage.setItem('expiredTodos', JSON.stringify(this.expiredTodos));
  }

  updateCountdowns() {
    const now = new Date().getTime();
    this.todos.forEach(todo => {
      if (todo.reminder) {
        const timeLeft = new Date(todo.reminder).getTime() - now;
        if (timeLeft <= 0) {
          this.expiredTodos.push(todo);
          this.todos = this.todos.filter(t => t !== todo);
          this.updateLocalStorage();
        }
        todo.timeLeft = this.formatTimeLeft(timeLeft);
      }
    });
  }

  formatTimeLeft(timeLeft: number) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    if (timeLeft <= 0) {
      return '0s';
    }
    return `${hours}h ${minutes}m ${seconds}s`;
  }
}

type Todo = {
  text: string;
  done: boolean;
  reminder?: Date;
  timeLeft?: string;
  sentPush?: boolean;
};
