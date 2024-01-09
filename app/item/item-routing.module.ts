import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemPage } from './item.page';

const routes: Routes = [
  {
    path: '',
    component: ItemPage
  },
  {
    path: 'useflowloc',
    loadChildren: () => import('./useflowloc/useflowloc.module').then( m => m.UseflowlocPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemPageRoutingModule {}
