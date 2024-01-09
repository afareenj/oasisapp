import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UseflowlocPage } from './useflowloc.page';

const routes: Routes = [
  {
    path: '',
    component: UseflowlocPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UseflowlocPageRoutingModule {}
