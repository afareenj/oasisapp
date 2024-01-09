import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-treasure',
  templateUrl: './treasure.page.html',
  styleUrls: ['./treasure.page.scss'],
})
export class TreasurePage implements OnInit {
  userID: string;
  constructor(private router: Router, private route: ActivatedRoute) { 
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
  }

  goToLoginPage() { 
    this.router.navigate(['/tabs/login', {userID: this.userID}]);
  }

}
