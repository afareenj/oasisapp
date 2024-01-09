import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Storage } from '@ionic/storage';
declare var cordova;

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page {
  fillTwelve: string = "outline";
  fillTwenty: string = "solid";
  disabled = false;
  turnOn = false;
  userID: string;

  async updateNotif(item) {
    console.log(item.detail.checked);
    if (!item.detail.checked) {
      this.disabled = false;
      this.localNotifications.cancelAll();
    } else {
      let yes = await this.localNotifications.hasPermission();
      console.log(yes);
      if (!yes) {
        await this.localNotifications.requestPermission();
        yes = await this.localNotifications.hasPermission();
      }
      if (yes) {
        this.disabled = true;
      }
    }
  }

  async home() {
    await this.storage.clear();
    this.router.navigate(['/home']);
  }

  constructor(private storage: Storage, private callNumber: CallNumber, private router: Router, private emailComposer: EmailComposer, private localNotifications: LocalNotifications, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
  }


  call() {
    this.callNumber.callNumber("410-502-5368", true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  email() {
    let email = {
      to: 'oasis.lighthouse.jhu@gmail.com',
      //cc: 'jone@doe.com',
      //bcc: ['john@doe.com', 'jane@doe.com'],
      subject: '(App)',
      isHtml: true
    }
    this.emailComposer.open(email);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
     console.log("entered tab4");
     console.log("userID: ");
     console.log(this.userID);
    this.storage.get('localNotificationsPermission').then(async val => {
      this.turnOn = await val;
    });
  }


}
