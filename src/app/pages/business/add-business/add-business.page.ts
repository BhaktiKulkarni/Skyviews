import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { ToastService } from '../../../services/toast.service';
import { ActionSheetController, LoadingController, Events, AlertController, ModalController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalPagePage } from '../../modal-page/modal-page.page';
import { NetworkService } from '../../../services/network.service';
// import { } from 'ionic4-rating'
@Component({
  selector: 'app-add-business',
  templateUrl: './add-business.page.html',
  styleUrls: ['./add-business.page.scss'],
})
export class AddBusinessPage implements OnInit {

  addBusiness: FormGroup; connected: boolean;
  categories_check = []; avatars_check = []; preferences_check = []; user_id;
  displayPicture = ''; logo = ''; images = []; businessDetails;
  loading; rImg = []; coords; showContacts: boolean = true;
  showWebLinks: boolean = true; showStarRating: boolean = false;
  businessSelected: boolean = false;
  ntwrkSubscription;rating;
  constructor(private api: ApiService, public fb: FormBuilder, private storage: Storage, private toastService: ToastService,
    private actSheetCtrl: ActionSheetController, private camera: Camera, private route: ActivatedRoute, private router: Router,
    private loadCtrl: LoadingController, private events: Events, private alertController: AlertController,
    private modalCtrl:ModalController, private ntwrkService: NetworkService) {
    this.businessDetails = this.route.snapshot.queryParamMap.get('business');
    this.coords = JSON.parse(this.route.snapshot.queryParamMap.get('coordinates'));
    if(this.coords !=null){
      this.lat = this.coords.lat;
      this.lng = this.coords.lng;  
    }
    // console.log(this.coords);

    this.addBusiness = this.fb.group({
      location: ['', Validators.required],
      establishment_name: ['', Validators.required],
      establishment_description: [''],
      tollfree_phoneno: [],
      mobile_no1: [],
      mobile_no2: [],
      establishment_phoneno: [],
      establishment_website_url: [],
      establishment_email: [],
      establishment_charges_daily: [],
      fb_url: [],
      twitter_url: [],
      instagram_url: [],
      tripadvisor_url: [],
      book_now_url: [],
      star_rating: [],
      business_type: [],
      free_wifi: []
    });

    if (this.coords != null) {
      this.addBusiness.controls.location.setValue(this.lat + ',' + this.lng);
    }
    if (this.businessDetails != null) {
      this.businessDetails = JSON.parse(this.businessDetails);
      this.currentlng = this.businessDetails.longitude;
      this.currentlat = this.businessDetails.latitude;
      this.logo = this.businessDetails.logo_img;
      this.displayPicture = this.businessDetails.display_img;
      this.images = this.businessDetails.gallery_images;
      this.addBusiness.controls.location.setValue(this.currentlat + ',' + this.currentlng);
      this.addBusiness.controls.establishment_name.setValue(this.businessDetails.title);
      this.addBusiness.controls.establishment_description.setValue(this.businessDetails.description);
      this.addBusiness.controls.establishment_phoneno.setValue(this.businessDetails.phone_number);
      this.addBusiness.controls.tollfree_phoneno.setValue(this.businessDetails.tollfree_phoneno);
      this.addBusiness.controls.mobile_no1.setValue(this.businessDetails.mobile_no1);
      this.addBusiness.controls.mobile_no2.setValue(this.businessDetails.mobile_no2);
      this.addBusiness.controls.establishment_website_url.setValue(this.businessDetails.site_url);
      this.addBusiness.controls.establishment_email.setValue(this.businessDetails.email);
      this.addBusiness.controls.establishment_charges_daily.setValue(this.businessDetails.price);
      this.addBusiness.controls.fb_url.setValue(this.businessDetails.fb_url);
      this.addBusiness.controls.twitter_url.setValue(this.businessDetails.twitter_url);
      this.addBusiness.controls.instagram_url.setValue(this.businessDetails.instagram_url);
      this.addBusiness.controls.tripadvisor_url.setValue(this.businessDetails.tripadvisor_url);
      this.addBusiness.controls.book_now_url.setValue(this.businessDetails.book_now_url);
      this.addBusiness.controls.star_rating.setValue(this.businessDetails.rating);
      this.addBusiness.controls.business_type.setValue(this.businessDetails.business_type);
      if (this.businessDetails.business_type == 'business') {
        this.businessSelected = true;
      }
      this.addBusiness.controls.free_wifi.setValue(this.businessDetails.free_wifi);
    }
    // this.networkSubscription();
  }

  showContactFields() {
    this.showContacts = !this.showContacts;
  }

  showWebLinkFields() {
    this.showWebLinks = !this.showWebLinks;
  }

  async updateCoords(){
    console.log('addBusiness');
    const modal = await this.modalCtrl.create({
      component: ModalPagePage,
      componentProps: {
        'page': 'map'
      },
      cssClass: 'map-page-css'
    });
    modal.onWillDismiss().then((data: any) => {
      if (data.data != undefined) {
        const coords = data.data;
        this.currentlng = data.data.lng;
        this.currentlat = data.data.lat;
        this.addBusiness.controls.location.setValue(this.currentlat + ',' + this.currentlng);
      }
    });
    await modal.present();
  }

  businessTypeSel(ev) {
    // console.log(ev);
    // console.log(ev.target.value);
    if (ev.target.value == 'business') {
      this.businessSelected = true;
    } else {
      this.businessSelected = false;
    }
  }

  wifiSelection(ev){
    console.log(ev.target.value);
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

  onRateChange(event) {
    console.log(event);
  }

  removeImg(img, i) {
    console.log(img);
    this.rImg.push(img.post_id);
    this.images.splice(i, 1);
    console.log(this.rImg);
  }

  ionViewWillLeave() {
    // this.events.unsubscribe('connected');
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
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

  slideOpts = {
    slidesPerView: 3,
   };
  rate: any = 1;
  avatars;
  preferences;
  categories;
  map: mapboxgl.Map;
  marker: mapboxgl.Marker;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = 18.231019885128674;
  lng = -63.055485312961494;
  currentlat;
  currentlng;
  currentLocation: any;
  pinedLat: any;
  pinedLng: any;

  ngOnInit() {
    this.getUserdetails();
    // this.buildMap();
    if (this.businessDetails == null) {
      // setTimeout(() => {
      //   // this.getCurrentLocation();
      // }, 200);
    }
    this.getPreferenceAvatarCategories();
    this.ntwrkServiceSubscription();
  }

  getCurrentLocation() {
    if (this.pinedLat != null) {
      // console.log("TCL: AddBusinessPage -> getCurrentLocation -> this.pinedLat ", this.pinedLat)
      const location = this.pinedLat + ',' + this.pinedLng;
      this.addBusiness.controls.location.setValue(location);
    } else {
      // console.log("TCL: AddBusinessPage -> getCurrentLocation -> getCurrentLocation");
      // get current location of user
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
          // console.log(position);
          const location = position.coords.latitude + ',' + position.coords.longitude;
          this.currentlat = position.coords.latitude;
          this.currentlng = position.coords.longitude;
          console.log(this.currentlat, this.currentlng);
          this.addBusiness.controls.location.setValue(location);
        });
      } else {
        alert('Provide access to fetch current location');
      }
    }
  }

  getCheckedDetails() {
    if (this.categories != undefined) {
      const categories = this.businessDetails.categories;
      for (let i = 0; i < categories.length; i++) {
        // console.log(categories[i]);
        console.log(this.businessDetails);
        if(categories[i].name == 'Accommodation'){
          this.showStarRating = true;
          // this.addBusiness.controls.star_rating.setValue(categories[i].rate);
          this.rating = this.businessDetails.rating;
        }
        for (let j = 0; j < this.categories.length; j++) {
          if (this.categories[j].term_id == categories[i].term_id) {
            this.categories[j].checked = true;
          }
        }
        //this.categories[i].checked = true;
      }
    }
    if (this.avatars != undefined) {
      const avatars = this.businessDetails.avatars;
      for (let i = 0; i < avatars.length; i++) {
        // console.log(avatars[i]);
        for (let j = 0; j < this.avatars.length; j++) {
          if (this.avatars[j].term_id == avatars[i].term_id) {
            this.avatars[j].checked = true;
          }
        }
        //this.categories[i].checked = true;
      }
    }
    if (this.preferences != undefined) {
      const preference = this.businessDetails.preferences;
      for (let i = 0; i < preference.length; i++) {
        // console.log(preference[i]);
        for (let j = 0; j < this.preferences.length; j++) {
          if (this.preferences[j].term_id == preference[i].term_id) {
            this.preferences[j].checked = true;
          }
        }
        //this.categories[i].checked = true;
      }
    }
  }

  getUserdetails() {
    this.storage.get('businessUser').then(resp => {
      console.log(resp);
      this.user_id = resp.user_id;
    }).catch(err => {
      console.log(err);
    });
  }

  preferencesChecked(event, preference) {
    console.log(preference);
    if (event.detail.checked == true) {
      console.log(preference.term_id);
      this.preferences_check.push(preference.term_id);
      console.log(this.preferences_check);
    } else {
      for (let i = 0; i < this.preferences_check.length; i++) {
        if (this.preferences_check[i] == preference.term_id) {
          this.preferences_check.splice(i, 1);
          console.log(this.preferences_check);
        }
      }
    }
  }

  avatarsChecked(event, avatars) {
    console.log(avatars.term_id);
    this.avatars_check = avatars.term_id;
  }

  categoriesChecked(event, category) {
    console.log(category);
    if (event.detail.checked == true) {
      //console.log(category.term_id);
      this.categories_check.push(category.term_id);
      if (category.name == 'Accommodation') {
        this.showStarRating = true;
      }
      //console.log(this.categories_check);
    } else {
      if (category.name == 'Accommodation') {
        this.showStarRating = false;
      }
      for (let i = 0; i < this.categories_check.length; i++) {
        if (this.categories_check[i] == category.term_id) {
          this.categories_check.splice(i, 1);
          //console.log(this.categories_check);
        }
      }
    }
  }

  getPreferenceAvatarCategories() {
    this.api.getApiResponse('get_avatars').then(res => {
      this.avatars = res;
      if (this.businessDetails != null) {
        this.getCheckedDetails();
      }
    }, err => {
      console.log(JSON.stringify(err));
    });

    this.api.getApiResponse('get_preferences').then(res => {
      this.preferences = res;
      if (this.businessDetails != null) {
        this.getCheckedDetails();
      }
    }, err => {
      console.log(JSON.stringify(err));
    });

    this.api.getApiResponse('get_categories').then(res => {
      this.categories = res;
      if (this.businessDetails != null) {
        this.getCheckedDetails();
      }
    }, err => {
      console.log(JSON.stringify(err));
    });
  }

  updateLocation(coords) {
    this.pinedLat = coords.lat;
    this.pinedLng = coords.lng;
    // console.log('update location called' + JSON.stringify(coords));
    const location = coords.lat + ',' + coords.lng;
    this.addBusiness.controls.location.setValue(location);
  }

  buildMap() {
    var _this = this;
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw';
    var coordinates = document.getElementById('coordinates');
    var map = new mapboxgl.Map({
      container: 'map4',
      style: this.style,
      center: [this.lng, this.lat],
      zoom: 9.75
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

      map.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        // zoom:0
      }), 'top-left');

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

  onModelChange(event) {
    //  console.log('Your rate:', event);
  }

  addBusinessDetails(value) {
    this.present('add');
    console.log(JSON.stringify(value));
    value.categories_check = this.categories_check;
    value.avatars_check = this.avatars_check;
    value.preferences_check = this.preferences_check;
    value.user_id = this.user_id;
    value.loc_lat = this.coords.lat;
    value.loc_lng = this.coords.lng;

    if (this.logo != '') {
      value.logo_img = this.logo;
    }
    if (this.displayPicture != '') {
      value.display_img = this.displayPicture;
    }
    if (this.images.length > 0) {
      value.gallery_images = this.images;
    }

    //value.place_id = this.businessDetails.ID;
    console.log(JSON.stringify(value));
    console.log(this.coords);
    this.addBusinessUserService(value);
  }

  addBusinessUserService(ud) {
    this.api.addBusinessUser(ud).subscribe((res: any) => {
      //console.log(res);
      if (res != null) {
        if (res.message == 'Place added succesfully!.') {
          //this.toastService.presentToast('Place added successfully!.');
          this.toastService.presentToast('New request raised');
          this.addBusiness.reset();
          this.loadCtrl.dismiss();
          this.router.navigate(['/list-business'], { replaceUrl: true });
        } else {
          this.toastService.presentToast('Unable to process, try again later');
          this.loadCtrl.dismiss();
        }
      } else {
        this.toastService.presentToast('Unable to process, please check if all fields are added and try again');
        this.loadCtrl.dismiss();
      }

    }, err => {
      console.log(err);
      this.toastService.presentToast('Error Occured, try again later!');
      this.loadCtrl.dismiss();
    });
  }

  async present(addUpdate) {
    if (addUpdate == 'update') {
      this.loading = await this.loadCtrl.create({
        message: 'Updating place details..'
      });
    }
    else {
      this.loading = await this.loadCtrl.create({
        message: 'Adding new request..'
      });
    }
    await this.loading.present();
  }

  updateBusinessDetails(value) {
    this.present('update');
    console.log(this.businessDetails);
    value.categories_check = this.categories_check;
    value.avatars_check = this.avatars_check;
    value.preferences_check = this.preferences_check;
    value.user_id = this.user_id;
    value.logo_img = this.logo;
    value.display_img = this.displayPicture;
    value.gallery_images = this.images;
    value.place_id = this.businessDetails.ID;
    value.removeImg = this.rImg;
    value.loc_lat = this.currentlat;
    value.loc_lng = this.currentlng;
    this.updateBusinessUserService(value);
  }

  updateBusinessUserService(data) {
    this.api.updateBusinessUser(data).subscribe((res: any) => {
      // console.log(res);
      this.loadCtrl.dismiss();
      if(res.message == "Place updated successfully."){
        this.toastService.presentToast('New update request raised');
        this.addBusiness.reset();
        this.router.navigate(['/list-business'], { replaceUrl: true });
      }else{
        this.toastService.presentToast('Unable to process, try again later');
      }
      
    }, err => {
      // console.log(err);
      this.loadCtrl.dismiss();
      this.toastService.presentToast('Unable to process, try again later');
    });
  }

  // UPLOAD IMAGE START
  uploadFile(options) {
    console.log(options);
    if (options == 'logo') {
      this.openCamera('photo', options);
    } else {
      this.presentActionSheet(options);
    }
  }

  async presentActionSheet(options) {
    // console.log("Here.............");
    const actionSheet = await this.actSheetCtrl.create({
      header: 'Select an option',
      buttons: [
        {
          text: 'Camera',
          role: 'camera',
          handler: () => {
            console.log('camera clicked');
            this.openCamera('camera', options);
          }
        },
        {
          text: 'Saved Album',
          handler: () => {
            console.log('album clicked');
            this.openCamera('photo', options);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  openCamera(sourceType, option) {
    let src;
    // console.log(sourceType);
    if (sourceType == 'camera') {
      src = this.camera.PictureSourceType.CAMERA;
    } else if (sourceType == 'photo') {
      src = this.camera.PictureSourceType.SAVEDPHOTOALBUM;
    }
    const options: CameraOptions = {
      quality: 20,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: src,
      allowEdit: true
    };
    this.camera.getPicture(options).then(imageData => {
      if (option == 'dp') {
        this.displayPicture = 'data:image/jpeg;base64,' + imageData;
      } else if (option == 'logo') {
        this.logo = 'data:image/jpeg;base64,' + imageData;
      } else if (option == 'images') {
        this.images.push('data:image/jpeg;base64,' + imageData);
      }
    }, err => {
      console.log(JSON.stringify(err));
      //alert(JSON.stringify(err));
    });
  }
  // UPLOAD IMAGE END
}