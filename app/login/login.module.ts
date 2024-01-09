import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { LoginPageRoutingModule } from './login-routing.module';
import { IonicStorageModule } from '@ionic/storage';
import { LoginPage } from './login.page';
import { Network } from '@ionic-native/network/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    IonicStorageModule.forRoot()
  ],
  declarations: [LoginPage],
  providers: [
    DatePipe,
    Network,
    LocalNotifications
  ]
})
export class LoginPageModule {}
