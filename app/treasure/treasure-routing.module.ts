import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TreasurePage } from './treasure.page';

const routes: Routes = [
  {
    path: '',
    component: TreasurePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TreasurePageRoutingModule {}
