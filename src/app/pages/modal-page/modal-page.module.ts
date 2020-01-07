import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ModalPagePage } from './modal-page.page';


const routes: Routes = [
  {
    path: '',
    component: ModalPagePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  exports:[ModalPagePage],
  declarations: [ModalPagePage],
  entryComponents: [ModalPagePage]
})
export class ModalPagePageModule {}
