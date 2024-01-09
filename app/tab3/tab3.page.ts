import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Storage } from '@ionic/storage';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  logged = true;
  myurl: any = "";
  userID: string;

  constructor(private storage: Storage, private sanitizer: DomSanitizer, private route: ActivatedRoute) {
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
    //this.myurl=this.sanitizer.bypassSecurityTrustResourceUrl("https://gisanddata.maps.arcgis.com/apps/instant/nearby/index.html?appid=4ba424c955dc49658d309639a6152d66");
    this.myurl=this.sanitizer.bypassSecurityTrustResourceUrl("https://maryland.maps.arcgis.com/apps/instant/nearby/index.html?appid=0a52c4f1510445218fcc06a4ae9a4163&sliderDistance=5&find=6001-6013%2520Greenvale%2520Pkwy%252C%2520Riverdale%252C%2520Maryland%252C%252020737");
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
    console.log("entered tab3");
     console.log("userID: ");
     console.log(this.userID);
  }

}
