import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IndexedDbService } from 'src/app/services/IndexedDB.service';
import { WebServiceWorker } from 'src/app/services/WebServiceWorker.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit {
  title = 'todo-reminder';
  todos: Array<Todo> = [];
  doneTodos: Array<Todo> = [];
  expiredTodos: Array<Todo> = [];
  nowPlusOneMinute = new Date(new Date().getTime() + 10000);
  todo = { text: '', done: false, reminder: this.nowPlusOneMinute, sentPush: false };
  notificationPermission = Notification.permission;
  speakButtonText = 'Speak';
  deferredPrompt: any;
  customNotification: any = null;

  isLoaded = false;

  isNewAppVersionAvailable: boolean = false;
  newAppUpdateAvailableSubscription!: Subscription;

  constructor(private indexedDbService: IndexedDbService, private webServiceWorker: WebServiceWorker) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('ngsw-worker.js').then(registration => {
        console.log('Custom ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(err => {
        console.error('Custom ServiceWorker registration failed: ', err);
      });
    }

    setInterval(() => {
      this.todos.filter(todo => todo.sentPush === false).forEach(todo => {
        if (todo.reminder && new Date(todo.reminder).getTime() - new Date().getTime() <= 5000) {
          if (Notification.permission === 'granted') {
            todo.sentPush = true;
            this.updateTodoInDb(todo);
            new Notification('Todo Reminder', {
              body: todo.text,
              icon: 'assets/icons/icon-72x72.png',
            });
            console.log('Push notification sent:', todo.text);
          }
        }
      });
    }, 1000);

    navigator.serviceWorker.addEventListener('message', event => {
      console.log('Push message received:', event.data);
    });
  }

  async ngOnInit() {
    this.checkIfAppUpdated();
    this.todos = await this.indexedDbService.getAllTodos();
    this.doneTodos = await this.indexedDbService.getAllDoneTodos();
    this.expiredTodos = await this.indexedDbService.getAllExpiredTodos();
    setInterval(() => this.updateCountdowns(), 1000);
    setTimeout(() => this.isLoaded = true, 1000);
  }

  checkIfAppUpdated() {
    this.newAppUpdateAvailableSubscription = this.webServiceWorker.$isAnyNewUpdateAvailable.subscribe((versionAvailableFlag: boolean) => {
      this.isNewAppVersionAvailable = versionAvailableFlag;
    });
  }

  refreshApp() {
    window.location.reload();
  }

  async addTodo() {
    if (this.todo.text.trim()) {
      this.todos.push({ ...this.todo });
      await this.indexedDbService.addTodo({ ...this.todo });
      this.nowPlusOneMinute = new Date(new Date().getTime() + 10000);
      this.todo = { text: '', done: false, reminder: this.nowPlusOneMinute, sentPush: false };
      if (Notification.permission === 'default' && 'Notification' in window) {
        Notification.requestPermission();
      }
    }
  }

  async deleteTodo(index: number) {
    const [deletedTodo] = this.doneTodos.splice(index, 1);
    await this.indexedDbService.deleteDoneTodoByText(deletedTodo.text);
  }

  async deleteExpired(index: number) {
    const [deletedExpiredTodo] = this.expiredTodos.splice(index, 1);
    await this.indexedDbService.deleteExpiredTodoByText(deletedExpiredTodo.text);
  }

  async done(index: number) {
    const [doneTodo] = this.todos.splice(index, 1);
    doneTodo.done = true;
    this.doneTodos.push(doneTodo);
    await this.indexedDbService.addDoneTodo(doneTodo);
    await this.indexedDbService.deleteTodoByText(doneTodo.text);
  }

  async moveToDone(index: number) {
    const [expiredTodo] = this.expiredTodos.splice(index, 1);
    expiredTodo.done = true;
    this.doneTodos.push(expiredTodo);
    await this.indexedDbService.addDoneTodo(expiredTodo);
    await this.indexedDbService.deleteExpiredTodoByText(expiredTodo.text);
  }

  async updateTodoInDb(todo: any) {
    await this.indexedDbService.updateTodo(todo);
  }

  async updateLocalStorage() {
    await this.indexedDbService.updateTodo;
    await this.indexedDbService.updateDoneTodo;
    await this.indexedDbService.updateExpiredTodo;
  }

  speechToText() {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    this.speakButtonText = 'Listening...';
    recognition.onend = () =>
      (this.speakButtonText = 'Speak');
    recognition.onresult = (event: any) => {
      this.todo.text = event.results[0][0].transcript;
    };
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

  ngOnDestroy() {
    this.newAppUpdateAvailableSubscription?.unsubscribe();
  }
}

type Todo = {
  text: string;
  done: boolean;
  reminder?: Date;
  timeLeft?: string;
  sentPush?: boolean;
};
