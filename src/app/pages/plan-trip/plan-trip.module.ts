import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ChartsModule } from 'ng2-charts';
import { IonicModule } from '@ionic/angular';
import { PlanTripPage } from './plan-trip.page';

const routes: Routes = [
  {
    path: '',
    component: PlanTripPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ChartsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [PlanTripPage]
})
export class PlanTripPageModule {}
