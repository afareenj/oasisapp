import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Component({
  selector: 'app-forgotid',
  templateUrl: './forgotid.page.html',
  styleUrls: ['./forgotid.page.scss'],
})
export class ForgotidPage implements OnInit {
  emailForm = new FormGroup({
   email: new FormControl(''),
  });

  constructor(private emailComposer: EmailComposer, private toastController: ToastController, private router: Router) {}

  ngOnInit() {}

  async email() {
    console.log(this.emailForm.value);
    if (this.emailForm.value.email != "" && (this.emailForm.value.email.indexOf('@') > 0)) {
      const toast = await this.toastController.create({
        message: 'Email has been sent.',
        duration: 2000
      });
      toast.present();
      this.router.navigate(['/home']);
    } else if (!(this.emailForm.value.email.indexOf('@') > 0)) {
      const toast = await this.toastController.create({
        message: 'Please enter a valid email.',
        duration: 2000
      });
      toast.present();
    }
  }

}
