import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController, AlertController, Events, ModalController, NavController } from '@ionic/angular';
import * as mapboxgl from 'mapbox-gl';
import { Platform, IonContent, IonSearchbar } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationExtras, NavigationStart } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { Auth } from '../../../auth';
import { LoaderService } from 'src/app/services/loader.service';
import { Storage } from '@ionic/storage';
import { GeojsonService } from 'src/app/services/geojson.service';
import { FormControl } from '@angular/forms';
// import { debounceTime } from "rxjs/operators";
import { ToastService } from 'src/app/services/toast.service';
// import { Subscription } from 'rxjs';
import { ModalPagePage } from '../modal-page/modal-page.page';
import { filter } from 'rxjs/operators';
import { NetworkService } from '../../services/network.service';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss']
})
export class LandingPage implements OnInit {
  nws;
  public isSearchbarOpen = false;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('mySearchbar') searchbar: IonSearchbar;
  isPlaceAvailable = false;
  ratings: any = 4;
  optionSelected: any;
  map: mapboxgl.Map;
  recStyle = [false]
  style = 'mapbox://styles/mapbox/streets-v11'; //'mapbox://styles/mapbox/outdoors-v9';
  lat = 18.197; //19.9975; Lower : 18.15620555283993 Upper : 18.27473243435528
  lng = -63.048; // 73.7898 ; Lower : -63.17486605316276 Upper : -62.96576196079815
  slideOpts = {
    slidesPerView: 6.5,
    initialSlide: 0,
    speed: 400
  };
  carousalSlideOpts = {
    slidesPerView: 3,
    initialSlide: 0,
    speed: 400,
    spaceBetween: 5
  };
  subscription: any;
  avtar: any;
  preferences: any = [];
  categoryIdByAvtarPrefrences: any;
  categoryIds: any = [];
  sessionDetails: any = { traveler: [], business: [] };
  placeDetail: any = { place_detail: [], approve_comment: [] };
  list: number[] = [];
  onIsland: any;
  data: any = [];
  addLayer: any;
  finalGeoJson: any;
  searching: boolean = false;
  // searchItems;
  searchTerm: string = '';
  searchControl: FormControl;
  searchResults: any = [];
  categories: any;
  placeByCategory: any = [];
  savedPlaces: any = [];
  searchOnce: boolean = false;
  mapIcon: string = 'assets/imgs/Accommodation-icon.png';
  // category: string;
  categorySelected;
  categorySelect: any;
  approvedComments: any = [];
  selected: any;
  connected: boolean;
  counter = 0;
  ph;ntwrkSubscription;
  mode;searchInput='';
  constructor(
    public api: ApiService,
    private menu: MenuController,
    private router: Router,
    private platform: Platform,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private auth: Auth,
    private loader: LoaderService,
    public events: Events,
    public storage: Storage,
    public geojsonMarker: GeojsonService,
    public toast: ToastService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private ntwrkService: NetworkService
  ) {
    if(this.platform.is('ios')){
      this.mode = 'ios';
    }else if(this.platform.is('android')){
      this.mode ='android';
    }
    // console.log('platform height :'+this.platform.height());
    this.menu.enable(true);
    mapboxgl.accessToken =
      'pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw';
    this.storage.get('pop').then(res => {
      // console.log(res);
      if (res == true) {
        this.currentEvents();
      }
    })
    this.ph = (this.platform.height() / 9) + '%';
    console.log(this.ph);
    console.log(this.platform.height());
    setTimeout(() => {
      document.getElementById("sticky").style.marginTop = this.ph;
    }, 200);

    // this.searchControl = new FormControl();
  }

  currentEvents() {
    this.apiService.getApiResponse('get_current_event_category_posts').then((res: any) => {
      // console.log(res);
      if (res.events.length > 0) {
        // console.log('events present');
        this.openModal(res.events);
      }
      // open modal page with slider if results
    }).catch(err => {
      console.log(err);
    });
  }

  async openModal(events) {
    const modal = await this.modalCtrl.create({
      component: ModalPagePage,
      componentProps: {
        'page': 'events',
        eventsArr: events
      },
      cssClass: 'event-page-css'
    });
    modal.onWillDismiss().then(data => {
      // console.log(data);
      this.storage.set('pop', false);
    });
    await modal.present();
  }

  networkSubscription() {
    this.nws = this.events.subscribe('connected', (con) => {
      // console.log('landing page 98 '+ con);
      // this.connected = con;
      if (con == false) {
        const option = 'retry';
        const params = { message: 'Network is disconnected', header: 'No Internet' };
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
                this.ionViewDidEnter();
              }
            }
            //navigator["app"].exitApp();
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }


  ngOnInit() {
    this.avtar = this.route.snapshot.queryParamMap.get('id');
    this.preferences = this.route.snapshot.queryParamMap.get('ids');
    this.ntwrkServiceSubscription();
  }

  scrollTo(cat, i) {
    if (cat.value.length > 0) {
      this.recStyle[i] = true;
      const a = document.getElementById(cat.title);
      if (a) {
        a.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  ionViewDidEnter() {
    console.log('ioionViewDidEntern');
    this.categorySelected = document.getElementById('categorySelected');
    //this.categorySelected.innerHTML = "Accommodation";
    this.menu.enable(true);
    this.storage.get('travellerUser').then(resp => {
      this.sessionDetails.traveler = resp;
      this.events.publish('user:created', this.sessionDetails.traveler);
    });
    this.storage.get('businessUser').then(resp => {
      this.sessionDetails.business = resp;
    });
    this.storage.get('onIsland').then(resp => {
      this.onIsland = resp;
    });

    this.api.getApiResponse('get_categories').then(res => {
      this.categories = res;
    }, err => {
      console.log(JSON.stringify(err));
    });

    // this.initialCategoryMarker();
    this.getStoredPreferencesAvtars();
    this.recStyle = [false];
    this.recStyle[0] = true;
    // this.backButtonSubscription();
  }

  backButtonSubscription() {
    if (this.platform.is('android')) {
      this.platform.backButton.subscribeWithPriority(0, () => {
        console.log('229 ' + this.counter);
        if (!this.counter) {
          const appStr = 'app';
          navigator[appStr].exitApp();
        }
        const currUrl = this.router.url;
        if (currUrl.includes('/landing')) {
        }
        console.log(this.router.url);
        // this.router.getCurrentNavigation();
        // this.navCtrl.back();
        // this.navCtrl.
      });
    }
    this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      console.log('event.navigationTrigger ' + event.navigationTrigger);
      if (event.navigationTrigger === 'popstate') {
        this.counter--;
        console.log('240 counter-- ' + this.counter);
      } else {
        this.counter++;
        console.log('243 counter++ ' + this.counter);
      }
    });
  }

  navPref() {
    this.router.navigate(['/preferences'], { replaceUrl: true });
  }

  initialCategoryMarker() {
    this.placeByCategory = [];
    this.api.getCategoryHotels(46).subscribe(res => {
      // this.loader.present();
      this.placeByCategory = res;
      // console.log("TCL: LandingPage -> initialCategoryMarker -> this.placeByCategory",this.placeByCategory);
      this.makeGeojson();
    });
  }

  async getStoredPreferencesAvtars() {
    await this.storage.get('avtar').then(resp => {
      console.log(resp);
      if (resp == {}) {
        this.avtar = '';
      }
      else {
        this.avtar = resp.term_id;
      }
    });

    await this.storage.get('preference').then(resp => {
      console.log(resp);
      this.preferences = resp;
      this.loadPlaces();
      // if (resp != undefined || resp.length != 0) {
      //   Array.prototype.map.call(resp, s => {
      //     this.preferences = s;
      //     this.loadPlaces();
      //   }).toString();
      // }
    });
  }

  loadPlaces() {
    var count: number = 0;
    console.log(this.avtar);
    if (this.avtar == undefined) {
      this.avtar = '';
    }
    this.loader.present();
    this.apiService.getCategoryIdByAvtarPrefrence(this.avtar, this.preferences, this.onIsland).subscribe((resp: any) => {
      console.log(resp);
      this.categoryIdByAvtarPrefrences = resp;
      this.makeGeojson1(resp.category[0]);
      this.categorySelected.innerHTML = resp.category[0].title;
      this.mapIcon = 'assets/imgs/' + resp.category[0].title.trim() + '-icon.png';
      this.searchResults = resp;
      this.loader.dismiss();
    }, error => {
      console.log(error);
      this.loader.dismiss();
    });
  }

  async buildMap() {
    var _this = this;
    mapboxgl.accessToken =
      'pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw';
    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.lng, this.lat],
      zoom: 10.2
    });

    // disable map rogettation using right click + drag
    map.dragRotate.disable();
    // disable map rotation using touch rotation gesture
    map.touchZoomRotate.disableRotation();
    //  console.log(this.mapIcon);

    map.on('load', () => {
      // tslint:disable-next-line: max-line-length
      //map.loadImage('../../../assets/imgs/marker3.png', (error, image) => {
      map.loadImage(this.mapIcon, (error, image) => {
        if (error) {
          throw error;
        }
        map.addImage('marker', image);
        // Add a layer showing the places.
        map.addLayer(
          // this.addLayer
          {
            id: 'places',
            type: 'symbol',
            source: {
              type: 'geojson',
              data: this.finalGeoJson
            },
            layout: {
              'icon-image': 'marker',
              'icon-size': 0.1,
              'icon-allow-overlap': true
            }
          }
        );
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'places', function (e) {
        // console.log(e);
        // console.log(e.features[0].properties);
        this.markerLat = e.lngLat.lat;
        this.markerLng = e.lngLat.lng;
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;
        var title = e.features[0].properties.title;
        var place_id = e.features[0].properties.place_id;
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        var domelem = document.createElement('a');
        domelem.innerHTML =
          '<b style=\'font-size: 15px; color:#000;\'>' +
          title +
          '</b><br>' +
          'more';
        domelem.onclick = function () {
          _this.placeDetails({ place_id: place_id }, title);
        };
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML('<h3>' + title + '</h3>')
          .setDOMContent(domelem)
          .addTo(map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = '';
      });
    });
    // }
  }

  isActive(item) {
    return this.selected === item;
  }

  async marker(category, i) {
    if (category.value.length > 0) {
      console.log(category);
      // console.log(category)
      this.recStyle = [false];
      this.recStyle[i] = true;
      //console.log('Inside marker', category);
      this.categorySelected = document.getElementById('categorySelected');
      this.categorySelected.style.display = 'block';
      this.categorySelected.innerHTML = category.title;
      this.mapIcon = '';
      var matchedCatId;
      this.mapIcon = 'assets/imgs/' + category.title.trim() + '-icon.png';
      this.makeGeojson1(category);
    } else {
      alert('No places availabe for selected avatar and preference');
    }
  }

  categoryClicked(cat) {
    console.log(cat);
    // this.categorySelect = title;
    let navigationExtras: NavigationExtras = {
      queryParams: {
        special: JSON.stringify(cat)
      }
    };
    this.router.navigate(['/category-places'], navigationExtras);
  }

  makeGeojson() {
    this.data = [];
    this.finalGeoJson = [];
    // console.log("TCL: makeGeojson -> this.placeByCategory", this.placeByCategory);
    for (var j = 0; j < this.placeByCategory.length; j++) {
      var coordinates: any = [];
      coordinates.push(parseFloat(this.placeByCategory[j].longitude));
      coordinates.push(parseFloat(this.placeByCategory[j].latitude));
      // console.log("TCL: marker -> coordinates", coordinates)
      var markers = [];
      // console.log(this.placeByCategory[j])
      markers.push(coordinates);
      markers.push(this.placeByCategory[j].title);
      markers.push(this.placeByCategory[j].content);
      markers.push(this.placeByCategory[j].place_id);
      // console.log("TCL: marker -> markers", markers);
      var geojsonfeatures: any = {};
      geojsonfeatures = this.geojsonMarker.getGeojsonData(markers);
      //  console.log(geojsonfeatures);
      this.data.push(geojsonfeatures);
      // this.loader.dismiss();
    }
    this.finalGeoJson = { type: 'FeatureCollection', features: this.data };
    // console.log("TCL: makeGeojson -> this.finalGeoJson", this.finalGeoJson);
    this.buildMap();
  }

  makeGeojson1(category) {
    this.data = [];
    this.finalGeoJson = [];
    // console.log(category.value);
    for (let i = 0; i < category.value.length; i++) {
      var coordinates: any = [];
      coordinates.push(parseFloat(category.value[i].coordinates.longitude));
      coordinates.push(parseFloat(category.value[i].coordinates.latitude));
      // console.log("TCL: marker -> coordinates", coordinates)
      var markers = [];
      // console.log(this.placeByCategory[j])
      markers.push(coordinates);
      markers.push(category.value[i].title);
      markers.push(category.value[i].excerpt);
      markers.push(category.value[i].place_id);
      // console.log(category.value[i]);
      // console.log("TCL: marker -> markers", markers);
      var geojsonfeatures: any = {};
      geojsonfeatures = this.geojsonMarker.getGeojsonData(markers);
      // console.log(geojsonfeatures);
      this.data.push(geojsonfeatures);
    }
    this.finalGeoJson = { type: 'FeatureCollection', features: this.data };
    this.buildMap();
  }

  getItems(ev: any) {
    this.isSearchbarOpen = true;
    this.searchResults = [];
    const val = ev.srcElement.value;
    if (val.length >= 3) {
      this.searchOnce = true;
      if (val != ('' || ' ' || '  ' || '   ')) {
        this.loader.present();
        this.apiService.getSearchPlaces(val).subscribe(
          (res: any) => {
            if (res.message == 'No matching result found.') {
              this.loader.dismiss();
              this.toast.presentToast(res.message);
            }
            else {
              this.searchResults = res;
              if (ev.srcElement.value.length == 0) {
                this.loader.dismiss();
                this.isPlaceAvailable = false;
              } else {
                this.loader.dismiss();
                this.isPlaceAvailable = true;
              }
            }
          },
          err => {
            this.loader.dismiss();
            console.log('error');
          }
        );
      } else {
        this.loader.present();
        this.apiService.getSearchPlaces(val).subscribe(
          (res: any) => {
            if (res.message == 'No matching result found.') {
              this.loader.dismiss();
              this.toast.presentToast(res.message);
            }
            else {
              this.searchResults = res;
              // console.log("TCL: getItems -> this.searchResults",this.searchResults);
              if (ev.srcElement.value.length == 0) {
                this.loader.dismiss();
                this.isPlaceAvailable = false;
              } else {
                this.loader.dismiss();
                this.isPlaceAvailable = true;
              }
            }
          },
          err => {
            this.loader.dismiss();
            console.log('error');
          }
        );
      }
    } else if (val.length == 0) {
      if (val == '') {
        this.loader.present();
        this.apiService.getSearchPlaces(val).subscribe(
          res => {
            this.searchResults = res;
            // // // // // // // // // // console.log("TCL: getItems -> this.searchResults",this.searchResults);
            if (ev.srcElement.value.length == 0) {
              this.loader.dismiss();
              this.isPlaceAvailable = false;
            } else {
              this.loader.dismiss();
              this.isPlaceAvailable = true;
            }
          },
          err => {
            this.loader.dismiss();
            console.log('error');
          }
        );
      }
    }
  }

  placeDetails(place, cat) {
    this.isPlaceAvailable = false;
    this.searchInput = '';
    // console.log(cat);
    this.approvedComments = [];
    this.loader.present();
    this.placeDetail.category = cat;
    if (this.sessionDetails.traveler == null) {
      this.apiService.getPlaceDetails(place.place_id, '').subscribe(res => {
        this.placeDetail.place_detail = res;
        const navigationExtras: NavigationExtras = {
          queryParams: {
            special: JSON.stringify(this.placeDetail)
          }
        };
        this.loader.dismiss();
        this.router.navigate(['/place-details'], navigationExtras);
      }, err => {
        console.log(err);
      });
    }
    else {
      this.apiService.getPlaceDetails(place.place_id, this.sessionDetails.traveler.user_id).subscribe(res => {
        this.placeDetail.place_detail = res;
        // // // // // // // // // console.log("TCL: placeDetails -> this.placeDetail", this.placeDetail);
        let navigationExtras: NavigationExtras = {
          queryParams: {
            special: JSON.stringify(this.placeDetail)
          }
        };
        this.loader.dismiss();
        this.router.navigate(['/place-details'], navigationExtras);
      }, err => {
        console.log(err);
      });
    }
  }

  async presentAlertonBackButtons(params, option) {
    const alert = await this.alertController.create({
      header: params.header,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (option == 'back') {
              navigator['app'].exitApp();
            }
          }
        },
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            if (option == 'back') {
              this.router.navigate(['/preferences']);
            }
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
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

  ionViewWillLeave() {
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
    });
  }

  searchFilter(searchTerm) {
    return this.categoryIdByAvtarPrefrences.category.filter(data => {
      //console.log(data);
      return data.title.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    }, err => {
      console.log(err);
    });
  }
}
