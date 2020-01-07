import { Injectable } from '@angular/core';
import { Auth } from 'src/auth';
import { CanActivate } from '@angular/router/src/utils/preactivation';

@Injectable({
  providedIn: 'root'
})
export class BusinessGuardService implements CanActivate{
  path: import("@angular/router").ActivatedRouteSnapshot[];
  route: import("@angular/router").ActivatedRouteSnapshot;
  isAuth = this.auth.isBusinessAuthenticated();

  constructor(public auth: Auth) { }

  canActivate(): boolean {
    console.log('Guard => canActivate',this.isAuth);
    return this.isAuth;
  }
}
