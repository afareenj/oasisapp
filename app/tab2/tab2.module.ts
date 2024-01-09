import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tab2Page } from './tab2.page';
import { Tab2PageRoutingModule } from './tab2-routing.module'
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network/ngx';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild([{ path: '', component: Tab2Page }]),
    Tab2PageRoutingModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    Network
  ],
  declarations: [Tab2Page]
})
export class Tab2PageModule {}
