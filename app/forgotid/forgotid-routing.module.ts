import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForgotidPage } from './forgotid.page';

const routes: Routes = [
  {
    path: '',
    component: ForgotidPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForgotidPageRoutingModule {}
