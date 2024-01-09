import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from "@angular/common";
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Network } from '@ionic-native/network/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { endpoint, key } from "../dbLogin/config";
import { AlertController } from '@ionic/angular';
declare var cordova;
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
userID: string;
maxDate: Date;
sameDate: boolean;
arr = [];
httpOptions = {
  headers: new HttpHeaders({
    'Accept': 'text/plain, */*',
    'Content-Type': 'application/json'
  }),
  responseType: 'text' as 'json'
};

async home() {
  console.log("signing out...");
  this.storage.clear();
  console.log("storage clear");
  //await this.storage.clear();
  //console.log("storage clear");
  this.router.navigate(['/home']);
}  

async settings() {
  //await this.storage.clear();
  this.router.navigate(['/tabs/tab4', {userID: this.userID}]);
}  

async previousentries() {
  //await this.storage.clear();
  this.router.navigate(['/tabs/tab1', {userID: this.userID}]);
}  
 async updateNotif() {
   let yes = await this.localNotifications.hasPermission();
   console.log(yes);
   if (!yes) {
     await this.localNotifications.requestPermission();
     yes = await this.localNotifications.hasPermission();
   }
   this.storage.set('localNotificationsPermission', yes);
   if (yes) {
     this.localNotifications.cancelAll();
     //for IOS notifications (the next 2 lines), run below from terminal
     //ionic cordova plugin add cordova-plugin-local-notification
     //npm install @ionic-native/local-notifications

     //for android notifications, run from terminal: ionic cordova plugin add de.appplant.cordova.plugin.local-notification@0.8.5

     //remove the other ionic cordova before installing another using ionic cordova plugin remove cordova-plugin-local-notification
     cordova.plugins.notification.local.on('snooze', function () {
       cordova.plugins.notification.local.schedule({
          title: 'Lighthouse App',
          text: 'Enter an Oasis Entry',
          foreground: true,
          trigger: {
            in: 10, unit: 'minute'
          },
          actions: [{
              id: 'snooze',
              title: 'Snooze',
          }],
          //data: { secret: 'secret' },
          icon: '../../assets/imgs/lighthouse.png'
          // led: 'FF0000',
          // sound: null
       });
     });


     cordova.plugins.notification.local.schedule({
        id: 1,
        title: 'Lighthouse App',
        text: 'Enter an Oasis Entry',
        foreground: true,
        trigger: {
          every: {
            hour: 17, //change to 17 -- default 5:00 PM
            minute: 0
          },
          count: 1
        },
        actions: [{
            id: 'snooze',
            title: 'Snooze',
        }],
        //data: { secret: 'secret' },
        icon: '../../assets/imgs/lighthouse.png'
        // led: 'FF0000',
        // sound: null
     });
   }
 }

  constructor(private http: HttpClient, private storage: Storage, private localNotifications: LocalNotifications, private datepipe: DatePipe, private network: Network, private alertController: AlertController, private route: ActivatedRoute, private router: Router) {
    this.route.params.subscribe(params => {
     this.userID = params['userID'];
    });
    this.updateNotif();
  }

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

  /*ionViewDidEnter() { //ionViewDidEnter
    console.log('ion view did enter');
    if (this.network.type === 'none') {
      // Return the cached data from Storage
      this.storage.get('surveys').then(async (val) => {
        let length = val.length;
        this.arr = [];
        for (let i = 0; i < length; i++) {
          let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
          this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
        }
        this.maxDate = new Date(val[length-1].dateCompleted.slice(0, 19).replace(' ', 'T'));
        console.log(this.maxDate);
      });
    } else {
      console.log('in network type is not none');
      this.storage.get('create').then(async (val) => {
        if (val && val.length != 0) {
            console.log('val is not 0');
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
              this.maxDate = new Date(val[length-1].dateCompleted.slice(0, 19).replace(' ', 'T'));
              console.log(this.maxDate);
            });

        } else {
          console.log('val is 0')
          //proceed like normal read
          this.http.post(endpoint, {user: this.userID}, this.httpOptions).subscribe((response) => {
            console.log(response);
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
              this.maxDate = new Date(val[length-1].dateCompleted.slice(0, 19).replace(' ', 'T'));
              console.log(this.maxDate);
            }
          });


        }
      });

    }
  }*/

  async ionViewDidEnter() { //async ngOnInit
    console.log('ion view did enter');
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
    if (this.network.type === 'none') {
      // Return the cached data from Storage
      this.storage.get('surveys').then(async (val) => {
        let length = val.length;
        this.arr = [];
        for (let i = 0; i < length; i++) {
          let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
          this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
        }
        this.maxDate = new Date(val[length-1].dateCompleted.slice(0, 19).replace(' ', 'T'));
        console.log(this.maxDate);
      });
    } else {
      console.log('network is not none')
      this.storage.get('surveys').then(async (val) => {
        if (val && val.length != 0) {
          console.log('val is not 0');
          console.log(val);
            //post all the surveys that wer'ent updated
            //post and delete from val
            this.submitToAPI(val);
            this.storage.set('create', []);
            let length = val.length;
            this.arr = [];
            for (let i = 0; i < length; i++) {
              let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
              this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
            }
            this.maxDate = new Date(val[length-1].dateCompleted.slice(0, 19).replace(' ', 'T'));
            console.log(this.maxDate);
            this.http.post(endpoint, {user: this.userID}, this.httpOptions).subscribe((response) => {
              //console.log(response);
              let val = JSON.parse(<string> response)['result'];
              this.storage.set('surveys', val);
              let length = val.length;
              this.arr = [];
              for (let i = 0; i < length; i++) {
                let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
                this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
              }
              this.maxDate = new Date(val[length-1].dateCompleted.slice(0, 19).replace(' ', 'T'));
              console.log(this.maxDate);
            });

        } else {
          console.log('val is 0');
          //proceed like normal read
          this.http.post(endpoint, {user: this.userID}, this.httpOptions).subscribe((response) => {
            let val = JSON.parse(<string> response)['result'];
            //console.log(response, typeof(response));
            if (val != "no data found") {
              this.storage.set('surveys', val);
              let length = val.length;
              this.arr = [];
              for (let i = 0; i < length; i++) {
                let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
                this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
              }
              this.maxDate = new Date(val[length-1].dateCompleted.slice(0, 19).replace(' ', 'T'));
              console.log(this.maxDate);
            }
          });


        }
      });

    }
  }

  async ngOnInit() { //async ngOnInit
    console.log('ng on init');
    if (this.network.type === 'none') {
      // Return the cached data from Storage
      this.storage.get('surveys').then(async (val) => {
        let length = val.length;
        this.arr = [];
        for (let i = 0; i < length; i++) {
          let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
          this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
        }
        this.maxDate = new Date(val[length-1].dateCompleted.slice(0, 19).replace(' ', 'T'));
        console.log(this.maxDate);
      });
    } else {
      this.storage.get('create').then(async (val) => {
        if (val && val.length != 0) {
            //post all the surveys that wer'ent updated
            //post and delete from val
            this.submitToAPI(val);
            this.storage.set('create', []);


            this.http.post(endpoint, {user: this.userID}, this.httpOptions).subscribe((response) => {
              //console.log(response);
              let val = JSON.parse(<string> response)['result'];
              this.storage.set('surveys', val);
              let length = val.length;
              this.arr = [];
              for (let i = 0; i < length; i++) {
                let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
                this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
              }
              this.maxDate = new Date(val[length-1].dateCompleted.slice(0, 19).replace(' ', 'T'));
              console.log(this.maxDate);
            });

        } else {
          //proceed like normal read
          this.http.post(endpoint, {user: this.userID}, this.httpOptions).subscribe((response) => {
            let val = JSON.parse(<string> response)['result'];
            //console.log(response, typeof(response));
            if (val != "no data found") {
              this.storage.set('surveys', val);
              let length = val.length;
              this.arr = [];
              for (let i = 0; i < length; i++) {
                let date = new Date(val[i].dateCompleted.slice(0, 19).replace(' ', 'T'));
                this.arr.unshift([this.datepipe.transform(date, 'medium'), val[i]]);
              }
              this.maxDate = new Date(val[length-1].dateCompleted.slice(0, 19).replace(' ', 'T'));
              console.log(this.maxDate);
            }
          });


        }
      });

    }
  }


  showAlert() {
    this.alertController.create({
      header: 'Error',
      message: 'Thank you for submitting your survey for today. Please return tomorrow to submit your next entry.',
      buttons: ['OK']
    }).then(res => {
      res.present();
    });
  }

  goToSurvey() {
    let today = new Date();
    let sameDate = false;
    console.log(today);
    if(this.maxDate==null) {
      let date = this.datepipe.transform(new Date(), 'medium');
      this.router.navigate(['/tabs/item', {address: "blank", prev: false, title: date, userID: this.userID}]);
    }
    else {
      console.log(this.maxDate);
      if(this.maxDate.getDate()==today.getDate() && this.maxDate.getFullYear()==today.getFullYear() 
          && this.maxDate.getMonth()==today.getMonth()) {
            console.log("same date");
            sameDate = true;
      }

      if(sameDate) {
        this.showAlert();
      }
      else {
        let date = this.datepipe.transform(new Date(), 'medium');
        this.router.navigate(['/tabs/item', {address: "blank", prev: false, title: date, userID: this.userID}]);
      }
    }
    
  }

  //ngOnInit() {
  //}

  

}
