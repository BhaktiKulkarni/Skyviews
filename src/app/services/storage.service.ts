import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(public storage: Storage) { }

  setSavedPlace(place, userid) {
    console.log("TCL: StorageService -> setSavedPlace -> place", place);
    return this.storage.set('savedPlace', place);
  }

  getSavedPlace() {
    return this.storage.get('savedPlace');
  }
}
