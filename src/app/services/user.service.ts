import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
private userData: BehaviorSubject<Object> = new BehaviorSubject<Object>(null);
  castUser = this.userData.asObservable();

  constructor() {

   }
   setObservableData(data) {
    this.userData.next(data);
  }
}
