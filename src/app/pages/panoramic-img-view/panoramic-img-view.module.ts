import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { RicohView } from 'ricoh-theta-viewer';
import { IonicModule } from '@ionic/angular';

import { PanoramicImgViewPage } from './panoramic-img-view.page';

const routes: Routes = [
  {
    path: '',
    component: PanoramicImgViewPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PanoramicImgViewPage]
})
export class PanoramicImgViewPageModule {}
