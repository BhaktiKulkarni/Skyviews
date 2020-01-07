import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router/src/utils/preactivation';
import { Auth } from 'src/auth';
import { RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TravellerGuardService implements CanActivate{
  path: import("@angular/router").ActivatedRouteSnapshot[];
  route: import("@angular/router").ActivatedRouteSnapshot;
  state: import("@angular/router").RouterStateSnapshot;
  constructor(private auth: Auth, private router: Router) { }

  canActivate(): boolean {
    var isAuth= this.auth.isTravelerAuthenticated();
    console.log('Guard => canActivate',isAuth);
    return isAuth;
  }
  // canActivate( state: RouterStateSnapshot) {
  //   var isAuth= this.auth.isTravelerAuthenticated();
  //   console.log('Guard => canActivate', isAuth);
  //   if (isAuth) {
  //       // logged in so return true
  //       return true;
  //   }
  //   else {
  //     this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
  //     return false;
  //   }
  //   // not logged in so redirect to login page with the return url and return false
  // }
}
