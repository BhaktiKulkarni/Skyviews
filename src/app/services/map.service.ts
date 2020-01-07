import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
// import { environment } from '../../environments/environment';
import { GeoJson } from '../../map';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  url = 'https://api.mapbox.com';
  constructor() {
   mapboxgl.accessToken = 'pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw';
  }

getZoomedLocation(coordinates){
  // tslint:disable-next-line: max-line-length
 // return this.db.object(this.url + '/styles/v1/mapbox/light-v9/static/' + coordinates + '9.66,0,0/300x200' + '?access_token=' +  mapboxgl.accessToken);
 // https://api.mapbox.com/styles/v1/mapbox/light-v9/static/-63.0495,18.2276,9.66,0,0/300x200?access_token=pk.eyJ1Ijoic2t5dmlld3MiLCJhIjoiY2l0MGlpazMwMG03eDJ6a2g2Zzg3cnRpMiJ9.lDfkvMJmSFr_MYw4pl1csw
}
  getMarkers() {
    // return this.db.list('/markers')
  }

  createMarker(data: GeoJson) {
    // return this.db.list('/markers')
    //               .push(data)
  }

  removeMarker($key: string) {
    // return this.db.object('/markers/' + $key).remove()
  }

  // getRoutes(profile,coordinates){
  //   return this.db.object(this.url + '/directions/v5/mapbox/' + profile + '/' + coordinates + '?access_token=' + MAPBOX.accessToken);
  //   //https://api.mapbox.com/directions/v5/mapbox/cycling/-122.42,37.78;-77.03,38.91?access_token=pk.eyJ1IjoiYmhha3RpMTMxMiIsImEiOiJjandnOHoxMGgxZDR0NDRvdTZzMzBlNWZ3In0.fvWTP95eBg0TwY9kQTGWlw
  // }
}