import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/toPromise';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
// import { resolve } from 'dns';


@Injectable()
export class Auth {
  isTravelerLoggedIn = false;
  isBusinessLoggedIn = false;
  user: any;
  //  role: {traveler: boolean; business: boolean};
  role: any = { traveler: [], business: [] };
  authStateTraveler = new BehaviorSubject(true);
  authStateBusiness = new BehaviorSubject(true);

  //  forgetPasswordParams: { user_id: any; user_otp: any; newPassword: any; };

  constructor(public http: HttpClient, public storage: Storage, public platform: Platform) {
    this.platform.ready().then(() => {
      this.gettravellerUser();
      this.getbusinessUser();
    });
  }

  login(user, role) {
    if (role == 'traveler') {
      return this.storage.set('travellerUser', user).then(() => {
        this.isTravelerLoggedIn = true;
        this.user = user;
        this.role.traveler = true;
        console.log('auth.ts => login => this.user, this.role.traveler', this.user, this.role.traveler);
        this.authStateTraveler.next(false);
      });
    }
    //    console.log(role);
    else {
      return this.storage.set('businessUser', user).then(() => {
        this.isBusinessLoggedIn = true;
        this.user = user;
        this.role.business = true;
        console.log('auth.ts => login => this.user, this.role.traveler', this.user, this.role.traveler)
        this.authStateBusiness.next(false);
      });
    }
    //    console.log('auth.ts => login => this.user, this.isLoggedIn', this.user, this.isLoggedIn)
  }

  logout(role) {
    if (role == 'traveler') {
      return this.storage.remove('travellerUser').then(() => {
        this.isTravelerLoggedIn = false;
        this.user = null;
        this.role.traveler = false;
        console.log('auth.ts => logout => this.user, this.role.traveler', this.user, this.role.traveler)
        this.authStateTraveler.next(true);
      });
    }
    else {
      return this.storage.remove('businessUser').then(() => {
        this.isBusinessLoggedIn = false;
        this.user = null;
        this.role.traveler = false;
        console.log('auth.ts => logout => this.user, this.role.traveler', this.user, this.role.traveler)
        this.authStateBusiness.next(true);
      });
    }
    // return new Promise((reject, resolve) => {
    //     this.storage.remove('user').then(() => {
    //         this.isLoggedIn = false;
    //         this.user = null;
    //      //   console.log('auth.ts => logout => this.user, this.isLoggedIn', this.user, this.isLoggedIn);
    //         resolve(this.user);
    //     },
    //     error => {
    //         reject(error);
    //     });
    // });
  }

  getUser(role) {

    if (role == 'travellerUser') {

      return this.storage.get('travellerUser').then(user => {
        this.user = user;
        if (user) {
          this.authStateTraveler.next(false);
        }
        console.log('auth.ts => getuser => this.user, this.role.traveler', this.user)
      });
    }
    else {
      return this.storage.get('businessUser').then(user => {
        this.user = user;
        if (user) {
          this.authStateBusiness.next(false);
        }
        console.log('auth.ts => getuser => this.user, this.role.traveler', this.user)

      });
    }
  }

  gettravellerUser() {
    return this.storage.get('travellerUser').then(user => {
      this.user = user;
      if (user) {
        this.authStateTraveler.next(false);
      }
      console.log('auth.ts => getuser => this.user', this.user);
    });
  }

  getbusinessUser() {
    return this.storage.get('businessUser').then(user => {
      this.user = user;
      if (user) {
        this.authStateBusiness.next(false);
      }
      console.log('auth.ts => getuser => this.user', this.user);
    });

  }
  isTravelerAuthenticated() {
    //console.log('auth.ts => isAuthenticated =>  this.isLoggedIn', this.isLoggedIn);
    // var isLoggedIn: any = {travelerLoggedIn: Boolean, businessLoggedIn: Boolean};
    // isLoggedIn.travelerLoggedIn.push(this.isTravelerLoggedIn);
    // isLoggedIn.businessLoggedIn.push(this.isBusinessLoggedIn);
    // console.log("TCL: Auth -> isAuthenticated -> isLoggedIn", isLoggedIn);
    return this.authStateTraveler.value;
  }

  isBusinessAuthenticated() {
    return this.authStateBusiness.value;
  }
}