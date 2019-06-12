import { Component, OnInit } from '@angular/core';
import { RicohView } from 'ricoh-theta-viewer';

@Component({
  selector: 'app-panoramic-img-view',
  templateUrl: './panoramic-img-view.page.html',
  styleUrls: ['./panoramic-img-view.page.scss'],
})
export class PanoramicImgViewPage implements OnInit {
  ricohView: RicohView;
  fileName: '/assets/images/Panorama.JPEG';
  constructor() { }

  ngOnInit() {
    this.ricohView = new RicohView({
       id: 'ricoh-360-viewer', 
       file: this.fileName, 
       rendererType: 0,
       height: window.innerHeight,
       width: window.innerWidth, 
       zoom: 50 });
  }

}
