import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { geojson } from '../../../markers';
import * as MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { Platform, AlertController, Events } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { ToastService } from 'src/app/services/toast.service';
import { ApiService } from 'src/app/services/api.service';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  coords;
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';//'mapbox://styles/mapbox/outdoors-v9';
  lat = 18.1968; //19.9975; //19.9975;   Lower : 18.15620555283993    Upper : 18.27473243435528
  lng = -63.0478; // 73.7898; // 73.7898 ;   Lower : -63.17486605316276    Upper : -62.96576196079815
  currentlat: number;
  currentlng: number;
  sessionDetails: any =  {traveler: [], business: []};
  connected: boolean; ntwrkSubscription;

  constructor(public events: Events, public apiService: ApiService,private platform: Platform,
    private geolocation: Geolocation, public alertController: AlertController,
    public toastServie: ToastService, private ntwrkService: NetworkService) {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw'
    // this.networkSubscription();
   }

  ngOnInit() {
    this.ntwrkServiceSubscription();
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

  networkSubscription(){
    this.events.subscribe('connected', (con) => {
      console.log(con);
      this.connected = con;
      if(con == false){
        const option = 'retry';
        const params = {message: 'Netwrok is disconnected', header: 'No Internet' };
        this.retryConnection(params, option);
      }
    });
  }

  async retryConnection(params, option){
    const alert = await this.alertController.create({
      header: params.header,
      message:params.message,
      buttons: [
        {
          text: "Retry",
          handler: () => {
            if (option == 'retry'){
                if (this.connected == false){
                  const option = 'retry';
                  const params = {message: 'Network is disconnected', header: 'No Internet' };
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
  
  async alert(msg) {
    const alert = await this.alertController.create({
      header: msg,
      //subHeader: 'Subtitle',
      buttons: ['OK']
    });
    await alert.present();
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      //this.buildMap();
      this.getCurrentPosition();
    });
  }

  getSavedPlaces() {
    this.apiService.getSavedPlaces(this.sessionDetails.traveler.user_id).subscribe(res => {
      console.log(res);
    });
  }

  getCurrentPosition() {
  	this.geolocation.getCurrentPosition().then(res => {
   //   console.log('Latitude :' + res.coords.latitude);
   //   console.log('Longitude :' + res.coords.longitude);
      this.coords = [res.coords.longitude, res.coords.latitude];
      this.buildMap();
    }).catch(err => {
      this.buildMap();
   //   console.log('Unable to catch error' + JSON.stringify(err.message));
    });
  }

  buildMap() {
    console.log('loadmap()');

    // mapboxgl.accessToken = 'pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw';
    // this.map = new mapboxgl.Map({
    // container: 'mapnav',
    // style: this.style,
    // center: [this.lng, this.lat],
    // zoom: 9.89
    // });

    // pixels the map pans when the up or down arrow is 
    //var deltaDistance = 100;
 
    // degrees the map rotates when the left or right arrow is clicked
    //var deltaDegrees = 25;

    if (!mapboxgl.supported()) {
      //alert('Your browser does not support Mapbox GL');
      this.toastServie.presentToast('Your device does not support Mapbox GL Maps!');
      this.alert('Your device does not support Mapbox GL Maps');
    } else {
      var map = new mapboxgl.Map({
        container: 'mapnav',
        style: this.style,
        zoom: 9.89,
      //  bearing: -12,
        //pitch: 60,
        center: [this.lng, this.lat],
        //pitchWithRotate: true,
        //hash: true,
      });

      // disable map rotation using right click + drag
      map.dragRotate.disable();
 
    // disable map rotation using touch rotation gesture
      map.touchZoomRotate.disableRotation();
      // pixels the map pans when the up or down arrow is clicked
      // var deltaDistance = 100;

      // // degrees the map rotates when the left or right arrow is clicked
      // var deltaDegrees = 25;

  //    console.log(geojson.features);
      map.on('load', () => {
        // map.getCanvas().focus();

        // map.getCanvas().addEventListener('keydown', function(e) {
        //   e.preventDefault();
        //   if (e.which === 38) { // up
        //       map.panBy([0, -deltaDistance], {
        //       easing: this.easing
        //     });
        //   } else if (e.which === 40) { // down
        //       map.panBy([0, deltaDistance], {
        //       easing: this.easing
        //     });
        //   } else if (e.which === 37) { // left
        //       map.easeTo({
        //       bearing: map.getBearing() - deltaDegrees,
        //       easing: this.easing
        //     });
        //   } else if (e.which === 39) { // right
        //       map.easeTo({
        //       bearing: map.getBearing() + deltaDegrees,
        //       easing: this.easing
        //     });
        //   }
        // }, true);

        // map.loadImage('../../../assets/imgs/marker3.png', function(error, image) {
        //   if (error) { throw error; }
        //   map.addImage('marker', image);
        //   // Add a layer showing the places.
        //   map.addLayer({
        //     'id': 'places',
        //     'type': 'symbol',
        //     "source": {
        //       "type": "geojson",
        //       "data": geojson
        //     },
        //       // "layout": {
        //       //   "icon-image": "{icon}-15",
        //       //   "icon-allow-overlap": true
        //       // }
        //       "layout": {
        //         "icon-image": "marker",
        //         "icon-size": 0.10,
        //         "icon-allow-overlap": true
        //         }
        //   });
        // });

        //   // When a click event occurs on a feature in the places layer, open a popup at the
        //   // location of the feature, with description HTML from its properties.
        // map.on('click', 'places', function (e) {
        //   this.markerLat = e.lngLat.lat;
        //   this.markerLng = e.lngLat.lng;
        //   var coordinates = e.features[0].geometry.coordinates.slice();
        //   var description = e.features[0].properties.description;
        //   var title = e.features[0].properties.title;
        //   // Ensure that if the map is zoomed out such that multiple
        //   // copies of the feature are visible, the popup appears
        //   // over the copy being pointed to.
        //   while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        //   }

        //   new mapboxgl.Popup()
        //   .setLngLat(coordinates)
        //   // .setPopup(new mapboxgl.Popup({ offset: 25 }))
        //   .setHTML('<h5>' + title + '</h5>')
        //   .addTo(map);
        // });

        //   // Change the cursor to a pointer when the mouse is over the places layer.
        // map.on('mouseenter', 'places', function () {
        //   map.getCanvas().style.cursor = 'pointer';
        // });

        //   // Change it back to a pointer when it leaves.
        // map.on('mouseleave', 'places', function () {
        //   map.getCanvas().style.cursor = '';
        // });
        // geojson.features.forEach( marker => {
        //   new mapboxgl.Marker()
        //   .setLngLat(marker.geometry.coordinates)
        //   .addTo(this.map);
        // });
     // });

        // map.addControl(new MapboxGeocoder({
        //   accessToken: mapboxgl.accessToken,
        //   mapboxgl: mapboxgl,
        // }), 'top-left');

           // track current location of user
        map.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          fitBoundsOptions: {
            maxZoom: 15
          },
          showUserLocation: true
        }));
  
        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl({
          visualizePitch: true,
          showCompass: true,
          showZoom: true
        }));

         // get current location of user
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
              this.currentlat = position.coords.latitude;
              this.currentlng = position.coords.longitude;
            });
          } else {
            alert('Provide access to fetch current location');
          }

        // map.addControl(new MapboxDirections({
        //     accessToken: mapboxgl.accessToken,
        //     placeholderOrigin: 'Choose a starting place',
        //     placeholderDestination: 'Choose destination',
        //     unit: 'metric',
        //     alternatives: true,
        //     annotation: {
        //       duration: true,
        //     },
        //     intersections: true,
        //     steps: true,
        //     banner_instructions: true,
        //     voice_instructions: true
        //     }), 'top-left');
        // });

        console.log('get current location of user', this.currentlat, this.currentlng);
        var directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            placeholderDestination: 'Choose destination',
            unit: 'metric',
            alternatives: true,
            annotation: {
              duration: true,
            },
            intersections: true,
            steps: true,
            banner_instructions: true,
            voice_instructions: true
          });
 
        directions.setOrigin([this.currentlng, this.currentlat]);
        map.addControl(directions,  'top-left');
        // get co-ordinates of the clicked point on map
        map.on('click', function (e) {
        this.markerLat = e.lngLat.lat;
        this.markerLng = e.lngLat.lng;
        // Fly to clicked location
        // setTimeout(() => {
        //   this.map.flyTo([this.markerLat, this.markerLng], 16);
        // }, 0);
     //   console.log('get co-ordinates of the clicked point on map: Latitude' + e.lngLat.lat, 'Longitude' + e.lngLat.lng);
      });
  });
}
}

//  easing(t) {
//   return t * (2 - t);
//   }
  
  // watchPosition(directions) {
  //   let options = {
  //     enableHighAccuracy: true,
  //   }
  //   this.geolocation.watchPosition(options).subscribe(res => {
  //     console.log('Inside Watch subscription')
  //     console.log('res.coords' + res.coords);
  //     directions.setOrigin([res.coords.longitude, res.coords.latitude]);
  //   }, err => {
  //     console.log(JSON.stringify(err));
  //   });
  // }
}



