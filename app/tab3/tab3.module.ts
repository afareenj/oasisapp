import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tab3Page } from './tab3.page';
import { Tab3PageRoutingModule } from './tab3-routing.module'
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network/ngx';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild([{ path: '', component: Tab3Page }]),
    Tab3PageRoutingModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    Network
  ],
  declarations: [Tab3Page]
})
export class Tab3PageModule {}
