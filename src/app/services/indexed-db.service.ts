import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MyDB extends DBSchema {
  todos: {
    key: string;
    value: { text: string; done: boolean; reminder: Date; sentPush: boolean; timeLeft?: string };
  };
  doneTodos: {
    key: string;
    value: { text: string; done: boolean; reminder: Date; sentPush: boolean; timeLeft?: string };
  };
  expiredTodos: {
    key: string;
    value: { text: string; done: boolean; reminder: Date; sentPush: boolean; timeLeft?: string };
  };
}

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private dbPromise: Promise<IDBPDatabase<MyDB>>;

  constructor() {
    this.dbPromise = openDB<MyDB>('todo-db', 1, {
      upgrade(db) {
        db.createObjectStore('todos', { keyPath: 'text' });
        db.createObjectStore('doneTodos', { keyPath: 'text' });
        db.createObjectStore('expiredTodos', { keyPath: 'text' });
      }
    });
  }

  async getAllTodos(): Promise<any[]> {
    return (await this.dbPromise).getAll('todos');
  }

  async getAllDoneTodos(): Promise<any[]> {
    return (await this.dbPromise).getAll('doneTodos');
  }

  async getAllExpiredTodos(): Promise<any[]> {
    return (await this.dbPromise).getAll('expiredTodos');
  }

  async addTodo(todo: any): Promise<any> {
    return (await this.dbPromise).add('todos', todo);
  }

  async updateTodo(todo: any): Promise<any> {
    return (await this.dbPromise).put('todos', todo);
  }

  async deleteTodoByText(text: string): Promise<void> {
    return (await this.dbPromise).delete('todos', text);
  }

  async addDoneTodo(todo: any): Promise<any> {
    return (await this.dbPromise).add('doneTodos', todo);
  }

  async updateDoneTodo(todo: any): Promise<any> {
    return (await this.dbPromise).put('doneTodos', todo);
  }

  async deleteDoneTodoByText(text: string): Promise<void> {
    return (await this.dbPromise).delete('doneTodos', text);
  }

  async addExpiredTodo(todo: any): Promise<any> {
    return (await this.dbPromise).add('expiredTodos', todo);
  }

  async updateExpiredTodo(todo: any): Promise<any> {
    return (await this.dbPromise).put('expiredTodos', todo);
  }

  async deleteExpiredTodoByText(text: string): Promise<void> {
    return (await this.dbPromise).delete('expiredTodos', text);
  }
}
