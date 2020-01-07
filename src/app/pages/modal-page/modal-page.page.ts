import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController, Events, AlertController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { markParentViewsForCheck } from '@angular/core/src/view/util';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-modal-page',
  templateUrl: './modal-page.page.html',
  styleUrls: ['./modal-page.page.scss'],
})
export class ModalPagePage implements OnInit {
  @Input() page: string;
  @Input() eventsArr: object;
  @Input() business: object;

  fpForm: FormGroup; optForm: FormGroup; resetPassword: FormGroup;
  emailNSubmitted = true;
  otpNSubmitted = false;
  passwordNSubmitted = false;
  forgetPasswordResp: any = [];
  otpCount: any = 3;
  retryButton = true;
  timerInterval: number; timer;
  connected: boolean;
  // map variables start
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = 18.231019885128674;
  lng = -63.055485312961494;
  pinedLat: any;
  pinedLng: any;
  ntwrkSubscription;
  // map variables end
  constructor(public events: Events, private router: Router, private route: ActivatedRoute, private fb: FormBuilder,
              private modalCtrl: ModalController, public loader: LoaderService, public toastService: ToastService,
              private authService: AuthenticationService, public alertController: AlertController, private ntwrkService: NetworkService) {
    // this.page = this.navParams.get('page');
    console.log(this.page);
    
  }

  initForms() {
    this.fpForm = this.fb.group({
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')
      ])]
    });

    this.optForm = this.fb.group({
      otp: ['', Validators.required]
    });

    this.resetPassword = this.fb.group({
      password: ['', Validators.compose([
        Validators.minLength(5),
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9!@#$&()-`.+,/]*$')
      ])],
      cpass: ['', Validators.required]
    }, { validator: this.matchingPasswords('password', 'cpass') });
  }

  getCurrentLocation() {
    if (this.pinedLat != null) {
      // console.log("TCL: AddBusinessPage -> getCurrentLocation -> this.pinedLat ", this.pinedLat)
      const location = this.pinedLat + ',' + this.pinedLng;
    } else {
      // console.log("TCL: AddBusinessPage -> getCurrentLocation -> getCurrentLocation");
      // get current location of user
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
          // console.log(position);
          const location = position.coords.latitude + ',' + position.coords.longitude;
          this.pinedLat = position.coords.latitude;
          this.pinedLng = position.coords.longitude;
        });
      } else {
        alert('Provide access to fetch current location');
      }
    }
  }

  ionViewWillLeave() {
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
    });
  }

  ntwrkServiceSubscription() {
    this.ntwrkSubscription = this.ntwrkService.getNetworkStatus().subscribe((res:boolean)=>{
      console.log(res);
      this.connected = res;
      if(res == false){
        const option = 'retry';
        const params = { message: 'Netwrok is disconnected', header: 'No Internet' };
        this.retryConnection(params, option);
      }
    },err=>{
      console.log(err);
    });
  }

  ionViewDidLoad(){
    // this.networkSubscription();
  }

  networkSubscription() {
    this.events.subscribe('connected', (con) => {
      console.log('subscribed', con);
      this.connected = con;
      if (con == false) {
        const option = 'retry';
        const params = { message: 'Netwrok is disconnected', header: 'No Internet' };
        this.retryConnection(params, option);
      }
    });
  }

  async retryConnection(params, option) {
    const alert = await this.alertController.create({
      header: params.header,
      message: params.message,
      buttons: [
        {
          text: 'Retry',
          handler: () => {
            if (option == 'retry') {
              if (this.connected == false) {
                const option = 'retry';
                const params = { message: 'Network is disconnected', header: 'No Internet' };
                this.retryConnection(params, option);
              } else {
                this.ngOnInit();
              }
            }
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  matchingPasswords(pas, cpas) {
    return (group: FormGroup) => {
      const password = group.controls[pas];
      const cpassword = group.controls[cpas];
      if (password.value !== cpassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    };
  }

  ngOnInit() {
    // console.log(`${this.page}`);
    // console.log(`${JSON.stringify(this.eventsArr)}`);
    // console.log(`${this.eventsArr}`);
    // console.log(`${this.business}`);
    // console.log(this.page);
    if (this.page == 'forgotPass'){
      this.initForms();
    }
    if (this.page == 'map') {
      this.getCurrentLocation();
      setTimeout(() => {
        this.buildMap();
      }, 100);
    }
    this.ntwrkServiceSubscription();
  }

  sendEmail(data) {
    this.loader.present();
    // console.log(JSON.stringify(data));
    this.authService.forgotPassword(data.email).subscribe((resp: any) => {
      this.loader.dismiss();
      // console.log('Forgot password response', resp);
      this.forgetPasswordResp = resp;
      // console.log(resp.user_id);
      // console.log('user id => ', this.forgetPasswordResp.user_id);
      if ((resp.user_id == null) || (resp.user_id == undefined)) {
        // this.loader.dismiss();
        this.toastService.presentToast('User not registered! Verify your email');
      } else {
        this.emailNSubmitted = false;
        this.otpNSubmitted = true;
        // this.loader.dismiss();
        this.toastService.presentToast('OTP sent to your email');
        this.startTimer();
      }
    });
  }

  sendOtp(data) {
    this.loader.present();
    // console.log(data);
    this.emailNSubmitted = false;
    if (this.forgetPasswordResp.otp == data.otp) {
      this.otpNSubmitted = false;
      this.passwordNSubmitted = true;
      this.loader.dismiss();
    } else {
      this.toastService.presentToast('OTP does not match');
      this.otpNSubmitted = true;
      this.passwordNSubmitted = false;
      this.optForm.reset();
      this.otpCount--;
      this.loader.dismiss();
      if (this.otpCount != 0) {
        this.otpNSubmitted = true;
      } else {
        this.modalCtrl.dismiss();
      }
      console.log(this.otpCount);
    }
  }

  rPassword(data) {
    this.loader.present();
    // console.log(data);
    data.user_id = this.forgetPasswordResp.user_id;
    data.user_email = this.forgetPasswordResp.user_email;
    data.otp = this.forgetPasswordResp.otp;
    data.newPassword = data.cpass;
    console.log(data);
    this.authService.resetPassword(data).subscribe((res: any) => {
      this.loader.dismiss();
      console.log(res);
      if (res.message == 'User password changed successfully.') {
        this.modalCtrl.dismiss();
        this.toastService.presentToast(res.message);
      } else {
        this.toastService.presentToast('Unable to process, try again later');
        this.modalCtrl.dismiss();
      }
    }, err => {
      console.log(err);
    });
  }

  dismiss(val) {
    this.modalCtrl.dismiss({
      dismissed: true,
      data: val
    });
  }

  dismissModal(){
    this.modalCtrl.dismiss();
  }

  startTimer() {
    this.timerInterval = 30;
    this.timer = setInterval(() => {
      // console.log('timeleft'+ this.timerInterval);
      if (this.timerInterval > 0) {
        this.timerInterval = this.timerInterval - 1;
      } else {
        this.interval();
      }
    }, 1000);
  }

  interval() {
    this.retryButton = false;
    clearInterval(this.timer);
  }

  // MAP MODAL START
  async buildMap() {
    var _this = this;
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw';
    var coordinates = document.getElementById('coordinates');
    var map = new mapboxgl.Map({
      container: 'map4',
      style: this.style,
      center: [this.lng, this.lat],
      zoom: 9.75
    });
    var geocoder = new MapboxGeocoder({ // Initialize the geocoder
      accessToken: mapboxgl.accessToken, // Set the access token
      mapboxgl: mapboxgl, // Set the mapbox-gl instance
      marker: false, // Do not use the default marker style
      bbox: [-63.199320470460435,18.146682398527545,-62.92130767367502,18.310936065551246] //boundary for Anguilla
    });
    var canvas = map.getCanvasContainer();
    var geojsonmarker = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [this.lng, this.lat]
        }
      }]
    };

    map.addControl((geocoder),'top-left');

    function onMove(e) {
      var coords = e.lngLat;
      // Set a UI indicator for dragging.
      canvas.style.cursor = 'grabbing';
      // Update the Point feature in `geojson` coordinates
      // and call setData to the source layer `point` on it.
      geojsonmarker.features[0].geometry.coordinates = [coords.lng, coords.lat];
      map.getSource('point').setData(geojsonmarker);
    }

    function onUp(e) {
      var coords = e.lngLat;
      // Print the coordinates of where the point had
      // finished being dragged to on the map.
      // coordinates.style.display = 'block';
      // coordinates.innerHTML = 'Longitude: ' + coords.lng + '<br />Latitude: ' + coords.lat;
      // console.log('Longitude of pined location: ' + coords.lng + 'Latitude of pined location: ' + coords.lat);
      console.log(coords.lat, coords.lng);
      _this.updateLocation(coords);
      canvas.style.cursor = '';
      map.off('mousemove', onMove);
      map.off('touchmove', onMove);
    }


    map.on('load', function () {
      map.loadImage('../../../assets/imgs/mapbox-icon.png', function (error, image) {
        if (error) { throw error; }
        map.addImage('marker', image);
        // Add a single point to the map
        map.addSource('point', {
          'type': 'geojson',
          'data': geojsonmarker
        });
        map.addLayer({
          'id': 'point',
          'type': 'symbol',
          'source': 'point',
          'layout': {
            'icon-image': 'marker',
            'icon-size': 0.20,
            'icon-allow-overlap': true
          }
        });
      });
      // When the cursor enters a feature in the point layer, prepare for dragging.
      map.on('mouseenter', 'point', function () {
        map.setPaintProperty('point', 'circle-color', '#3bb2d0');
        canvas.style.cursor = 'move';
      });

      map.on('mouseleave', 'point', function () {
        map.setPaintProperty('point', 'circle-color', '#3887be');
        canvas.style.cursor = '';
      });

      map.on('mousedown', 'point', function (e) {
        // Prevent the default map drag behavior.
        e.preventDefault();
        canvas.style.cursor = 'grab';
        map.on('mousemove', onMove);
        map.once('mouseup', onUp);
      });

      map.on('touchstart', 'point', function (e) {
        if (e.points.length !== 1) { return; }
        // Prevent the default map drag behavior.
        e.preventDefault();
        map.on('touchmove', onMove);
        map.once('touchend', onUp);
      });

      

      geocoder.on('result', function(e) {
        console.log(e.result.geometry.coordinates);
        geojsonmarker.features[0].geometry.coordinates = e.result.geometry.coordinates;
        map.getSource('point').setData(geojsonmarker);
        const coords = {lat:e.result.geometry.coordinates[0],lng:e.result.geometry.coordinates[1]}
        _this.updateLocation(coords);
        // map.getSource('single-point').setData(e.result.geometry);
        console.log(e.result.geometry);
      });

      // map.addControl(new MapboxGeocoder({
      //   accessToken: mapboxgl.accessToken,
      //   mapboxgl: mapboxgl,
      //   bbox:[-63.199320470460435,18.146682398527545,-62.92130767367502,18.310936065551246] //boundary for Anguilla
      //   // zoom:0
      // }), 'top-left');

      //track current location of user
      map.addControl(new mapboxgl.GeolocateControl({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
      );
    });
  }

  updateLocation(coords) {
    this.pinedLat = coords.lat;
    this.pinedLng = coords.lng;
    console.log('update location called' + JSON.stringify(coords));
    const location = coords.lat + ',' + coords.lng;
    // updated coordinates here
    // this.addBusiness.controls.location.setValue(location);
  }

  saveCoordinates(){
    console.log('update location'+this.pinedLat, this.pinedLng);
    const coords = {lat: this.pinedLat, lng:this.pinedLng}
    this.modalCtrl.dismiss(coords);
  }


  // MAP MODAL END
}
