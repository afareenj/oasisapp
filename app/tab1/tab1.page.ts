import { Component, ElementRef, ViewChild, NgZone} from '@angular/core';
import { IonList } from '@ionic/angular/';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, DatePipe } from "@angular/common";
import { Storage } from '@ionic/storage';
import { endpoint, key } from "../dbLogin/config";
import { Network } from '@ionic-native/network/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  userID: string;
  surveys: any;
  @ViewChild(IonList, { read: ElementRef }) list: ElementRef;
  arr = [];
  block = 'center'; //center or end
  behaviour = 'smooth';
  scrollTo = null;
  todaysDate: string;
  startDate;
  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'text/plain, */*',
      'Content-Type': 'application/json'
    }),
    responseType: 'text' as 'json'
  };

  submitToAPI(val) {
    let temp: any;
     this.http.post(endpoint, val, this.httpOptions)
       .subscribe(data => {
         temp = data;
        }, error => {
         temp = error;
       });
    return temp;
  }

  constructor(private http: HttpClient, private route: ActivatedRoute, public zone: NgZone, private network: Network, private router: Router, private datepipe: DatePipe, private storage: Storage, private location: Location) {
      this.zone.run(() => {
        this.todaysDate = (new Date()).toISOString().substring(0, 10);
        console.log(this.todaysDate);
      });
      this.route.params.subscribe(params => {
        this.userID = params['userID'];
       });
      this.storage.get('id').then(async (id) => {
        this.userID = await id;
        console.log(this.userID);
      });
  }

  async ionViewDidEnter() {
    if (this.network.type === 'none') {
      // Return the cached data from Storage
      this.storage.get('surveys').then(async (val) => {
        let length = val.length;
        this.arr = [];
        for (let i = 0; i < length; i++) {
          let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
          this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
        }
      });
    } else {
      this.storage.get('create').then(async (val) => {
        if (val && val.length != 0) {
            //post all the surveys that were not updated
            //post and delete from val
            this.submitToAPI(val);
            this.storage.set('create', []);


            this.http.post(endpoint, {user: this.userID}, this.httpOptions).subscribe((response) => {
              console.log(response);
              let val = JSON.parse(<string> response)['result'];
              this.storage.set('surveys', val);
              let length = val.length;
              this.arr = [];
              for (let i = 0; i < length; i++) {
                let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
                this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
              }
            });

        } else {
          //proceed like normal read
          this.http.post(endpoint, {user: this.userID}, this.httpOptions).subscribe((response) => {
            let val = JSON.parse(<string> response)['result'];
            console.log(response, typeof(response));
            if (val != "no data found") {
              this.storage.set('surveys', val);
              let length = val.length;
              this.arr = [];
              for (let i = 0; i < length; i++) {
                let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
                this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
              }
            }
          });


        }
      });

    }
  }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
      console.log("entered tab1");
       console.log("userID: ");
       console.log(this.userID);

    if (this.network.type === 'none') {
      // Return the cached data from Storage
      this.storage.get('surveys').then(async (val) => {
        let length = val.length;
        this.arr = [];
        for (let i = 0; i < length; i++) {
          let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
          this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
        }
      });
    } else {
      this.storage.get('create').then(async (val) => {
        if (val && val.length != 0) {
            //post all the surveys that wer'ent updated
            //post and delete from val
            this.submitToAPI(val);
            this.storage.set('create', []);


            this.http.post(endpoint, {user: this.userID}, this.httpOptions).subscribe((response) => {
              console.log(response);
              let val = JSON.parse(<string> response)['result'];
              this.storage.set('surveys', val);
              let length = val.length;
              this.arr = [];
              for (let i = 0; i < length; i++) {
                let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
                this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
              }
            });

        } else {
          //proceed like normal read
          this.http.post(endpoint, {user: this.userID}, this.httpOptions).subscribe((response) => {
            let val = JSON.parse(<string> response)['result'];
            console.log(response, typeof(response));
            if (val != "no data found") {
              this.storage.set('surveys', val);
              let length = val.length;
              this.arr = [];
              for (let i = 0; i < length; i++) {
                let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
                this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
              }
            }
          });


        }
      });

    }
  }

  length() {
    if (this.arr.length == 0) {
      return true;
    }
    return false;
  }


  back() {
    this.location.back();
  }

  goToLogin() {
    this.router.navigate(['/tabs/login', {userID: this.userID}]);
  }

  searchDate(val) {
    console.log(this.startDate);
    let tempD = new Date(this.datepipe.transform(this.startDate, 'medium'));
    let temp = new Date(tempD.getFullYear(), tempD.getMonth(), tempD.getDate(), 0, 0, 0);
    let arrTemp = this.list.nativeElement.children;
    let item = arrTemp[0];
    for (let i = 0; i < this.arr.length; i++) {
      if (new Date(this.arr[i][0]) > temp) {
        item = arrTemp[i]; //pulls up input value
      } else {
        i = this.arr.length + 1;
      }
    }
    console.log(item);
    item.scrollIntoView({ behaviour: this.behaviour, block: this.block});

  }

}
