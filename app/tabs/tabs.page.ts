import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
idExists = false;
userID: string;

  constructor(private storage: Storage, private route: ActivatedRoute) {
    console.log("in tabs.page.ts");
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
    //NEW CODE
    /*this.storage.get('id').then((val) => {
      console.log("received ID");
      console.log(val);
        if (val) {
          this.idExists = true;
        }
      });*/
      //OLD CODE
    this.storage.get('locked').then((lock) => {
      console.log(lock);
        if (lock == "true") {
          this.idExists = false;
        } else {
            this.storage.get('id').then((val) => {
              console.log(val);
                if (val) {
                  this.idExists = true;
                }
              });
        }
    });
  }
  ngOnInit() {
    console.log(this.route.params);
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
    console.log("entered tabs");
     console.log("userID: ");
     console.log(this.userID);
  }

}
