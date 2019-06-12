import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './pages/session/login/login.module#LoginPageModule' },
  { path: 'register', loadChildren: './pages/session/register/register.module#RegisterPageModule' },
  { path: 'dashboard', loadChildren: './pages/session/dashboard/dashboard.module#DashboardPageModule' },
  { path: 'panoramic-img-view', loadChildren: './pages/panoramic-img-view/panoramic-img-view.module#PanoramicImgViewPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
