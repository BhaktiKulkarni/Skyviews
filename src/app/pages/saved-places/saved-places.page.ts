import { Component, OnInit } from "@angular/core";
import * as mapboxgl from "mapbox-gl";
import { AlertController, Events } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { ApiService } from "src/app/services/api.service";
import { LoaderService } from "src/app/services/loader.service";
import { NavigationExtras, Router } from "@angular/router";
import { GeojsonService } from "src/app/services/geojson.service";
import { ToastService } from 'src/app/services/toast.service';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: "app-saved-places",
  templateUrl: "./saved-places.page.html",
  styleUrls: ["./saved-places.page.scss"]
})
export class SavedPlacesPage implements OnInit {
  savedPlaces: any = [];
  sessionDetails: any = { traveler: [], business: [] };
  placeDetail: any = { place_detail: [], approve_comment: [] };
  finalGeoJson: any;
  data: any = [];
  approvedComments: any = [];
  connected: boolean;
  ntwrkSubscription;

  constructor(
    public loader: LoaderService,
    public alertController: AlertController,
    public storage: Storage,
    public apiService: ApiService,
    public router: Router,
    public geojsonMarker: GeojsonService,
    public events: Events,
    public toast: ToastService,
    private ntwrkService: NetworkService
  ) {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw";
    this.getSessionDetails();
  }
  style = "mapbox://styles/mapbox/streets-v11"; //'mapbox://styles/mapbox/outdoors-v9';
  lat = 18.1968; //19.9975; Lower : 18.15620555283993 Upper : 18.27473243435528
  lng = -63.0478; // 73.7898 ; Lower : -63.17486605316276 Upper : -62.96576196079815

  ngOnInit() {
    //this.buildMap();
    //this.alert();
    // this.networkSubscription();
    this.ntwrkServiceSubscription();
  }

  ionViewDidEnter() {
    this.loader.present();
    this.getSavedPlaces();
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

  async retryConnection(params, option) {
    const alert = await this.alertController.create({
      header: params.header,
      message: params.message,
      buttons: [
        {
          text: "Retry",
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

  async getSessionDetails() {
    await this.storage.get("travellerUser").then(resp => {
      this.sessionDetails.traveler = resp;
      this.events.publish("user:created", this.sessionDetails.traveler);
      // console.log("Logged in user details", this.sessionDetails);
    });
    await this.storage.get("businessUser").then(resp => {
      this.sessionDetails.business = resp;
      // console.log("Logged in user details", this.sessionDetails);
    });
    this.getSavedPlaces();
  }

  plotMarker() {
    this.data = [];
    // console.log("plotMarker");
    // console.log(this.savedPlaces.length);
    for (let i = 0; i < this.savedPlaces.length; i++) {
      this.data.push({
        type: "Feature",
        properties: {
          title: this.savedPlaces[i].title,
          // 'description': '2 1/2 miles of white sand beach, private atmosphere, water sports & Caribbean cuisine.',
          // icon: "src/assets/imgs/mapbox-icon.png"
          // icon: 'src/assets/imgs/'+this.savedPlaces[i].category_name+'-icon.png'
        },
        geometry: {
          coordinates: [
            parseFloat(this.savedPlaces[i].longitude),
            parseFloat(this.savedPlaces[i].latitude)
          ],
          type: "Point"
        }
      });
    }
    console.log("TCL: plotMarker -> this.data", this.data);
    this.finalGeoJson = { type: "FeatureCollection", features: this.data };
    // console.log("...........TCL: plotMarker -> this.finalGeoJson", this.finalGeoJson);

    // this.map.featureLayer().setGeoJSON(this.finalGeoJson).addTo(this.map);
  }

  getSavedPlaces() {
    //console.log('Logged in user details', this.sessionDetails);
    // console.log("TCL: SavedPlacesPage -> getSavedPlaces -> this.sessionDetails", this.sessionDetails.traveler.user_id)
    this.apiService.getSavedPlaces(this.sessionDetails.traveler.user_id).subscribe(
      (res: any) => {
        this.loader.dismiss();
        // console.log('Saved places', res);
        this.savedPlaces = res;
        // console.log(JSON.stringify(this.savedPlaces));
        if (this.savedPlaces === 'No places found.') {
          this.savedPlaces = [];
          this.buildMap();
          this.toast.presentToast('There are no saved places!');
        }
        else {
          // for (let i = 0; i < this.savedPlaces.length; i++) {
          // console.log(this.savedPlaces);
          // this.data.push({
          // type: "Feature",
          // properties: {
          // title: this.savedPlaces[i].title,
          // description: this.savedPlaces[i].description,
          // icon: "src/assets/imgs/mapbox-icon.png"
          // },
          // geometry: {
          // coordinates: [
          // parseFloat(this.savedPlaces[i].longitude),
          // parseFloat(this.savedPlaces[i].latitude)
          // ],
          // type: "Point"
          // }
          // });
          // }

          for (let i = 0; i < this.savedPlaces.length; i++) {
            // console.log(this.savedPlaces[i].values.length)
            for (let j = 0; j < this.savedPlaces[i].values.length; j++) {
              // console.log(this.savedPlaces[i].values[j]);
              this.data.push({
                type: "Feature",
                properties: {
                  title: this.savedPlaces[i].values[j].title,
                  description: this.savedPlaces[i].values[j].content,
                  // icon: "src/assets/imgs/mapbox-icon.png"
                  icon: '../../../assets/imgs/' + this.savedPlaces[i].category_name + '-icon.png',
                  place_id: this.savedPlaces[i].values[j].id
                },
                geometry: {
                  coordinates: [
                    parseFloat(this.savedPlaces[i].values[j].longitude),
                    parseFloat(this.savedPlaces[i].values[j].latitude)
                  ],
                  type: "Point"
                }
              });
            }
          }
          setTimeout(() => {
            this.buildMap();
          }, 2000);
        }
        //this.plotMarker();
      },
      err => {
        console.log(err);
      }
    );
  }

  placeDetails(place, cat) {
    // console.log(place);
    // console.log(cat);
    // this.approvedComments = [];
    this.loader.present();
    this.placeDetail.category = cat;
    // console.log(place)
    if (this.sessionDetails.traveler == null) {
      this.apiService.getPlaceDetails(place.id, '').subscribe(res => {
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
        this.toast.presentToast('Unable to process, please try again!');
      });
    }
    else {
      this.apiService.getPlaceDetails(place.id, this.sessionDetails.traveler.user_id).subscribe(res => {
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

  buildMap() {
    const __this = this;
    this.finalGeoJson = { type: 'FeatureCollection', features: this.data };
    // console.log(this.finalGeoJson);
    mapboxgl.accessToken =
      'pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw';
    if (!mapboxgl.supported()) {
      alert('Your browser does not support Mapbox GL');
    } else {
      var map = new mapboxgl.Map({
        container: "map1",
        style: this.style,
        zoom: 10.24,
        center: [this.lng, this.lat],
        hash: true
      });

      this.finalGeoJson.features.forEach(function (marker) {
        // console.log(marker);
        map.loadImage(marker.properties.icon, function (err, img) {
          if (err) {
            // throw err;
            console.log(err);
          }
          // console.log(map.hasImage(marker.properties.icon));
          if (map.hasImage(marker.properties.icon) == false){
            map.addImage(marker.properties.icon, img);
          }
        });
      });
      //console.log('Hereeeeeeeee'+JSON.stringify(this.finalGeoJson))
      map.on('load', () => {
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
              'icon-image': ["concat", ["get", "icon"], ''],
              'icon-size': 0.1,
              'icon-allow-overlap': true
            }
          }
        );
        //});

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', 'places', function (e) {
          //console.log(e);
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
}