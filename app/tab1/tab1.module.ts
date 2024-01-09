import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { IonicStorageModule } from '@ionic/storage';
import { Tab1PageRoutingModule } from './tab1-routing.module';
import { Network } from '@ionic-native/network/ngx';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule,
    IonicStorageModule.forRoot()
  ],
  declarations: [Tab1Page],
  providers: [DatePipe, Network]
})
export class Tab1PageModule {}
