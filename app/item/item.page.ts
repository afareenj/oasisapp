import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef} from '@angular/core';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Validators, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Location } from "@angular/common";
import { NavController, ToastController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { endpoint, key } from "../dbLogin/config";
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network/ngx'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

declare var google;
let map: any;
let infowindow: any;
let options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};
// Original BALTI_BOUNDS: north: 44, south: 36, west: -80, east: -75
let BALTI_BOUNDS = {
   north: 40,
   south: 37,
   west: -80,
   east: -75,
};


@Component({
  selector: 'app-item',
  templateUrl: './item.page.html',
  styleUrls: ['./item.page.scss'],
})
export class ItemPage implements OnInit {
  //MAP VARIABLES
  autocomplete: { input: string; };
  autocompleteItems: any[];
  GoogleAutocomplete: any;
  placeid: any;
  location: string;
  marker: any;
  formattedAddress: string = "";
  question: string;
  id: number;
  loc = new FormGroup({
   offlineLocation: new FormControl('')
  });
  showError = "false";
  noNetwork = "false";

  //OTHER VARIABLES
  check = false;
  titleId = '';
  input: any;
  nextPage = true;
  intervalVar: any;
  progress = 0;
  surveys = this.formBuilder.array([
    ]);
  pageNum = 0;
  surveyForm = this.formBuilder.group({
    surveyDiv: this.surveys,
  });
  errorsPage = [];
  userID: string;
  address: string;
  title: string;
  backPage = [];
  locationId = "";
  prev = "false";
  randomArray = {};
  surveyVersion = 1;
  orientation = false;
  lockTime: Date;
  partialSurveyIntervalVar: any;
  partialSurvey = "false";
  surveySubmitted = false;
  locSurv: any; //NEW VARIABLE

  @ViewChild('map') mapElement: ElementRef;

  @ViewChild('button') buttonElement: ElementRef;

  getRandomInt(max) {
    let val = Math.floor(Math.random() * max) + 1;
    let j = val % 10, k = val % 100;
     if (j == 1 && k != 11) {
         return val + "st";
     }
     if (j == 2 && k != 12) {
         return val + "nd";
     }
     if (j == 3 && k != 13) {
         return val + "rd";
     }
     return val + "th";
  }
  getFirstOrLast(){
    let time = Math.floor(Math.random() * 2) + 1;
    if(time == 1){
      return "first";
    }
    return "last";
  }

  submitToAPI(val) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'text/plain, */*',
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json'
    };

     this.http.post(endpoint, val, httpOptions)
       .subscribe(data => {
         console.log(data);
        }, error => {
         console.log(error);
       });
  }

  async attachQuestions(value, completed) {
    console.log("attach questions function");
    console.log(completed);
    console.log(value);
    this.storage.get('id').then(async (id) => {
      this.userID = id;
      console.log(this.userID);
    });
      let submitSurvey = {};
      if(this.userID==undefined) {
        this.userID = "androiduser"; //NEED TO RETRIEVE USER ID
      } 
      console.log("userID");
      console.log(this.userID);
      console.log("address");
      console.log(this.address);
      //console.log(value.surveyDiv);
      //CHANGE THIS CODE IF FIRST QUESTIONS IN SURVEY CHANGE
      /*let mapquestionidx = (value.surveyDiv.split(',', 4).join(',')).length;
      console.log("map question idx");
      console.log(mapquestionidx);
      value.surveyDiv = value.surveyDiv.slice(0,mapquestionidx) + this.address + value.surveyDiv.slice(mapquestionidx);
      */
      
      submitSurvey['id'] = this.userID;
      submitSurvey["surveys"] = value.surveyDiv;
      let timeGMT = new Date();
      let offset = timeGMT.getTimezoneOffset();
      submitSurvey['dateCompleted'] = new Date(timeGMT.getTime() - (offset * 60000)).toISOString().slice(0, 19).replace('T', ' ');
      submitSurvey['surveyVersion'] = this.surveyVersion;
      submitSurvey['completed'] = completed;
      console.log('value surveyDiv');
      console.log(value.surveyDiv);

      /*value.surveyDiv.forEach(function (value) {
        console.log(value);
        
      });*/
      //TODO: find the array that has true and false and replace/cut with input values
      
      //await this.storage.remove("oldSurvey");
      //await this.storage.remove("partialSaveDate");
      clearInterval(this.partialSurveyIntervalVar);
      if (this.network.type === 'none') {//offline
        console.log("offline submit");
        this.storage.get('create').then(async (val) => {
          console.log("length1");
          if (val && val.length != 0) {
            val.push(submitSurvey);
            this.storage.set('create', val);
            this.storage.get('surveys').then(val => {
                if (val) {
                  val.push(submitSurvey);

                  this.storage.set('surveys', val);
                } else {
                  this.storage.set('surveys', [submitSurvey]);
                }
            });
          } else {
            this.storage.set('create', [submitSurvey]);
            this.storage.get('surveys').then(val => {
                if (val) {
                  val.push(submitSurvey);
                  //may need JSON.stringify and JSON.parse
                  this.storage.set('surveys', val);
                } else {
                  this.storage.set('surveys', [submitSurvey]);
                }
            });
          }
        });
      //vheck for onConnect to push creates/updates
    } else { //online
        console.log("online submit");
        this.submitToAPI([submitSurvey]);

        this.storage.get('create').then(val => {
          console.log("length2")
          if (val && val.length != 0) {
            val.push(submitSurvey);
            this.submitToAPI(val);
              this.storage.get('surveys').then(valSurvey => {
                  if (valSurvey) {
                    let temp = valSurvey.concat(val);
                    this.storage.set('surveys', temp);
                  } else {
                    this.storage.set('surveys', val);
                  }
              });
              this.storage.set('create', []);

          } else {
            this.storage.get('surveys').then(valSurvey => {

                if (valSurvey != null && valSurvey) {
                  //may need JSON.stringify and JSON.parse
                  let temp = valSurvey.concat([submitSurvey]);
                  this.storage.set('surveys', temp);
                } else {
                  this.storage.set('surveys', [submitSurvey]);
                }
            });
            this.submitToAPI([submitSurvey]);
          }
        });
    }
    /*
    this.storage.get('id').then(async (id) => {
      console.log("got id from storage");
      let submitSurvey = {};
      this.userID = id;
      submitSurvey['id'] = this.userID;
      submitSurvey["surveys"] = value.surveyDiv;
      let timeGMT = new Date();
      let offset = timeGMT.getTimezoneOffset();
      submitSurvey['dateCompleted'] = new Date(timeGMT.getTime() - (offset * 60000)).toISOString().slice(0, 19).replace('T', ' ');
      submitSurvey['surveyVersion'] = this.surveyVersion;
      submitSurvey['completed'] = completed;
      console.log('submit survey');
      console.log(submitSurvey);
      console.log('value surveyDiv');
      console.log(value.surveyDiv);

      /*value.surveyDiv.forEach(function (value) {
        console.log(value);
        
      });*/
      //TODO: find the array that has true and false and replace/cut with input values
      /*
      await this.storage.remove("oldSurvey");
      await this.storage.remove("partialSaveDate");
      clearInterval(this.partialSurveyIntervalVar);
      if (this.network.type === 'none') {//offline
        console.log("offline submit");
        this.storage.get('create').then(async (val) => {
          console.log("length1");
          if (val && val.length != 0) {
            val.push(submitSurvey);
            this.storage.set('create', val);
            this.storage.get('surveys').then(val => {
                if (val) {
                  val.push(submitSurvey);

                  this.storage.set('surveys', val);
                } else {
                  this.storage.set('surveys', [submitSurvey]);
                }
            });
          } else {
            this.storage.set('create', [submitSurvey]);
            this.storage.get('surveys').then(val => {
                if (val) {
                  val.push(submitSurvey);
                  //may need JSON.stringify and JSON.parse
                  this.storage.set('surveys', val);
                } else {
                  this.storage.set('surveys', [submitSurvey]);
                }
            });
          }
        });
      //vheck for onConnect to push creates/updates
    } else { //online
        console.log("online submit");
        this.storage.get('create').then(val => {
          console.log("length2")
          if (val && val.length != 0) {
            val.push(submitSurvey);
            this.submitToAPI(val);
              this.storage.get('surveys').then(valSurvey => {
                  if (valSurvey) {
                    let temp = valSurvey.concat(val);
                    this.storage.set('surveys', temp);
                  } else {
                    this.storage.set('surveys', val);
                  }
              });
              this.storage.set('create', []);

          } else {
            this.storage.get('surveys').then(valSurvey => {

                if (valSurvey != null && valSurvey) {
                  //may need JSON.stringify and JSON.parse
                  let temp = valSurvey.concat([submitSurvey]);
                  this.storage.set('surveys', temp);
                } else {
                  this.storage.set('surveys', [submitSurvey]);
                }
            });
            this.submitToAPI([submitSurvey]);
          }
        });
    }
    
    });*/
  }

  async submitForm() {
    console.log("in the submit form function");
    let temp = this.surveyForm.get("surveyDiv") as FormArray;
    console.log(temp.value);
    //console.log(this.surveyForm.value);
    this.attachQuestions(this.surveyForm.value, 'Y');
    console.log('Form submitted');
    this.showAlert();
    //this.router.navigate(['/tabs/login']);
    this.router.navigate(['/tabs/treasure', {userID: this.userID}]);
  }

  async partialSubmitForm() {
    console.log("in the partial submit form function");
    let temp = this.surveyForm.get("surveyDiv") as FormArray;
    console.log(temp.value);
    //console.log(this.surveyForm.value);
    this.attachQuestions(this.surveyForm.value, 'Y');
    console.log('Form submitted');
    //this.showAlert();
    //this.router.navigate(['/tabs/login']);
    //this.router.navigate(['/tabs/treasure', {userID: this.userID}]);

  }


  async next() {
    console.log("in the next function");
    console.log("PageNum");
    console.log(this.pageNum);
    console.log("this address");
    console.log(this.address);
    this.nextPage = true; //the below gets page values
    let temp = this.surveyForm.get("surveyDiv") as FormArray;
    //console.log(temp);
    console.log(temp.value); //gives current list of answers that have been submitted
    //console.log(temp.at(this.pageNum));
      if(temp.at(this.pageNum)!=undefined) {
        if (temp.at(this.pageNum).value == null || temp.at(this.pageNum).value == undefined) {
          //check for positive numbres
          console.log("in first if statement")
          this.errorsPage[0][this.pageNum][0] = true;
          this.nextPage = false;
        } else if (temp.at(this.pageNum).value == "") {
          console.log("in second if statement")
          console.log(temp.at(this.pageNum).value);
          this.errorsPage[0][this.pageNum][0] = true;
          this.nextPage = false;
        }
        else if (((this.input[this.pageNum].answerForm == "Number")
            && Number(temp.at(this.pageNum).value) < 0) || ((this.input[this.pageNum].answerForm == "Number") && (Number(temp.at(this.pageNum).value) > 0) && (Number(temp.at(this.pageNum).value) % 1 != 0))
            || ((this.input[this.pageNum].answerForm == "Number") && isNaN(Number(temp.at(this.pageNum).value)))) {
          console.log("error with bigint number page");
          console.log(temp.at(this.pageNum).value < 0);
          console.log((temp.at(this.pageNum).value > 0));
          console.log((temp.at(this.pageNum).value % 1 != 0));
          console.log("finished printing conditional statements for numbers")
              this.errorsPage[0][this.pageNum][0] = true;
          this.nextPage = false;
        }
        
        
        /*else if (((typeof temp.at(this.pageNum).value == "number")
            && temp.at(this.pageNum).value < 0) || ((typeof temp.at(this.pageNum).value == "number") && (temp.at(this.pageNum).value % 1 != 0))) {
          this.errorsPage[0][this.pageNum][0] = true;
          this.nextPage = false;*/
        /*  else if (((typeof temp.at(this.pageNum).value == "number") && temp.at(this.pageNum).value < 0) 
          || ((typeof temp.at(this.pageNum).value == "number") && (temp.at(this.pageNum).value > 0) && (temp.at(this.pageNum).value % 1 != 0))
          ) {
          console.log("error with number page");
          console.log(temp.at(this.pageNum).value < 0);
          console.log((temp.at(this.pageNum).value > 0));
          console.log((temp.at(this.pageNum).value % 1 != 0));
          console.log("finished printing conditional statements for numbers")
              this.errorsPage[0][this.pageNum][0] = true;
          this.nextPage = false;
        }*/ else if (this.input[this.pageNum].answerForm == "Multi-Select" && temp.at(this.pageNum).value.indexOf(true) == -1) {
          console.log("in fourth if statement")
          this.errorsPage[0][this.pageNum][0] = true;
          this.nextPage = false;
        } else if (this.input[this.pageNum].answerForm == "Matrix") {
          console.log("in fifth if statement")
          console.log(temp.at(this.pageNum))
          if(temp.at(this.pageNum)!=undefined) {
            console.log(temp.at(this.pageNum).value)
            let valueTemp = temp.at(this.pageNum).value;
            if(valueTemp != undefined) {
              console.log("length3")
            for (let i = 0; i < valueTemp.length; i++) { //PREVIOUS LINE: for (let i = 0; i < valueTemp.length; i++) {
              console.log(valueTemp[i]);
              if (valueTemp[i] === null || valueTemp[i] === undefined || valueTemp[i] === "" ) {
                this.errorsPage[0][this.pageNum][0] = true;
                this.nextPage = false;
                i = valueTemp.length;

              }
            }
          }
          }
        } else {
          console.log("in else statement")
          console.log(typeof temp.at(this.pageNum).value);
          console.log(temp.at(this.pageNum).value);
          console.log(Number(temp.at(this.pageNum).value));
          console.log(this.input[this.pageNum].answerForm);
          if(this.errorsPage!=null) {
            this.errorsPage[0][this.pageNum][0] = false;
          }
        }
      } else {
        //from map page
        if(this.input[this.pageNum].answers == "Map") {
          this.pageNum = this.pageNum + 1;
        }
        //this.pageNum = this.pageNum + 1;
        //this.pageNum = Number(this.locationId);
      }


      console.log("length4");
      if(this.input==undefined) {
        this.input = await this.storage.get('input');
        console.log("this input undefined");
        //this.read_data();
        console.log(this.address);
        if(this.address != undefined) {
          if(this.address != "") { //remove
            //this.input = await this.storage.get('input');
            this.read_data(); // INSERT PATCHING VALUE HERE
            console.log("input");
            console.log(this.input);
            console.log(this.locationId);
            if(this.locationId != undefined) {
              this.pageNum = Number(this.locationId);
            }
            
          }
        }
      }
      console.log(this.locationId); //locationId UNDEFINED
      console.log(this.pageNum);
      console.log('in the next function, printed question list')
      console.log(this.input); //gives list of questions and answers
      console.log(this.input.length);
      console.log(this.input.value);
    if (this.pageNum == (this.input.length - 1) && this.nextPage) {
      console.log("before submitting the form")
      this.submitForm();
    } else if ((this.pageNum < this.input.length) && this.nextPage) {
      let tempSwitch = this.input[this.pageNum].switch.split(',');
      this.backPage.push(this.pageNum);
      if(temp.at(this.pageNum)!=undefined) {
      let valueTemp = temp.at(this.pageNum).value;
      if(valueTemp != undefined) {
      console.log("here in this loop")
      //if (this.input[this.pageNum].answers == "Change") {
        //let random = this.getRandomInt(valueTemp);
      let random = this.getFirstOrLast();
      for (let i = this.pageNum + 1; i < this.input.length; i++) {
        this.input[i].question = this.input[i].question.replace("[random]", random);
      }
      //}
      console.log("length5")
      if (this.input[this.pageNum].answerForm == "Matrix" || this.input[this.pageNum].answerForm == "Text" || this.input[this.pageNum].answerForm == "Number") {
        this.pageNum = parseInt(tempSwitch[0]);
      } else if (Array.isArray(valueTemp) && valueTemp.length > 1 && this.input[this.pageNum].answerForm == "Multi-Select") {
        let min = parseInt(tempSwitch[valueTemp.indexOf(true)]);

        for (let i = 0; i < valueTemp.length; i++) {
          let minTemp = parseInt(tempSwitch[i]);
          if (valueTemp[i] && min > minTemp) {
            min = minTemp;
          }
        }
        this.pageNum = min;
      } else if (Array.isArray(valueTemp) && valueTemp.length == 1) {
        this.pageNum = parseInt(tempSwitch[this.input[this.pageNum].answers.indexOf(valueTemp[0])]);
      } else if (!Array.isArray(valueTemp)) { //multiple choice
        this.pageNum = parseInt(tempSwitch[this.input[this.pageNum].answers.indexOf(valueTemp)]);
      }
      }
      }

      if (this.pageNum == -1) {
        clearInterval(this.intervalVar);
        this.submitForm();
      } else {
        console.log("length6")
        this.progress = this.pageNum/this.input.length;
        if (this.input[this.pageNum].answers == "Map") {
          this.locSurv = temp.at(this.pageNum).value; //ADDED LOCATION SURVEY
          this.storage.set('locationSurvey',temp.at(this.pageNum).value);
          //this.storage.set('locationSurvey', temp.value);
          this.storage.set('backPage', this.backPage);
          this.storage.set('input', this.input);
          this.storage.set('errors', this.errorsPage);
          console.log("userID 1");
          console.log(this.userID);
          //this.partialSubmitForm();
          this.locationId = String(this.pageNum + 1);
          this.mapngOnInit();
          //this.pageNum = this.pageNum + 1; //addition to pagenum
          //this.router.navigate(['/tabs/item/useflowloc', {title: this.title, question: this.input[this.pageNum].question, id: this.pageNum, progress: this.progress, userID: this.userID, locSurv: this.locSurv}]);
        }
      }

    }

  }

constructor(private http: HttpClient, private storage: Storage, private locate: Location, private formBuilder: FormBuilder, private alertController: AlertController, private toastController: ToastController, private network: Network, private route: ActivatedRoute, private router: Router, public zone: NgZone, public navCtrl: NavController, private screenOrientation: ScreenOrientation, public platform: Platform, private nativeGeocoder: NativeGeocoder) {
    this.route.params.subscribe(params => {
     this.address = params['address'];
     this.title = params['title'];
     this.locationId = params['id'];
     this.prev = params['prev'];
     this.userID = params['userID'];
    });

    this.screenOrientation.unlock();
  }

  showAlert() {
     this.alertController.create({
       header: 'Thank you!',
       message: 'Your form has been submitted.',
       buttons: ['OK']
     }).then(res => {
       res.present();
     });
   }

  read_data() {
    fetch('../../assets/data.json').then(res => res.json())
    .then(json => {
      //Read data here
      this.createInput(json);
    });
  }

  async back(){
    if (this.pageNum > 0) {
      let pageNumTemp = this.backPage.pop();
      console.log("length6")
      this.progress = pageNumTemp/this.input.length;
      if (this.input[pageNumTemp].answers == "Map") {
        let temp = this.surveyForm.get("surveyDiv") as FormArray;
        this.locSurv = temp.value;
        this.storage.set('locationSurvey', temp.value);
        this.storage.set('backPage', this.backPage);
        this.storage.set('input', this.input);
        this.storage.set('errors', this.errorsPage);
        console.log("userID 2");
        console.log(this.userID);
        //this.partialSubmitForm();
        this.mapngOnInit(); 
        this.locationId = String(this.input[pageNumTemp].id);
        //this.router.navigate(['/tabs/item/useflowloc', {title: this.title, question: this.input[pageNumTemp].question, id: this.input[pageNumTemp].id - 1, progress: this.progress, userID: this.userID, locSurv: this.locSurv}]);
      } else {
        this.pageNum = pageNumTemp;
      }
    } else {
      this.router.navigate(['tabs/login', {userID: this.userID}]);
      clearInterval(this.intervalVar); //clear time out
      await this.storage.remove("oldSurvey"); //clear old survey
      await this.storage.remove("partialSaveDate"); //clear old date for partial save
      clearInterval(this.partialSurveyIntervalVar); //clear partial save
    }
  }

  startTime() {
    this.intervalVar = setInterval(function () {
      if (((new Date().getTime() - this.lockTime.getTime())/60000) > 30) { //if time is greater than 30 mins, lock the survey
        let temp = this.surveyForm.get("surveyDiv") as FormArray;
        this.locSurv = temp.value;
        this.storage.set('locationSurvey', temp.value);
        this.storage.set('backPage', this.backPage);
        this.storage.set('input', this.input);
        this.storage.set('errors', this.errorsPage);
        this.storage.set('locked', "true");
        this.router.navigate(['/home', {title: this.title, id: this.pageNum, locked: "true", userID: this.userID, locSurv: this.locSurv}]);
        clearInterval(this.intervalVar); //stop the count
      }
    }.bind(this), 5000); //check every 5 seconds
  }

  ionViewWillLeave() {
    this.partialSurvey = "true";
    let temp = this.surveyForm.get("surveyDiv") as FormArray;
    this.locSurv = temp.value;
    this.storage.set('locationSurvey', temp.value);
    this.storage.set('backPage', this.backPage);
    this.storage.set('input', this.input);
    this.storage.set('errors', this.errorsPage);
    this.storage.set('pageNumSave', this.pageNum);
  }

  ionViewDidEnter() {
    console.log("entered the item page");
    /*this.route.params.subscribe(params => {
      this.userID = params['userID'];
     });
     console.log("item page userID");
     console.log(this.userID);*/ 
    this.ngOnInit();
  }

  /*
  async submitPartialSurvey() {
    console.log("submit partial survey function");
    this.storage.get('oldSurvey').then(async (val) => {
      if (val != "true") { //no last saved survey, start new
        this.storage.set('oldSurvey', "true");
        if (this.title == undefined || this.title == "" || this.title == null) {
            this.title = (new Date()).toString();
        }
        this.storage.set('partialSaveDate', new Date(this.title));

        this.partialSurveyIntervalVar = setInterval(function () {
          if (((new Date().getTime() - new Date(this.title).getTime())/60000) > 120) { //if time is greater than 120 mins, submit the survey
            clearInterval(this.partialSurveyIntervalVar); //stop the count
            this.attachQuestions(this.surveyForm.value, 'N'); //submit as partial
            this.router.navigate(['/tabs/login',{userID: this.userID}]);
          }
          console.log("still rec", (new Date().getTime() - new Date(this.title).getTime())/60000 );
        }.bind(this), 5000); //check every 5 seconds

      } else { //load old survey here; open up to this survey when user clicks start ngOnInit

        this.route.params.subscribe(async params => {
         this.prev = params['prev'];
         if (this.prev == "true") { //you've returned from another page (lock screen or map) back here
           this.address = params['address'];
           this.title = params['title'];
           this.locationId = params['id'];
           this.input = await this.storage.get('input');
           this.errorsPage = await this.storage.get('errors');

           if (params['back'].indexOf("yes") !== -1) {
             let tempPageNum = parseInt(this.locationId);
             console.log("this line: ");
             console.log(tempPageNum);
             if (tempPageNum < 0) {
               this.router.navigate(['tabs/login', {userID: this.userID}]);
             } else if (this.input!=null && this.input[tempPageNum].answers == "Map") { //Error: Uncaught (in promise): TypeError: Cannot read properties of undefined (reading 'answers')
              console.log("userID 3");
              console.log(this.userID);
              this.partialSubmitForm(); 
              this.mapngOnInit();
              //this.router.navigate(['/tabs/item/useflowloc', {title: this.title, question: this.input[tempPageNum].question, id: tempPageNum, progress: tempPageNum/this.input.length, userID: this.userID}]);
             } else {
               this.backPage = await this.storage.get('backPage');
               console.log("IN THE OTHER LOCSURV LOCATION");
               //BEGINNING OF ADDED CODE
               let tempVal = this.locSurv;
               for (let i = 0; i < tempVal.length; i++) {
                if(Array.isArray(tempVal[i])) {
                  let surveyTemp = this.formBuilder.array([]);
                   for (let j = 0; j < tempVal[i].length; j++) {
                     surveyTemp.push(this.formBuilder.control('', Validators.required));
                   }
                   this.surveys.push(surveyTemp);
                } else {
                  this.surveys.push(this.formBuilder.control('', Validators.required));
               }
              }
              let temp = this.surveyForm.get("surveyDiv") as FormArray;
              temp.patchValue(tempVal);
              if (params['back'].indexOf("Home") !== -1) {
                this.pageNum = tempPageNum;
              } else {
                this.pageNum = this.backPage.pop();
              }
              this.progress = this.pageNum/this.locSurv.length;


                //END OF ADDED CODE
               this.storage.get('locationSurvey').then(async (val) => {

                 let tempVal = await val;
                 console.log("length6")
                 for (let i = 0; i < tempVal.length; i++) {
                   if(Array.isArray(tempVal[i])) {
                     let surveyTemp = this.formBuilder.array([]);
                      for (let j = 0; j < tempVal[i].length; j++) {
                        surveyTemp.push(this.formBuilder.control('', Validators.required));
                      }
                      this.surveys.push(surveyTemp);
                   } else {
                     this.surveys.push(this.formBuilder.control('', Validators.required));
                  }
                 }
                 let temp = this.surveyForm.get("surveyDiv") as FormArray;
                 temp.patchValue(tempVal);
                 if (params['back'].indexOf("Home") !== -1) {
                   this.pageNum = tempPageNum;
                 } else {
                   this.pageNum = this.backPage.pop();
                 }
                 this.progress = this.pageNum/val.length;
               });

             }
           }
           if (this.locationId != "" && params['back'] == "no") {
            console.log("in partial survey function, locationId not empty");
            //BEGINNING OF ADDED CODE
            let tempVal = this.locSurv;
            for (let i = 0; i < tempVal.length; i++) {
              if(Array.isArray(tempVal[i])) {
                let surveyTemp = this.formBuilder.array([]);
                 for (let j = 0; j < tempVal[i].length; j++) {
                   surveyTemp.push(this.formBuilder.control('', Validators.required));
                 }
                 this.surveys.push(surveyTemp);
              } else {
                this.surveys.push(this.formBuilder.control('', Validators.required));
             }
            }

            console.log("address tempVal, line 693");
            console.log(this.address);
            console.log(this.locationId);
            console.log(this.locSurv);
            tempVal[parseInt(this.locationId) - 1] = this.address;
            let temp = this.surveyForm.get("surveyDiv") as FormArray;
            temp.patchValue(tempVal);
            this.pageNum = parseInt(this.locationId);
            console.log("length8")
            this.progress = this.pageNum/this.locSurv.length;
            //END OF ADDED CODE
             this.storage.get('locationSurvey').then(async (val) => {

               let tempVal = await val;
               console.log("length7")
               for (let i = 0; i < tempVal.length; i++) {
                 if(Array.isArray(tempVal[i])) {
                   let surveyTemp = this.formBuilder.array([]);
                    for (let j = 0; j < tempVal[i].length; j++) {
                      surveyTemp.push(this.formBuilder.control('', Validators.required));
                    }
                    this.surveys.push(surveyTemp);
                 } else {
                   this.surveys.push(this.formBuilder.control('', Validators.required));
                }
               }

               console.log("address tempVal, line 719");
               console.log(this.address);
               console.log(this.locationId);
               console.log(this.locSurv);
               tempVal[parseInt(this.locationId) - 1] = this.address;
               let temp = this.surveyForm.get("surveyDiv") as FormArray;
               temp.patchValue(tempVal);
               this.pageNum = parseInt(this.locationId);
               console.log("length8")
               this.progress = this.pageNum/val.length;
             });
             this.storage.get('backPage').then(async (val) => {
               this.backPage = await val;
               this.backPage.push(parseInt(this.locationId) - 1);
             });
           }

           this.prev = "false";
        } else {
          console.log("Opened app from home screen/left page");
          this.title = await this.storage.get('partialSaveDate');
          this.locationId = await this.storage.get('pageNumSave');
          this.input = await this.storage.get('input');
          this.errorsPage = await this.storage.get('errors');
          let tempPageNum = parseInt(this.locationId);


            if (tempPageNum < 0) {
              this.router.navigate(['tabs/login', {userID: this.userID}]);
            } else if (this.input!=null && this.input[tempPageNum].answers == "Map") {
              console.log("userID 4")
              console.log(this.userID);
              this.partialSubmitForm();
              this.mapngOnInit();
              //this.router.navigate(['/tabs/item/useflowloc', {title: this.title, question: this.input[tempPageNum].question, id: tempPageNum, progress: tempPageNum/this.input.length, userID: this.userID}]);
            } else {
              this.backPage = await this.storage.get('backPage');
              this.storage.get('locationSurvey').then(val => {

                let tempVal = val;
                console.log("length9") //CHANGE tempval.length
                for (let i = 0; i < tempVal.length; i++) {
                  if(Array.isArray(tempVal[i])) {
                    let surveyTemp = this.formBuilder.array([]);
                     for (let j = 0; j < tempVal[i].length; j++) {
                       surveyTemp.push(this.formBuilder.control('', Validators.required));
                     }
                     this.surveys.push(surveyTemp);
                  } else {
                    this.surveys.push(this.formBuilder.control('', Validators.required));
                 }
                }
                let temp = this.surveyForm.get("surveyDiv") as FormArray;
                temp.patchValue(tempVal);

                this.pageNum = tempPageNum;

                this.progress = this.pageNum/val.length;
              }); //COMMENTED THIS OUT!!

            }


            if (this.locationId != "" && params['back'] == "no") {
              //START OF ADDED CODE
              let tempVal = this.locSurv;
              for (let i = 0; i < tempVal.length; i++) {
                if(Array.isArray(tempVal[i])) {
                  let surveyTemp = this.formBuilder.array([]);
                   for (let j = 0; j < tempVal[i].length; j++) {
                     surveyTemp.push(this.formBuilder.control('', Validators.required));
                   }
                   this.surveys.push(surveyTemp);
                } else {
                  this.surveys.push(this.formBuilder.control('', Validators.required));
               }
              }
              console.log("address second tempVal, line 794");
              console.log(this.address);
              console.log(this.locationId);
              console.log(this.locSurv);
              tempVal[parseInt(this.locationId) - 1] = this.address;
              let temp = this.surveyForm.get("surveyDiv") as FormArray;
              temp.patchValue(tempVal);
              this.pageNum = parseInt(this.locationId);
              console.log("length11")
              this.progress = this.pageNum/this.locSurv.length;
              //END OF ADDED CODE
              this.storage.get('locationSurvey').then(async (val) => {

                let tempVal = await val;
                console.log("length10")
                for (let i = 0; i < tempVal.length; i++) {
                  if(Array.isArray(tempVal[i])) {
                    let surveyTemp = this.formBuilder.array([]);
                     for (let j = 0; j < tempVal[i].length; j++) {
                       surveyTemp.push(this.formBuilder.control('', Validators.required));
                     }
                     this.surveys.push(surveyTemp);
                  } else {
                    this.surveys.push(this.formBuilder.control('', Validators.required));
                 }
                }
                console.log("address second tempVal, line 819");
                console.log(this.address);
                console.log(this.locationId);
                console.log(this.locSurv)
                tempVal[parseInt(this.locationId) - 1] = this.address;
                let temp = this.surveyForm.get("surveyDiv") as FormArray;
                temp.patchValue(tempVal);
                this.pageNum = parseInt(this.locationId);
                console.log("length11")
                this.progress = this.pageNum/val.length;
              });
              this.storage.get('backPage').then(async (val) => {
                this.backPage = await val;
                this.backPage.push(parseInt(this.locationId) - 1);
              });
            }


        }

        });




      }
    });
  }*/

  async ngOnInit() {
    console.log("ngOnInit in the item page");
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
      this.address = params['address'];
      this.locSurv = params['locSurv'];
     });
     console.log("item page userID in ngOnInit");
     console.log(this.userID);
     console.log(this.address);
    //uncomment below to test json
     //await this.read_data();
    //from map page: {address: this.location, title: this.title, prev: "true", back: "no", id: this.id}
     //begins countdown to lock survey if not completed
     this.lockTime = new Date();
     this.startTime();

     this.screenOrientation.onChange().subscribe(
       () => {
           if (this.screenOrientation.type.indexOf("landscape") > -1) {
             this.orientation = true;
           } else {
             this.orientation = false;
           }
       }
    );

    console.log(this.route.params);
    console.log(this.partialSurvey);

    this.route.params.subscribe(async params => {
     this.prev = params['prev'];
     console.log(this.prev)
     console.log(this.network.type);
     if (this.prev == "true" && this.partialSurvey != "true") { //you've returned from another page (lock screen or map) back here
      console.log("passed first if statement");
      this.address = params['address'];
       this.title = params['title'];
       this.locationId = params['id'];
       this.input = await this.storage.get('input');
       this.errorsPage = await this.storage.get('errors');
       

       if (params['back'].indexOf("yes") != -1) {
        console.log("params['back'].indexOf(yes) !== -1");
         let tempPageNum = parseInt(this.locationId);
         if (tempPageNum < 0) {
           this.router.navigate(['tabs/login', {userID: this.userID}]);
         } else if (this.input[tempPageNum].answers == "Map") {
          console.log("userID 5");
          console.log(this.userID);
          //this.partialSubmitForm(); 
          this.mapngOnInit();
          this.locationId = String(tempPageNum+1);
          //this.router.navigate(['/tabs/item/useflowloc', {title: this.title, question: this.input[tempPageNum].question, id: tempPageNum, progress: tempPageNum/this.input.length, userID: this.userID}]);
         } else {
           this.backPage = await this.storage.get('backPage');
           this.storage.get('locationSurvey').then(async (val) => {

             let tempVal = await val;
             console.log("length11");
             for (let i = 0; i < tempVal.length; i++) {
               if(Array.isArray(tempVal[i])) {
                 let surveyTemp = this.formBuilder.array([]);
                  for (let j = 0; j < tempVal[i].length; j++) {
                    surveyTemp.push(this.formBuilder.control('', Validators.required));
                  }
                  this.surveys.push(surveyTemp);
               } else {
                 this.surveys.push(this.formBuilder.control('', Validators.required));
              }
             }
             let temp = this.surveyForm.get("surveyDiv") as FormArray;
             temp.patchValue(tempVal);
             if (params['back'].indexOf("Home") !== -1) {
               this.pageNum = tempPageNum;
             } else {
               this.pageNum = this.backPage.pop();
             }
             this.progress = this.pageNum/val.length;
           });

         }
       }
       if (this.locationId != "" && params['back'] == "no") {
        console.log("this.locationId !=  && params[back] == no")
        // START OF ADDED CODE
        let tempVal = this.locSurv;
        for (let i = 0; i < tempVal.length; i++) {
          if(Array.isArray(tempVal[i])) {
            let surveyTemp = this.formBuilder.array([]);
             for (let j = 0; j < tempVal[i].length; j++) {
               surveyTemp.push(this.formBuilder.control('', Validators.required));
             }
             this.surveys.push(surveyTemp);
          } else {
            this.surveys.push(this.formBuilder.control('', Validators.required));
         }
        }
        console.log("line 944 address")
        console.log(this.address);
        console.log(this.locationId);
        console.log(tempVal);
        tempVal[parseInt(this.locationId) - 1] = this.address; //THROWS ERROR CANNOT CREATE PROPERTY 'NaN' on string ''
        let temp = this.surveyForm.get("surveyDiv") as FormArray;
        temp.patchValue(tempVal);
        console.log(this.locationId);
        this.pageNum = parseInt(this.locationId);
        console.log("length13")
        this.progress = this.pageNum/this.locSurv.length;
        //END OF ADDED CODE

         this.storage.get('locationSurvey').then(async (val) => {

           let tempVal = await val;
           console.log("length12")
           for (let i = 0; i < tempVal.length; i++) {
             if(Array.isArray(tempVal[i])) {
               let surveyTemp = this.formBuilder.array([]);
                for (let j = 0; j < tempVal[i].length; j++) {
                  surveyTemp.push(this.formBuilder.control('', Validators.required));
                }
                this.surveys.push(surveyTemp);
             } else {
               this.surveys.push(this.formBuilder.control('', Validators.required));
            }
           }
           console.log("line 970 address");
           console.log(this.address);
           console.log(this.locationId);
           console.log(tempVal);
           tempVal[parseInt(this.locationId) - 1] = this.address;
           let temp = this.surveyForm.get("surveyDiv") as FormArray;
           temp.patchValue(tempVal);
           console.log(this.locationId);
           this.pageNum = parseInt(this.locationId);
           console.log("length13")
           this.progress = this.pageNum/val.length;
         });
         this.storage.get('backPage').then(async (val) => {
           this.backPage = await val;
           this.backPage.push(parseInt(this.locationId) - 1);
         });
       }

       this.prev = "false";
    } else if (this.network.type === 'none' && this.partialSurvey != "true") {
      console.log("did not pass first if statement--now in else if network.type == none, partialsurvey!=true")
        this.storage.get('survey').then(val => {
          console.log("no net", val);
          if(val) {
            this.createInput(val);
          } else {
            this.read_data();
          }
        });

    } else if (this.partialSurvey != "true"){ //normal pull from db
      console.log("did not pass first if statement--now in else if partialsurvey!=true")
        this.http.get(endpoint).subscribe((response) => {
          //TODO: update for latest survey version
          this.createInput(response['result']);
          this.storage.set('survey', response['result']);
        });
    }

    });

     //this.submitPartialSurvey(); //REMOVED SUBMITPARTIALSURVEY
     this.next();
  }



  createInput(value) {
    console.log("createInput function in item page")
    this.errorsPage = [];
    let errorTemp = [];
    this.surveyVersion = value[0].surveyVersion;
    console.log("length14")
    for (let i = 0; i < value.length; i++) {
        if (Array.isArray(value[i].answers)) {
          value[i].answers = value[i].answers.toString();
        }

        if (value[i].answerForm == "Yes/No Explain") {
          let surveyTemp = this.formBuilder.array([]);
          surveyTemp.push(this.formBuilder.control('', Validators.required));
          surveyTemp.push(this.formBuilder.control('', Validators.required));
          this.surveys.push(surveyTemp);
          errorTemp.push([false,"Please Select An Answer & Explain"]);
        } else {
          if (value[i].answerForm == "Number") {
            errorTemp.push([false, "Please Select A Positive Number"]);
            this.surveys.push(this.formBuilder.control('', Validators.required));
          } else if (value[i].answerForm == "Multiple Choice") {
            value[i].answers = value[i].answers.split(',');
            errorTemp.push([false, "Please Select An Answer"]);
            this.surveys.push(this.formBuilder.control('', Validators.required));
          } else if (value[i].answerForm == "Multi-Select") {
            value[i].answers = value[i].answers.split(',');
            errorTemp.push([false, "Please Select An Answer"]);
            let surveyTemp = this.formBuilder.array([]);
            console.log("length15")
            for (let j = 0; j < value[i].answers.length; j++) {
              surveyTemp.push(this.formBuilder.control(false, Validators.required));
            }
            this.surveys.push(surveyTemp);
          } else if (value[i].answerForm == "Matrix") {
            if(typeof(value[i].answers) == "string") {
              let temp = value[i].answers.split('|');
              let ques = temp[0].split(',');
              let answ = temp[1].split(',');
              value[i].answers = {questions: ques, ans: answ};
            }
            let surveyTemp = this.formBuilder.array([]);
            console.log("length16")
            for (let j = 0; j < value[i].answers.questions.length; j++) {
              surveyTemp.push(this.formBuilder.control('', Validators.required));
            }
            this.surveys.push(surveyTemp);
            errorTemp.push([false, "Please Fill In All Questions"]);
          } else {
            this.surveys.push(this.formBuilder.control('', Validators.required));
            errorTemp.push([false, "Please Select An Answer"]);
          }
        }

    }
      this.errorsPage.push(errorTemp);
      this.input = value;
  }



  /**MAP CODE!!! */
  ClearAutocomplete(){
    console.log("ClearAutocomplete function");
    this.autocompleteItems = [];
    console.log(this.autocomplete);
    this.autocomplete.input = '';
  }

  //AUTOCOMPLETE, SIMPLY LOAD THE PLACE USING GOOGLE PREDICTIONS AND RETURNING THE ARRAY.
  UpdateSearchResults(){
    console.log("UpdateSearchResults function");
    let temp = this.surveyForm.get("surveyDiv") as FormArray;
    console.log(temp.at(this.pageNum).value);
    this.autocomplete.input = temp.at(this.pageNum).value;
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    //this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input, bounds: BALTI_BOUNDS },
    //https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#ComponentRestrictions
    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input, bounds: BALTI_BOUNDS, componentRestrictions: { country: "us"}, origin: {lat: 39.298017, lng: -76.590196} },
    (predictions, status) => {
      this.autocompleteItems = [];
      this.zone.run(() => {
        predictions.forEach((prediction) => {
          if(prediction.distance_meters < 130000) {  //HARD CODED BOUNDARY!!!
            this.autocompleteItems.push(prediction);
          }
          
        });
      });
    });
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition((location) => {
      let latLng = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
      map.setCenter( latLng );
      if (this.marker) {
        this.marker.setPosition( latLng );
        map.panTo( latLng );
      } else {
        this.marker = new google.maps.Marker({
          map: map,
          position: latLng,
          animation: google.maps.Animation.DROP,
          draggable: true,
          icon: {
            //url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            url: "../../assets/imgs/blue-dot.png"
          }
        });
      }

      this.zone.run(() => {
        this.location = this.marker.getPosition();
        let temp = this.location.toString().substring(1, this.location.toString().length - 1).split(',');
        let locTemp = temp[0];
        let locTemp1 = temp[1];
        //will have 3 decimal places for > 3 && + 4
        if ((locTemp.indexOf('.') != -1) && (locTemp.length - locTemp.indexOf('.') - 1 > 3)) {
          locTemp = temp[0].substring(0, temp[0].indexOf('.') + 4);
        }
        if ((locTemp1.indexOf('.') != -1) && (locTemp1.length - locTemp1.indexOf('.') - 1 > 3)) {
          locTemp1 = temp[1].substring(0, temp[1].indexOf('.') + 4);
        }

        this.location = "(" + locTemp + "," + locTemp1 + ")";
        console.log("attempt1");
        let tempSurvey = this.surveyForm.get("surveyDiv") as FormArray;
        tempSurvey.at(this.pageNum).setValue(String(this.location));
        console.log(tempSurvey.at(this.pageNum).value);
        this.getAddress(temp[0], temp[1]);
      });

      google.maps.event.addListener(this.marker, 'dragend', () => {
        this.zone.run(() => {
          this.location = this.marker.getPosition();
          let temp = this.location.toString().substring(1, this.location.toString().length - 1).split(',');
          let locTemp = temp[0];
          let locTemp1 = temp[1];
          //will have 3 decimal places for > 3 && + 4
          if ((locTemp.indexOf('.') != -1) && (locTemp.length - locTemp.indexOf('.') - 1 > 3)) {
            locTemp = temp[0].substring(0, temp[0].indexOf('.') + 4);
          }
          if ((locTemp1.indexOf('.') != -1) && (locTemp1.length - locTemp1.indexOf('.') - 1 > 3)) {
            locTemp1 = temp[1].substring(0, temp[1].indexOf('.') + 4);
          }

          this.location = "(" + locTemp + "," + locTemp1 + ")";
          console.log("attempt2");
          let tempSurvey = this.surveyForm.get("surveyDiv") as FormArray;
          tempSurvey.at(this.pageNum).setValue(String(this.location));
          console.log(tempSurvey.at(this.pageNum).value);
          this.getAddress(temp[0], temp[1]);
        });
      });

    }, (error) => {
      console.log(error);
    }, options);
  }


  SelectSearchResult(item) {
    this.placeid = item.place_id;
    this.ClearAutocomplete();

     let optionsNav: NativeGeocoderOptions = {
         useLocale: true,
         maxResults: 1
     };

     this.nativeGeocoder.forwardGeocode(item.description, optionsNav)
        .then((result: NativeGeocoderResult[]) => {
          console.log('The coordinates are latitude=' + result[0].latitude + ' and longitude=' + result[0].longitude);
          let latLng = new google.maps.LatLng(result[0].latitude, result[0].longitude);

          if (this.marker) {
            this.marker.setPosition( latLng );
            map.panTo( latLng );
          } else {
          this.marker = new google.maps.Marker({
            position: latLng,
            map: map,
            animation: google.maps.Animation.DROP,
            draggable: true,
            icon: {
              //url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              url: "../../assets/imgs/blue-dot.png"
            }
          });
          map.panTo( latLng );
         }
          this.zone.run(() => {
            //check this
            this.location = latLng.toString();
            let temp = this.location.toString().substring(1, this.location.toString().length - 1).split(',');
            let locTemp = temp[0];
            let locTemp1 = temp[1];
            //will have 3 decimal places for > 3 && + 4
            if ((locTemp.indexOf('.') != -1) && (locTemp.length - locTemp.indexOf('.') - 1 > 3)) {
              locTemp = temp[0].substring(0, temp[0].indexOf('.') + 4);
            }
            if ((locTemp1.indexOf('.') != -1) && (locTemp1.length - locTemp1.indexOf('.') - 1 > 3)) {
              locTemp1 = temp[1].substring(0, temp[1].indexOf('.') + 4);
            }

            this.location = "(" + locTemp + "," + locTemp1 + ")";
            console.log("attempt3");
            let tempSurvey = this.surveyForm.get("surveyDiv") as FormArray;
            tempSurvey.at(this.pageNum).setValue(String(this.location));
            console.log(tempSurvey.at(this.pageNum).value);
            this.formattedAddress = item.description;
          });
          map.setCenter(latLng);
        })
        .catch((error: any) => console.log(error));

  }


  initMap() {
    navigator.geolocation.getCurrentPosition((location) => {
      map = new google.maps.Map(this.mapElement.nativeElement, {
        //center: {lat: location.coords.latitude, lng: location.coords.longitude}, //changed default location to JHMI
        center: {lat: 39.298017, lng: -76.590196},
        zoom: 15,
        /**Added code below */
        restriction: {
          latLngBounds: BALTI_BOUNDS,
          strictBounds: true,
         },
         controls: {
           myLocationButton: true,
           myLocation: true  // try `myLocation = false`
       }
       //END of added code
      });

      let latLng = new google.maps.LatLng(map.center.lat(), map.center.lng());

      if (this.marker) {
        this.marker.setPosition( latLng );
        map.panTo( latLng );
      } else {
        this.marker = new google.maps.Marker({
          map: map,
          position: latLng,
          animation: google.maps.Animation.DROP,
          draggable: true,
          icon: {
            //url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            url: "../../assets/imgs/blue-dot.png"
          }
        });
      }


      google.maps.event.addListener(this.marker, 'dragend', () => {
        this.zone.run(() => {
          this.location = this.marker.getPosition();
          let temp = this.location.toString().substring(1, this.location.toString().length - 1).split(',');
          let locTemp = temp[0];
          let locTemp1 = temp[1];
          //will have 3 decimal places for > 3 && + 4
          if ((locTemp.indexOf('.') != -1) && (locTemp.length - locTemp.indexOf('.') - 1 > 3)) {
            locTemp = temp[0].substring(0, temp[0].indexOf('.') + 4);
          }
          if ((locTemp1.indexOf('.') != -1) && (locTemp1.length - locTemp1.indexOf('.') - 1 > 3)) {
            locTemp1 = temp[1].substring(0, temp[1].indexOf('.') + 4);
          }
          console.log("attempt4");
          let tempSurvey = this.surveyForm.get("surveyDiv") as FormArray;
          tempSurvey.at(this.pageNum).setValue(String(this.location));
          console.log(tempSurvey.at(this.pageNum).value);
          this.location = "(" + locTemp + "," + locTemp1 + ")";
          this.getAddress(temp[0], temp[1]);
        });
      });

    }, (error) => {
      console.log(error);
      map = new google.maps.Map(this.mapElement.nativeElement, {
        center: {lat: 39.298017, lng: -76.590196},
        zoom: 15,
        restriction: {
         latLngBounds: BALTI_BOUNDS,
         strictBounds: true,
        },
        controls: {
          myLocationButton: true,
          myLocation: true  // try `myLocation = false`
      }
      });


      let latLng = new google.maps.LatLng(map.center.lat(), map.center.lng());

      if (this.marker) {
        this.marker.setPosition( latLng );
        map.panTo( latLng );
      } else {
        this.marker = new google.maps.Marker({
          map: map,
          position: latLng,
          animation: google.maps.Animation.DROP,
          draggable: true,
          icon: {
            url: "../assets/imgs/blue-dot.png"
            //url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          }
        });
      }

      google.maps.event.addListener(this.marker, 'dragend', () => {

        this.zone.run(() => {
          this.location = this.marker.getPosition();

          let temp = this.location.toString().substring(1, this.location.toString().length - 1).split(',');
          let locTemp = temp[0];
          let locTemp1 = temp[1];
          //will have 3 decimal places for > 3 && + 4
          if ((locTemp.indexOf('.') != -1) && (locTemp.length - locTemp.indexOf('.') - 1 > 3)) {
            locTemp = temp[0].substring(0, temp[0].indexOf('.') + 4);
          }
          if ((locTemp1.indexOf('.') != -1) && (locTemp1.length - locTemp1.indexOf('.') - 1 > 3)) {
            locTemp1 = temp[1].substring(0, temp[1].indexOf('.') + 4);
          }

          this.location = "(" + locTemp + "," + locTemp1 + ")";
          console.log("attempt5");
          let tempSurvey = this.surveyForm.get("surveyDiv") as FormArray;
          tempSurvey.at(this.pageNum).setValue(String(this.location));
          console.log(tempSurvey.at(this.pageNum).value);
          this.getAddress(temp[0], temp[1]);
        });
      });

    }, options);
  }


  getAddress(lat, lng) {
    let optionsNav: NativeGeocoderOptions = {
        useLocale: true,
        maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(parseFloat(lat), parseFloat(lng), optionsNav)
      .then((result: NativeGeocoderResult[]) => {
        this.zone.run(() => {
          console.log(result[0]);
          let temp = JSON.stringify(result[0].thoroughfare);
          if (temp == "\"\"") {
            temp = JSON.stringify(result[0].locality);
            if (temp == "\"\"") {
              temp = JSON.stringify(result[0].administrativeArea);
              if (temp == "\"\"") {
                temp = JSON.stringify(result[0].postalCode);
              }
            }
          }

          this.formattedAddress = temp;

        });
      })
      .catch((error: any) => console.log(error));
  }

  async mapngOnInit() { //previously ngOnInit
    /*this.route.params.subscribe(params => {
      this.userID = params['userID'];
      this.locSurv = params['locSurv'];
     });
     console.log("useflowloc userID in ngOnInit");*/
     console.log(this.userID);
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService(); //EDIT HERE
    /*
    center: {lat: 39.298017, lng: -76.590196},
        restriction: {
         latLngBounds: BALTI_BOUNDS,
         strictBounds: true,
        }
        const options = {
          bounds: BALTI_BOUNDS,
          strictBounds: true
        };
    
    const options = {
      latLngBounds: BALTI_BOUNDS,
      strictBounds: true
    };*/
    this.autocomplete = { input: ''};
    this.autocompleteItems = [];
    if (this.network.type === 'none') {
      this.zone.run(() => {
        this.noNetwork = "true";
      });
      const toast = await this.toastController.create({
        message: 'Network connection lost. Please enter location manually.',
        duration: 2000
      });
      toast.present();
    } else {
    this.platform.ready().then(() => {
      this.initMap();
    });
  }
  }

  sendAddress() {
    if (this.location != undefined) {
      console.log("location not undefined, moving to next page from useflowloc");
      this.router.navigate(['/tabs/item', {address: this.location, title: this.title, prev: "true", back: "no", id: this.id, progress: this.progress, userID: this.userID, locSurv: this.locSurv}]);
      console.log("page moved");
    } else if(this.loc.value.offlineLocation != "" && this.loc.value.offlineLocation != undefined && this.loc.value.offlineLocation != null) {
      console.log("location offline, moving to next page from useflowloc");
      this.router.navigate(['/tabs/item', {address: this.loc.value.offlineLocation, title: this.title, prev: "true", back: "no", id: this.id, userID: this.userID, locSurv: this.locSurv}]);
    } else if(this.network.type === 'none') {
      console.log("no network, cannot move to next page from useflowloc");
      this.showError = "true";
    } else {
      console.log("alternate case, creating alert from useflowloc");
      this.alertController.create({
        header: 'Error',
        message: 'The selected map location was not saved. Please retry selecting a location or enter the location below.',
        inputs: [{
          name: 'location',
          placeholder: 'Enter location name or address'
        }],
        buttons: [{
          text: 'Return to Map',
          role: 'cancel',
          handler: data => {
            console.log('returned to map--last location: '+this.location+', '+this.title)
          }
        },
        {
          text: 'Submit',
          handler: data => {
            console.log(data.location);
            if(data.location=="") {
              return false;
            } else {
              console.log(this.loc.value.offlineLocation);
              console.log(this.location);
              this.router.navigate(['/tabs/item', {address: data.location, title: this.title, prev: "true", back: "no", id: this.id, userID: this.userID, locSurv: this.locSurv}]);
            }
          }
        }]
      }).then(res => {
        res.present();
      });
    }
  }

  mapback() { //formerly called back
    if(this.network.type === 'none') {
      this.router.navigate(['/tabs/item', {address: this.loc.value.offlineLocation, title: this.title, prev: "true", id: this.id - 2, back: "yes", userID: this.userID, locSurv: this.locSurv}]);
    } else {
      this.router.navigate(['/tabs/item', {address: this.location, title: this.title, prev: "true", id: this.id - 2, back: "yes", userID: this.userID, locSurv: this.locSurv}]);
    }
  }

}
