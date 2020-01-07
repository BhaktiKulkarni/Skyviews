import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AddBusinessPage } from './add-business.page';
// import { IonicRatingModule } from 'ionic-rating';

const routes: Routes = [
  {
    path: '',
    component: AddBusinessPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // IonicRatingModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AddBusinessPage]
})
export class AddBusinessPageModule {}
