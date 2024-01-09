import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ItemPageRoutingModule } from './item-routing.module';
import { ItemPage } from './item.page';
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network/ngx';

import { HttpClientModule } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    HttpClientModule,
    ItemPageRoutingModule,
    ReactiveFormsModule,
    IonicStorageModule.forRoot()
  ],
  declarations: [ItemPage],
  providers: [
    Network,
    Geolocation,
    NativeGeocoder,
    ScreenOrientation
  ]
})
export class ItemPageModule {}
