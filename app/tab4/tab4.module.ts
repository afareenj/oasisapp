import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tab4Page } from './tab4.page';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Tab4PageRoutingModule } from './tab4-routing.module';
import { IonicStorageModule } from '@ionic/storage';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    Tab4PageRoutingModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    EmailComposer,
    CallNumber,
    LocalNotifications
  ],
  declarations: [Tab4Page]
})
export class Tab4PageModule {}
