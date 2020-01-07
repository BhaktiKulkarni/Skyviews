import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TravellerGuardService } from './guards/traveler-guard.service';
import { BusinessGuardService } from './guards/business-guard.service';

const routes: Routes = [
//  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', loadChildren: './pages/landing/landing.module#LandingPageModule' },
  { path: 'pop-up', loadChildren: './pages/pop-up/pop-up.module#PopUpPageModule' },
  { path: 'place-details', loadChildren: './pages/place-details/place-details.module#PlaceDetailsPageModule' },
  { path: 'login', 
    loadChildren: './pages/login/login/login.module#LoginPageModule',
    canActivate: [TravellerGuardService]
  },
  { path: 'register', loadChildren: './pages/login/register/register.module#RegisterPageModule' },
  { path: 'plan-trip', loadChildren: './pages/plan-trip/plan-trip.module#PlanTripPageModule' },
  { path: 'saved-places', loadChildren: './pages/saved-places/saved-places.module#SavedPlacesPageModule' },
  { path: 'user-profile', loadChildren: './pages/user-profile/user-profile.module#UserProfilePageModule' },
  { path: 'preferences', loadChildren: './pages/preferences/preferences.module#PreferencesPageModule' },
  { path: 'add-business', loadChildren: './pages/business/add-business/add-business.module#AddBusinessPageModule' },
  { path: 'list-business', loadChildren: './pages/business/list-business/list-business.module#ListBusinessPageModule' },
  { path: 'business-login',
    loadChildren: './pages/business/business-login/business-login.module#BusinessLoginPageModule',
    canActivate: [BusinessGuardService]
  },
  // tslint:disable-next-line: max-line-length
  { path: 'business-registration', loadChildren: './pages/business/business-registration/business-registration.module#BusinessRegistrationPageModule' },
  { path: 'map', loadChildren: './pages/map/map.module#MapPageModule' },
  { path: 'nav-place', loadChildren: './pages/nav-place/nav-place.module#NavPlacePageModule' },
  { path: 'about', loadChildren: './pages/about/about.module#AboutPageModule' },
  { path: 'island-events', loadChildren: './pages/island-events/island-events.module#IslandEventsPageModule' },
  { path: 'category-places', loadChildren: './pages/landing/category-places/category-places.module#CategoryPlacesPageModule' },
  { path: 'comments', loadChildren: './pages/place-details/comments/comments.module#CommentsPageModule' },
  { path: 'modal-page', loadChildren: './pages/modal-page/modal-page.module#ModalPagePageModule' },
  { path: 'airport-modal', loadChildren: './pages/airport-modal/airport-modal.module#AirportModalPageModule' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
