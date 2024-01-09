import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TreasurePageRoutingModule } from './treasure-routing.module';

import { TreasurePage } from './treasure.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TreasurePageRoutingModule
  ],
  declarations: [TreasurePage]
})
export class TreasurePageModule {}
