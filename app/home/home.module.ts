import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { IonicStorageModule } from '@ionic/storage';
import { HomePageRoutingModule } from './home-routing.module';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { HttpClientModule } from '@angular/common/http';
import { Network } from '@ionic-native/network/ngx';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    HomePageRoutingModule
  ],
  providers: [
    Network,
    ScreenOrientation
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
