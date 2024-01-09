import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

import { UseflowlocPageRoutingModule } from './useflowloc-routing.module';
import { UseflowlocPage } from './useflowloc.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network/ngx';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FormsModule,
    HttpClientModule,
    UseflowlocPageRoutingModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    Geolocation,
    NativeGeocoder,
    Network
  ],
  declarations: [UseflowlocPage]
})
export class UseflowlocPageModule {}
