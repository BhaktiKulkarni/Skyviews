import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) { }

 // url = 'https://moderni-projects.in/projects/wordpress/skyviews/wp-api/skyview-api.php?action=';
  url = 'http://ec2-34-207-105-29.compute-1.amazonaws.com/skyviews/wp-api/skyview-api.php?action=';

  userSignup(params) {
    // console.log('Sign up params' , params);
    let postData = new FormData();
    postData.append('user_email' , params.user_email);
    postData.append('user_password' , params.user_password);
    postData.append('fullname', params.fullname);
    postData.append('user_role', params.role);
    console.log(postData);
    return  this.http.post(this.url + 'user_signup',  postData).pipe(catchError(this.handleError));
  }

  userLogin(params) {
    console.log('login params' ,params);
    let postData = new FormData();
    postData.append('user_email' , params.user_email);
    postData.append('user_password' , params.user_password);
    postData.append('user_role', params.user_role);
    return this.http.post(this.url + 'user_login', postData).pipe(catchError(this.handleError));
  }

  switchUserRoles(user_email, password, role) {
    let postData = new FormData();
    postData.append('user_email', user_email);
    postData.append('user_password', password);
    postData.append('user_role', role);
    return this.http.post(this.url + 'switch_role', postData).pipe(catchError(this.handleError));
  }


  // businessSignup(params) {
  //   // console.log('Business Sign up params', params);
  //   let postData = new FormData();
  //   postData.append('user_email' , params.user_email);
  //   postData.append('user_password' , params.user_password);
  //   postData.append('fullname', params.fullname);
  //   return  this.http.post(this.url + 'business_signup', postData).pipe(catchError(this.handleError));
  // }

  // businessLogin(params) {
  //   // console.log('Business login params', params);
  //   let postData = new FormData();
  //   postData.append('user_email' , params.user_email);
  //   postData.append('user_password' , params.user_password);
  //   postData.append('user_role', params.user_role);
  //   return this.http.post(this.url + 'business_login', postData).pipe(catchError(this.handleError));
  // }

  shareLink(params) {
    // console.log('shareLink params', params);
    let postData = new FormData();
    postData.append('user_email', params.user_email);
    postData.append('otp', params.otp);
   // console.log('shareLink postData', postData);
    return this.http.post(this.url + 'verification', postData).pipe(catchError(this.handleError));
  }

  forgotPassword(email) {
    const postData = new FormData();
    postData.append('user_email', email);
    return this.http.post(this.url + 'forgot_password_otp', postData).pipe(catchError(this.handleError));
  }

  resetPassword(params) {
    console.log('reset Password params', params);
    const postData = new FormData();
    postData.append('user_email', params.user_email);
    postData.append('otp', params.otp);
    postData.append('new_password', params.newPassword);
    return this.http.post(this.url + 'update_password', postData).pipe(catchError(this.handleError));
    //1.user_id 2.user_otp 3.new_password
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      // 'Something bad happened; please try again later.',
      error);
  };
}
