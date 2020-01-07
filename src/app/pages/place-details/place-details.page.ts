import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';
//import { environment } from '../../../environments/environment';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AlertController, IonSlides, Platform, Events } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as mapboxgl from 'mapbox-gl';
import { ApiService } from 'src/app/services/api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';

// import { Auth } from 'src/auth';
// import { geojson } from "src/markers";
import { GeojsonService } from 'src/app/services/geojson.service';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-place-details',
  templateUrl: './place-details.page.html',
  styleUrls: ['./place-details.page.scss']
})
export class PlaceDetailsPage implements OnInit {
  @ViewChild(IonSlides) private slides: IonSlides;
  comment: any;
  coordinate: any = [];
  sessionDetails: any = { traveler: [], business: [] };
  ratings: any = 4;
  placeImgs = {
    slidesPerView: 1.5,
    centeredSlides: true,
    spaceBetween: 5,
    coverflowEffect: {
      rotate: 20,
      stretch: 0,
      depth: 50,
      modifier: 1,
      slideShadows: false
    }
  };
  map: mapboxgl.Map;
  showFabButton:boolean=false;
  placeDetail: any = { place_detail: [] }; routing;
  style = 'mapbox://styles/mapbox/streets-v11'; //'mapbox://styles/mapbox/outdoors-v9';
  // lat =  18.251157; //19.9975;   Lower : 18.15620555283993    Upper : 18.27473243435528
  // lng =  -63.036859; // 73.7898 ;   Lower : -63.17486605316276    Upper : -62.96576196079815
  details: any;
  savedPlaces: any = [];
  savePlaceFlag: boolean = false;
  imgFlag: boolean = false;
  priceAvailable: boolean = false;
  data: any[];
  finalGeoJson: any;
  twoMilesPlaces: any = [];
  commentFlag: boolean = false;
  likeFlag: boolean = false;
  connected: boolean;
  bkNow: boolean = false;
  ntwrkSubscription;
  constructor(
    private iab: InAppBrowser,
    private callNumber: CallNumber,
    private platform: Platform,
    public alertController: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    // private auth: Auth,
    public storage: Storage,
    public api: ApiService,
    public loader: LoaderService,
    public toastService: ToastService,
    public share: SocialSharing,
    public geojsonMarker: GeojsonService,
    private ec: EmailComposer,
    public events: Events,
    private ntwrkService: NetworkService
  ) {
    this.storage.get('onIsland').then(res=>{
      console.log(res);
      this.routing = res;
    }).catch(err=>{
      console.log(err);
    });

    mapboxgl.accessToken =
      'pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw';
    this.route.queryParams.subscribe(params => {
      console.log(params);
      if (params && params.special) {
        this.details = JSON.parse(params.special);
        console.log(this.details);
        if((this.details.place_detail.fb_url == '')&&(this.details.place_detail.instagram_url == '')&&(this.details.place_detail.twitter_url == '')&&(this.details.place_detail.tripadvisor_url == '')){
          this.showFabButton = false;
        } else {
          this.showFabButton = true;
        }
        if (this.details.category == 'Accommodation') {
          if((this.details.place_detail.book_now_url != '')||(this.details.place_detail.book_now_url != undefined)){
            this.bkNow = true;
          }
          // else if((this.details.placeDetail.url != '') || (this.details.placeDetail.url != undefined)){
          //   this.bkNow = true;
          // }
        }
        // console.log('place-details pg => ngOnInit => details', this.details);
        // console.log('place-details pg => ngOnInit => details', this.details.price_label);
        if (this.details.place_detail.price_label == '') {
          this.priceAvailable = true;
        }
        if (this.details.place_detail.gallery.length == 1) {
          this.imgFlag = true;
        }
        if (this.details.place_detail.coordinates.latitude != '') {
          // console.log(this.details.coordinates.longitude, this.details.coordinates.latitude);
          this.coordinate.push(
            this.details.place_detail.coordinates.longitude,
            this.details.place_detail.coordinates.latitude
          );
          // console.log('constructor place details', this.coordinate);
          // console.log('constructor place details => longitude',this.coordinate[0],', latitude ',this.coordinate[1]);
        } else {
          this.coordinate.push('', '');
        }
      }
    });
    // this.networkSubscription();
  }

  openSocialPage(url){
    console.log(url);
    const browser = this.iab.create(
      'https://' + url,
      '_system',
      'location=yes'
    );
    // if(page == 'fb'){
    //   // facebook
    // }else if(page == 'tw'){
    //   // twitter
    // }else if(page == 'in'){
    //   // instagram
    // }else if(page == 'tp'){
    //   // tripadvisor
    // }
  }

  openEmail(detail) {
    const email = {
      to: detail.email,
      cc: '',
      bcc: [],
      attachments: [],
      subject: '',
      body: detail.title,
      isHtml: true
    }
    this.ec.open(email);
  }

  bookNow() {
    this.openBrowser();
  }

  ngOnInit() {
    this.ntwrkServiceSubscription();
    // this.buildMap();
    // console.log('place-details pg => ngOnInit => details');
    // this.details = this.route.snapshot.queryParamMap.get('details');
    // console.log(JSON.parse(this.getValue))
    // console.log('place-details pg => details', this.details);
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

  ionViewDidEnter() {
    this.storage.get('travellerUser').then(resp => {
      this.sessionDetails.traveler = resp;
      // console.log("Logged in user details", this.sessionDetails);
    });
    this.storage.get('businessUser').then(resp => {
      this.sessionDetails.business = resp;
      // console.log("Logged in user details", this.sessionDetails);
    });
    this.getPlacesTwoMileRadius();
  }

  ionViewWillLeave() {
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
    });
  }

  networkSubscription() {
    this.events.subscribe('connected', (con) => {
      // console.log(con);
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

  buildMap() {
    const __this = this;
    this.finalGeoJson = { type: 'FeatureCollection', features: this.data };
    console.log(this.finalGeoJson);
    mapboxgl.accessToken =
      'pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw';
    if (!mapboxgl.supported()) {
      alert('Your browser does not support Mapbox GL');
    } else {
      if (this.coordinate[0] == '') {
        var map = new mapboxgl.Map({
          container: 'map2',
          style: this.style,
          zoom: 9.89,
          center: [-63.0478, 18.1968] // starting position [lng, lat]
          // interactive: false
        });
      } else {
        var map = new mapboxgl.Map({
          container: 'map2',
          style: this.style,
          zoom: 12,
          center: [this.coordinate[0], this.coordinate[1]] // starting position [lng, lat]
          // interactive: false
        });
      }

      this.finalGeoJson.features.forEach(function(marker){
        map.loadImage('../../../assets/imgs/' +marker.properties.icon+'-icon.png',function(err,img){
          if(err){
            // throw err;
            console.log(err);
          }
          if (map.hasImage(marker.properties.icon) == false){
            map.addImage(marker.properties.icon, img);
          }
          // map.addImage(marker.properties.icon,img);
        })
      })
      //console.log('Hereeeeeeeee'+JSON.stringify(this.finalGeoJson))
      map.on('load', () => {
        console.log('map on load');
        // map.loadImage('../../../assets/imgs/marker3.png', function(error, image) {
        //   if (error) {
        //     throw error;
        //   }
        //   map.addImage('marker', image);
        // Add a layer showing the places.
        map.addLayer(
          // this.addLayer
          {
            id: 'places',
            type: 'symbol',
            source: {
              type: 'geojson',
              // "data": geojson
              data: __this.finalGeoJson
            },
            layout: {
              'icon-image': ["concat", ["get", "icon"],''],
              'icon-size': 0.1,
              'icon-allow-overlap': true
            }
          }
        );
        //});

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', 'places', function (e) {
          console.log(e);
          console.log(e.features[0].properties);
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
            __this.placeDetails({ place_id: place_id }, title);
            // domelem.innerHTML =
            //   '<b style=\'font-size: 15px; color:#000;\'>' +
            //   title +
            //   '</b>' +
            //   '<p style=\'font-size: 15px; color:#000;\'>' +
            //   description +
            //   '</p>';
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
        // add marker to map
    });
      //console.log('Hereeeeeeeee'+JSON.stringify(this.finalGeoJson))
     
    }
  }

  placeDetails(place, cat) {
    // console.log(cat);
    //this.approvedComments = [];
    this.loader.present();
    this.placeDetail.category = cat;
    if (this.sessionDetails.traveler == null) {
      this.api.getPlaceDetails(place.place_id, '').subscribe(res => {
        this.placeDetail.place_detail = res;
        const navigationExtras: NavigationExtras = {
          queryParams: {
            special: JSON.stringify(this.placeDetail)
          }
        };
        this.loader.dismiss();
        this.router.navigate(["/place-details"], navigationExtras);
      }, err => {
        console.log(err);
      });
    }
    else {
      this.api.getPlaceDetails(place.place_id, this.sessionDetails.traveler.user_id).subscribe(res => {
        this.placeDetail.place_detail = res;
        // // // // // // // // // console.log("TCL: placeDetails -> this.placeDetail", this.placeDetail);
        let navigationExtras: NavigationExtras = {
          queryParams: {
            special: JSON.stringify(this.placeDetail)
          }
        };
        this.loader.dismiss();
        this.router.navigate(["/place-details"], navigationExtras);
      }, err => {
        console.log(err);
      });
    }
  }

  addComment() {
    console.log('place details => addComment => sessiondetails', this.sessionDetails);
    if (this.sessionDetails.traveler != undefined) {
      this.commentFlag = true;
      // var a_comments: any = [];
      // a_comments.push(this.details.approve_comment);
      // console.log("TCL: PlaceDetailsPage -> addComment -> a_comments", this.details.approve_comment);
      const navigationExtras: NavigationExtras = {
        queryParams: {
          id: this.sessionDetails.traveler.user_id,
          place_id: this.details.place_detail.ID,
          place_title: this.details.place_detail.title,
          // approvedCommnts: JSON.stringify(this.details.approve_comment)
        }
      };
      console.log('Approved commets', navigationExtras);
      this.router.navigate(['/comments'], navigationExtras);
      // this.router.navigate(['/landing'], {queryParams: {id: this.avatarSelected.term_id, ids: [list]}});
    } else {
      this.router.navigate(['/login'], { queryParams: { page: 'place-details' } });
    }
  }

  sendComment() {
    // console.log('comment is: ',this.comment);
    this.api.sendComment(this.sessionDetails.traveler.user_id, this.details.place_detail.ID, this.comment, this.details.place_detail.title).subscribe(res => {
      console.log(res);
      this.getComments();
    });
  }

  getComments() {
    this.api.getAllComments(this.sessionDetails.traveler.user_id, this.details.place_detail.ID).subscribe(res => {
      console.log(res);
    }, err => {
      console.log(err);
    });
  }

  getPlacesTwoMileRadius() {
    this.finalGeoJson = [];
    this.data = [];
    // console.log('this.details.id', this.details.ID);
    this.api.getPlacesWithinTwoMiles(this.details.place_detail.ID).subscribe(res => {
      this.twoMilesPlaces = res;
      // console.log('2 mile radius places res', this.twoMilesPlaces);
      // this.buildMap();
      for (var i = 0; i < this.twoMilesPlaces.length; i++) {
        var coordinates: any = [];
        coordinates.push(parseFloat(this.twoMilesPlaces[i].longitude));
        coordinates.push(parseFloat(this.twoMilesPlaces[i].latitude));
        var markers = [];
        markers.push(coordinates);
        markers.push(this.twoMilesPlaces[i].title);
        markers.push(this.twoMilesPlaces[i].content);
        markers.push(this.twoMilesPlaces[i].id);
        markers.push(this.twoMilesPlaces[i].category_name); //send category when api is fixed

        // console.log("TCL: marker -> markers", markers);
        // console.log(this.details.category);
        var geojsonfeatures: any = {};
        geojsonfeatures = this.geojsonMarker.getGeojsonData(markers);
        // console.log(geojsonfeatures);
        this.data.push(geojsonfeatures);
        if (i == this.twoMilesPlaces.length - 1) {
          this.buildMap();
          // console.log(this.data);
        }
      }
    });
  }

  openBrowser() {
    console.log(this.details.place_detail.url);
    const browser = this.iab.create(
      'https://' + this.details.place_detail.book_now_url,
      '_system',
      'location=yes'
    );
  }

  shareLink(details) {
    var message = 'Skyviews is an app which is fast, simple and secure that I use to browse through and navigate to the beautiful places in Anguilla. Get if for free (App link from where to download the app)';
    console.log(details);
    const url =
      'http://ec2-3-92-185-110.compute-1.amazonaws.com/skyviews/listing-item/' +
      details.title;
    this.share
      .share(message, '', '', url)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  }

  navigatePlace() {
    // this.coordinate.push(this.details.coordinates.latitude, this.details.coordinates.longitude);
    // coordinate.push(this.details.coordinates.longitude);
    // console.log("coordinates navigatePlce() =>", this.coordinate);
    const navigationExtras: NavigationExtras = {
      queryParams: {
        special: JSON.stringify(this.coordinate)
      }
    };
    this.coordinate = [];
    this.router.navigate(['/nav-place'], navigationExtras);
    // this.router.navigate(['/landing'], {queryParams: {id: this.avatarSelected.term_id, ids: [list]}});
  }

  saveBtn() {
    console.log('place details => sessiondetails', this.sessionDetails);
    if (this.sessionDetails.traveler != undefined) {
      this.loader.present();
      console.log('place details', this.details.place_detail);
      console.log('session details', this.sessionDetails);
      this.api.savePlace(this.sessionDetails.traveler.user_id, this.details.place_detail.ID).subscribe(res => {
        var response: any = [];
        response = res;
        // console.log('TCL: PlaceDetailsPage -> saveBtn -> response', response);
        this.savePlaceFlag = true;
        this.loader.dismiss();
        this.toastService.presentToast(response.message);
      });
    } else {
      this.router.navigate(['/login'], { queryParams: { page: 'place-details' } });
      // this.router.navigate(['/landing'], {queryParams: {id: this.avatarSelected.term_id, ids: [list]}});
    }
  }

  unsaveBtn(placeId) {
    this.loader.present();
    if (this.sessionDetails.traveler != undefined) {
      this.api.removeSavedPlace(placeId, this.sessionDetails.traveler.user_id).subscribe(res => {
        var resp: any = [];
        resp = res;
        console.log(resp);
        this.toastService.presentToast(resp.message);
        if (resp.message == 'Place removed successfully.') {
          this.savePlaceFlag = false;
          this.details.place_detail.saved = false;
          console.log('TCL: PlaceDetailsPage -> unsaveBtn -> this.savePlaceFlag', this.savePlaceFlag)
          this.loader.dismiss();
        }
      });
    } else {
      this.router.navigate(['/login'], { queryParams: { page: 'place-details' } });
    }
  }

  async likeBtn() {
    console.log('place details => sessiondetails', this.sessionDetails);
    if (this.sessionDetails.traveler != undefined) {
      //  this.getstoragelikeres();
      if (this.details.place_detail.like_status == false) {
        this.likePlce();
      } else {
        this.unlike();
      }
    } else {
      this.router.navigate(['/login'], { queryParams: { page: 'place-details' } });
    }
  }

  getstoragelikeres() {
    //var res: any = [];
    this.storage.get('likeResponse').then(resp => {
      console.log('stored like resp', resp);
      // res = resp;
      if (resp.message != 'Successfully like') {
        console.log('do_like');
        this.api.likePlace(this.sessionDetails.traveler.user_id, this.details.place_detail.ID, 'do_like').subscribe(res => {
          console.log(res);
          this.storage.set('likeResponse', res);
        });
      } else if (resp.message === 'Already Like') {
        // console.log('do_unlike');
        this.api.likePlace(this.sessionDetails.traveler.user_id, this.details.place_detail.ID, 'do_unlike').subscribe(res => {
          // console.log(res);
          this.storage.set('likeResponse', res);
        });
      }
    });
  }

  likePlce() {
    this.loader.present();
    this.api.likePlace(this.sessionDetails.traveler.user_id, this.details.place_detail.ID, 'do_like').subscribe(res => {
      // console.log(res);
      this.likeFlag = true;
      this.loader.dismiss();
      // this.storage.set('likeResponse', res);
    });
  }

  unlike() {
    this.loader.present();
    this.api.likePlace(this.sessionDetails.traveler.user_id, this.details.place_detail.ID, 'do_unlike').subscribe(res => {
      console.log(res);
      this.likeFlag = false;
      this.loader.dismiss();
      // this.storage.set('likeResponse', res);
    });
  }
}
