import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ForgotidPageRoutingModule } from './forgotid-routing.module';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { ForgotidPage } from './forgotid.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    ForgotidPageRoutingModule
  ],
  providers: [
    EmailComposer
  ],
  declarations: [ForgotidPage]
})
export class ForgotidPageModule {}
