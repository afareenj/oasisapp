import { Component } from '@angular/core';
import { endpoint, key } from "../dbLogin/config";
import { ToastController, Platform } from '@ionic/angular';
import { FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Network } from '@ionic-native/network/ngx'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  backButtonSubscription: any;
  password: string = "eye-off-outline";
  element: string = "password";
  locked = "false";
  loginForm = new FormGroup({
   name: new FormControl(''),
   id: new FormControl(''),
  });
  title: string;
  id: number;


  constructor(private route: ActivatedRoute, private network: Network, private http: HttpClient, private screenOrientation: ScreenOrientation, private platform: Platform, private router: Router, private storage: Storage, private toastController: ToastController) {

    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(999, () => {
      console.log('Handler was called!');
       navigator['app'].exitApp();
    });

    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }

  togglePassword() {
    if (this.element == 'password') {
      this.element = 'text';
      this.password = 'eye-outline';
    }
    else {
      this.element = 'password';
      this.password = 'eye-off-outline';
    }
  }

  ionViewDidEnter() {
    this.loginForm.patchValue({
      //remove autofill after sign out
      name: "",
      id: ""
   });
  }

    ngOnInit() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.storage.get('id').then(async (val) => {
      if (val) {
        this.loginForm.patchValue({
          //name: val, remove autofill
          name: "",
          id: ""
       });
     } else {
       this.loginForm.patchValue({
         name: "",
         id: ""
      });
     }
      this.route.params.subscribe(params => {
        this.locked = params['locked'];
        this.title = params['title'];
        this.id = parseInt(params['id']) + 1;
        this.storage.set("locked", "true");
    });
  });

  }

   createToast(value) {
    return this.toastController.create({
      message: value,
      duration: 2000
    });
  }

   login() {
    console.log(this.loginForm.value);
    if(this.loginForm.value.name != "" && this.loginForm.value.id != "") {
      if (this.network.type === 'none') {
        this.storage.get('password').then(password => {
          if (password) {
            this.createToast('No internet. Please connect to the last used account.').then((result) => {
              result.present();
            });
              this.storage.get('id').then(id => {
                if (this.loginForm.value.name == id && this.loginForm.value.id == password) {
                  if (this.locked != "true") {
                    console.log("this.userID 1")
                    console.log(this.loginForm.value.name);
                   this.router.navigate(['/tabs/login', {userID: this.loginForm.value.name}]);
                   this.storage.remove('locked');
                 } else if (this.locked == "true") {
                   this.router.navigate(['/tabs/item', {title: this.title, prev: "true", id: this.id, back: "yesHome"}]);
                   this.storage.remove('locked');
                 }
                }
              });
          } else {
            this.createToast('Please connect to an internet network first.').then((result) => {
              result.present();
            });
          }
        });

      } else {

      let httpOptions = {
        headers: new HttpHeaders({
          'Accept': 'text/plain, */*',
          'Content-Type': 'application/json'
        }),
        responseType: 'text' as 'json'
      };
       this.http.post(endpoint, this.loginForm.value, httpOptions)
         .subscribe(data => {
           if (data != undefined && JSON.parse(<string> data)['result'][0]['COUNT(1)'].localeCompare("1") == 0) {
             this.storage.set('id', this.loginForm.value.name);
             this.storage.set('password', this.loginForm.value.id);
             this.route.params.subscribe(params => {
               this.locked = params['locked'];
               this.title = params['title'];
               this.id = parseInt(params['id']);

             });
                if (this.locked != "true") {
                  console.log("this.userID 1")
                  console.log(this.loginForm.value.name);
                 this.router.navigate(['/tabs/login', {userID: this.loginForm.value.name}]);
                 this.storage.remove('locked');
               } else if (this.locked == "true") {
                 this.router.navigate(['/tabs/item', {title: this.title, prev: "true", id: this.id, back: "yesHome"}]);
                 this.storage.remove('locked');
               }

              } else {
                  this.createToast('Username and Password do not exist').then((result) => {
                    result.present();
                  });
           }
          }, error => {
            this.createToast('Username and Password do not exist').then((result) => {
              result.present();
            });
           console.log(error);
         });


       }
    } else {
      this.createToast('Please Enter Username & Password').then((result) => {
        result.present();
      });
    }
  }
}
