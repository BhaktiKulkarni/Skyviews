import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import * as mapboxgl from 'mapbox-gl';
import { MapService } from 'src/app/map.service';
import { GeoJson, FeatureCollection } from 'src/app/map';
import { FIREBASE_CONFIG } from 'src/app/firebase.credentials';
import { MAPBOX } from 'src/app/mapbox.credentials';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/outdoors-v9';
  lat =  18.2206; //19.9975;   Lower : 18.15620555283993    Upper : 18.27473243435528
  lng =  -63.0686; // 73.7898 ;   Lower : -63.17486605316276    Upper : -62.96576196079815
  userEmail: string;
  subscription: any;

  constructor(
    private navCtrl: NavController,
    private authService: AuthenticationService,
    private platform: Platform
  ) {
    mapboxgl.accessToken = MAPBOX.accessToken;
  }

  ngOnInit(){
    
    if(this.authService.userDetails()){
      this.userEmail = this.authService.userDetails().email;
    }else{
      this.navCtrl.navigateBack('');
    }

    this.ionViewDidLoad1();
  }

  ionViewDidEnter(){
     this.subscription = this.platform.backButton.subscribe(() => { 
        navigator['app'].exitApp(); 
      });
      }
      
  ionViewWillLeave(){ 
    this.subscription.unsubscribe(); 
  }
  
  logout(){
    this.authService.logoutUser()
    .then(res => {
      console.dir(res);
      this.navCtrl.navigateBack('');
    })
    .catch(error => {
      console.log(error);
    })
  }

  ionViewDidLoad1(){
    this.buildMap();
    console.log(mapboxgl.accessToken);
  }

  buildMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 10.24,
      center: [this.lng, this.lat],
      hash: true,
      transformRequest: (url, resourceType)=> {
        if(resourceType === 'Source' && url.startsWith('http://localhost:8100/dashboard')) {
          return {
           url: url.replace('http', 'https'),
          //  headers: { 'my-custom-header': true},
           credentials: 'include'  // Include cookies for cross-origin requests
         }
        }
      }
    });

    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
      enableHighAccuracy: true
      },
      trackUserLocation: true
      }));
 
    console.log(this.map);
  }
}








