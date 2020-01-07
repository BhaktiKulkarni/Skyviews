import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AlertController, Events } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast.service';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-nav-place',
  templateUrl: './nav-place.page.html',
  styleUrls: ['./nav-place.page.scss'],
})

export class NavPlacePage implements OnInit {

directions: any;
  coords;
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';//'mapbox://styles/mapbox/outdoors-v9';
  lat =  18.1968; //19.9975;  //19.9975;   Lower : 18.15620555283993    Upper : 18.27473243435528
  lng =  -63.0478; //73.7898;  // 73.7898 ;   Lower : -63.17486605316276    Upper : -62.96576196079815
  coordinates: any;
  connected: boolean;
  ntwrkSubscription;
//19.9728742,73.7787697 home
  constructor(private geolocation: Geolocation, public events: Events, private route: ActivatedRoute, private location: Location, private router: Router,
    public alertController: AlertController, public toastServie: ToastService, private ntwrkService: NetworkService
    ) {

    this.route.queryParams.subscribe(params => {
      if (params && params.special) {
        this.coordinates = JSON.parse(params.special);
        console.log('coordinates are: => constructor => coordinates', this.coordinates);
      }
    });
  //  this.preferences = this.route.snapshot.queryParamMap.get('ids');
    // this.coordinates = this.route.snapshot.queryParamMap.get('coordinates');
    // console.log('coordinates are: ', this.coordinates);
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw'
    // this.networkSubscription();
  }

  ngOnInit() {
    // this.coordinates = this.route.snapshot.queryParamMap.get('coordinates');
    // console.log('coordinates are: ', this.coordinates);
    this.ntwrkServiceSubscription();
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
    this.getCurrentPosition();
  }

  ionViewDidLeave() {
    this.directions.setOrigin(['', '']);
    this.directions.setDestination([ '', '']);
  }
  getCurrentPosition() {

    this.geolocation.getCurrentPosition().then((res) => {
      // console.log('Latitude :' + res.coords.latitude);
      // console.log('Longitude :' + res.coords.longitude);
      this.coords = [res.coords.longitude, res.coords.latitude];
      this.loadMap(res);
     }).catch((error) => {
   //    console.log(JSON.stringify(error));
     });

    // this.geolocation.getCurrentPosition({
    //   enableHighAccuracy: true,
    //   timeout: 5000,
    //   maximumAge: 3000
    // }).then(res => {
    //   console.log('Latitude :' + res.coords.latitude);
    //   console.log('Longitude :' + res.coords.longitude);
    //   this.coords = [res.coords.longitude, res.coords.latitude];
    //   this.loadMap(res);
    //   }).catch(err => {
    //   console.log('Unable to catch error' + JSON.stringify(err));
    //   });
  }


  loadMap(res) {
    console.log('loadmap()');
    if (!mapboxgl.supported()) {
      //alert('Your browser does not support Mapbox GL');
      this.toastServie.presentToast('Your device does not support Mapbox GL Maps!');
      this.alert('Your device does not support Mapbox GL Maps');
    }
    else 
    {

      this.map = new mapboxgl.Map({
      container: 'navmap',
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 12,
      center: [res.coords.longitude, res.coords.latitude ],
    // hash: true,
      // steps: true,
      // voice_instructions: true,
      // banner_instructions: true,

    });

    // disable map rotation using right click + drag
      this.map.dragRotate.disable();
 
    // disable map rotation using touch rotation gesture
      this.map.touchZoomRotate.disableRotation();

      this.directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: 'metric',
        alternatives: true,
        interactive: false,
        controls: {
          inputs: false,
          instructions: false
        },
        annotation : {
          distance: true,
          duration: true
        },
        intersections: {
          location: true,
          bearings: true,
        },
        steps: true,
        voice_instructions: true,
        banner_instructions: true,
      });

    //  directions.setDestination([73.7787697, 19.9728742]);
    console.log('build map => nav-places => lat, long', this.coordinates[0], this.coordinates[1]);
    this.directions.setDestination([ this.coordinates[0], this.coordinates[1]]);

      // disable map rotation using right click + drag
      this.map.dragRotate.disable();

      // disable map rotation using touch rotation gesture
      this.map.touchZoomRotate.disableRotation();

      this.geolocation.watchPosition().subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      // data.coords.latitude
      // data.coords.longitude
    // console.log('data.coords.latitude' + data.coords.latitude + 'data.coords.longitude' + data.coords.longitude)
      this.map.addControl(this.directions, 'top-left');
    // console.log('res.coords.longitude, res.coords.latitude' + res.coords.longitude, res.coords.latitude)
    console.log('current coords => ', data.coords.longitude, data.coords.latitude)
      this.directions.setOrigin([data.coords.longitude, data.coords.latitude]);
      //directions.setDestination([73.7787697, 19.9728742]);
      this.watchPosition(this.directions);
      //directions.setDestination([73.7509999,19.9991165]);
      });


      // adding blue tick i.e current location
      this.map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true,
            fitBoundsOptions: {
              maxZoom: 15
            },
            showUserLocation: true
          }), 'top-right');

      this.watchPosition(this.directions);
    }
  }

  watchPosition(directions) {
    let options = {
      enableHighAccuracy: true,
    }
    this.geolocation.watchPosition(options).subscribe(res => {
      // console.log('Inside Watch subscription')
      // console.log('res.coords' + res.coords);
      this.directions.setOrigin([res.coords.longitude, res.coords.latitude]);
    }, err => {
   //   console.log(JSON.stringify(err));
    });
  }

  navigate() {
    console.log('navigate to place details');
    this.router.navigate(['/place-details']);
  }
}
