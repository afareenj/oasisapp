import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  logged = true;
  myurl: any = "";
  userID: string;

  constructor(private sanitizer: DomSanitizer, private storage: Storage, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
    this.storage.get('locked').then((lock) => {
        if (lock == "true") {
          this.logged = false;
        } else {
          this.storage.get('id').then((val) => {
              if (!val) {
                this.logged = false;
              }
            });
        }
    });

      this.myurl=this.sanitizer.bypassSecurityTrustResourceUrl("https://nam02.safelinks.protection.outlook.com/?url=https%3A%2F%2Fgisanddata.maps.arcgis.com%2Fapps%2Finstant%2Fnearby%2Findex.html%3Fappid%3D4ba424c955dc49658d309639a6152d66&data=04%7C01%7Ccnwosu3%40jhu.edu%7C56b0fc96721d417ab81308d8b1856482%7C9fa4f438b1e6473b803f86f8aedf0dec%7C0%7C0%7C637454533770747714%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C1000&sdata=ocnaRX0tyi4FyAanvpSJHKJbcWVbBY0adOELfWvAkBA%3D&reserved=0");
  }
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
    console.log("entered tab2");
     console.log("userID: ");
     console.log(this.userID);
  }


}
