import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Network } from '@ionic-native/network/ngx';
import { LoadingController } from '@ionic/angular';
import { FormGroup, FormControl } from '@angular/forms';
import { platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AlertController } from '@ionic/angular'; //NEW

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
  selector: 'app-useflowloc',
  templateUrl: './useflowloc.page.html',
  styleUrls: ['./useflowloc.page.scss'],
})
export class UseflowlocPage implements OnInit {
  autocomplete: { input: string; };
  autocompleteItems: any[];
  GoogleAutocomplete: any;
  placeid: any;
  location: string;
  marker: any;
  formattedAddress: string = "";
  title: string;
  progress: number;
  question: string;
  id: number;
  userID: string; //NEW VARIABLE
  loc = new FormGroup({
   offlineLocation: new FormControl('')
  });
  showError = "false";
  noNetwork = "false";
  locSurv: any; //NEW VARIABLE

  @ViewChild('map') mapElement: ElementRef;

  @ViewChild('button') buttonElement: ElementRef;

  constructor(private toastController: ToastController, private network: Network, private route: ActivatedRoute, private router: Router, public zone: NgZone, public navCtrl: NavController, public platform: Platform, private nativeGeocoder: NativeGeocoder, private alertController: AlertController) {
    this.route.params.subscribe(params => {
     this.title = params['title'];
     this.question = params['question'];
     this.id = parseInt(params['id']) + 1;
     this.progress = params['progress'];
     this.userID = params['userID'];
     this.locSurv = params['locSurv'];
    });
  }

  ClearAutocomplete(){
    this.autocompleteItems = [];
    console.log(this.autocomplete);
    this.autocomplete.input = '';
  }

  //AUTOCOMPLETE, SIMPLY LOAD THE PLACE USING GOOGLE PREDICTIONS AND RETURNING THE ARRAY.
  UpdateSearchResults(){
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
            url: "../../assets/imgs/blue-dot.png"
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

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.userID = params['userID'];
      this.locSurv = params['locSurv'];
     });
     console.log("useflowloc userID in ngOnInit");
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

  back() {
    if(this.network.type === 'none') {
      this.router.navigate(['/tabs/item', {address: this.loc.value.offlineLocation, title: this.title, prev: "true", id: this.id - 2, back: "yes", userID: this.userID, locSurv: this.locSurv}]);
    } else {
      this.router.navigate(['/tabs/item', {address: this.location, title: this.title, prev: "true", id: this.id - 2, back: "yes", userID: this.userID, locSurv: this.locSurv}]);
    }
  }


    /*
    constructor(private toastController: ToastController, private network: Network, private route: ActivatedRoute, private router: Router, public zone: NgZone, public navCtrl: NavController, public platform: Platform, private nativeGeocoder: NativeGeocoder) {
      this.route.params.subscribe(params => {
       this.title = params['title'];
       this.question = params['question'];
       this.id = parseInt(params['id']) + 1;
       this.progress = params['progress'];
      });
    }

    ClearAutocomplete(){
      this.autocompleteItems = [];
      this.autocomplete.input = '';
    }

    //AUTOCOMPLETE, SIMPLY LOAD THE PLACE USING GOOGLE PREDICTIONS AND RETURNING THE ARRAY.
    UpdateSearchResults(){
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
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
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
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
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
              this.formattedAddress = item.description;
            });
            map.setCenter(latLng);
          })
          .catch((error: any) => console.log(error));

    }


    initMap() {
      navigator.geolocation.getCurrentPosition((location) => {
        map = new google.maps.Map(this.mapElement.nativeElement, {
          center: {lat: location.coords.latitude, lng: location.coords.longitude},
          zoom: 15
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
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
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
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
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

    async ngOnInit() {
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
      /*this.autocomplete = { input: ''};
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
        this.router.navigate(['/tabs/item', {address: this.location, title: this.title, prev: "true", back: "no", id: this.id}]);
      } else if(this.loc.value.offlineLocation != "" && this.loc.value.offlineLocation != undefined && this.loc.value.offlineLocation != null) {
        this.router.navigate(['/tabs/item', {address: this.loc.value.offlineLocation, title: this.title, prev: "true", back: "no", id: this.id}]);
      } else if(this.network.type === 'none') {
        this.showError = "true";
      }
    }

    back() {
      if(this.network.type === 'none') {
        this.router.navigate(['/tabs/item', {address: this.loc.value.offlineLocation, title: this.title, prev: "true", id: this.id - 2, back: "yes"}]);
      } else {
        this.router.navigate(['/tabs/item', {address: this.location, title: this.title, prev: "true", id: this.id - 2, back: "yes"}]);
      }
    }*/

}
