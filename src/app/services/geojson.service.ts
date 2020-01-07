import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeojsonService {
  title: any;
  coordinates: any;

  constructor() { }
  geojson: any = {};
  //{
  // 'type': 'FeatureCollection',
  //'features':

  // {
  //   'type': 'Feature',
  //   'properties': {
  //     'title': this.title,
  //    // 'description': '2 1/2 miles of white sand beach, private atmosphere, water sports & Caribbean cuisine.',
  //     'icon': 'src/assets/imgs/mapbox-icon.png'
  //   },
  //   'geometry': {
  //     'coordinates': this.coordinates,
  //     'type': 'Point'
  //   }
  // }


  // };

  getGeojsonData(markrs) {
    // console.log(markrs);
    // console.log("TCL: GeojsonService -> getGeojsonData -> markrs", markrs);
    //return new Promise((resolve, reject) => {
    //var coordinates = markrs[0];
    var coordinates = markrs[0];
    // coordinates.push(parseFloat(markrs[0].longitude));
    // coordinates.push(parseFloat(markrs[0].latitude));
    var title = markrs[1];
    var desc = '';
    if (markrs[2] != undefined) {
      desc = markrs[2];
    } else {
      desc = '';
    }
    var place_id = markrs[3];
    var cat = '';
    if(markrs[4] == undefined){
      cat = markrs[3];
    }else{
      cat = markrs[4];
    }
    
    // console.log(cat);
    return {
      'type': 'Feature',
      'properties': {
        'title': title,
        'description': desc,
        'icon': cat,
        // 'icon': {
        //   'iconUrl':'../../../assets/imgs/' + cat + '-icon.png'
        // },
        'place_id': place_id,
        'category': cat
      },
      'geometry': {
        'coordinates': coordinates,
        'type': 'Point'
      }
    }
  }

  plotMarker(markrs) {

  }
}
