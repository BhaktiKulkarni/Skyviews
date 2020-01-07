import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Events, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ApiService } from 'src/app/services/api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { NetworkService } from '../../../services/network.service';

@Component({
  selector: 'app-category-places',
  templateUrl: './category-places.page.html',
  styleUrls: ['./category-places.page.scss'],
})
export class CategoryPlacesPage implements OnInit {
  category: any;
  sessionDetails: any = { traveler: [], business: [] };
  categories: any = [];
  placesByCategory: any;
  placeDetail: any = {};
  approvedComments: any = []; connected: boolean;
  cat_id; ntwrkSubscription;
  constructor(
    private route: ActivatedRoute,
    public events: Events,
    public storage: Storage,
    public api: ApiService,
    public loader: LoaderService,
    private router: Router,
    private alertController: AlertController,
    private ntwrkService: NetworkService
  ) {
    this.loader.present();
    this.route.queryParams.subscribe((params: any) => {
      // console.log(params.special);
      const par = JSON.parse(params.special);
      // console.log(params.special);
      this.cat_id = par.category_id;
    })
    this.storage.get('travellerUser').then(resp => {
      this.sessionDetails.traveler = resp;
      this.events.publish('user:created', this.sessionDetails.traveler);
      // this.getSavedPlaces();
    });
    // this.networkSubscription();
  }

  ionViewWillLeave() {
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
    });
  }
  ntwrkServiceSubscription() {
    this.ntwrkSubscription = this.ntwrkService.getNetworkStatus().subscribe((res: boolean) => {
      console.log(res);
      this.connected = res;
      if (res == false) {
        const option = 'retry';
        const params = { message: 'Netwrok is disconnected', header: 'No Internet' };
        this.retryConnection(params, option);
      }
    }, err => {
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

  ngOnInit() {
    // console.log('ngOnInit')
    this.route.queryParams.subscribe(params => {
      if (params && params.special) {
        const par = JSON.parse(params.special);
        this.category = par.title;
        // console.log("TCL: CategoryPlacesPage -> ngOnInit -> this.category", this.category)
      }
    });
    this.ntwrkServiceSubscription();
  }

  ionViewDidEnter() {
    // console.log('ionViewDidEnter')
    // this.storage.get('travellerUser').then(resp => {
    //   this.sessionDetails.traveler = resp;
    //   this.events.publish('user:created', this.sessionDetails.traveler);
    //   // this.getSavedPlaces();
    // });
    this.storage.get('businessUser').then(resp => {
      this.sessionDetails.business = resp;
    });
    this.getSelectedCategoryPlaces();
    // this.api.getApiResponse('get_categories').then(
    //   res => {
    //     this.categories = res;
    //     this.getSelectedCategoryPlaces();
    //     // console.log("TCL: CategoryPlacesPage -> ionViewDidEnter -> this.categories", this.categories)
    //   },
    //   err => {
    //     console.log(JSON.stringify(err));
    //   }
    // );
  }

  getSelectedCategoryPlaces() {
    // console.log('getSelectedCategoryPlaces');
    this.api.getCategoryHotels(this.cat_id).subscribe(res => {
      // console.log(res);
      this.placesByCategory = res;
      this.loader.dismiss();
      // console.log('TCL: CategoryPlacesPage -> getSelectedCategoryPlaces -> this.placesByCategory', this.placesByCategory)
      // this.makeGeojson();
    }, err => {
      // console.log(err);
      this.loader.dismiss();
    });
  }

  placeDetails(place) {
    this.approvedComments = [];
    // console.log("TCL: placeDetails -> place", place);
    // console.log("TCL: placeDetails -> place", place.comments);
    this.loader.present();

    // console.log("TCL: placeDetails -> this.approvedComments", this.approvedComments)
    if (this.sessionDetails.traveler == null) {
      this.api.getPlaceDetails(place.place_id, '').subscribe(res => {
        this.placeDetail.place_detail = res;
        for (var i = 0; i < place.place_detail.comments.length; i++) {
          if (place.comments[i].comment_approved == '1') {
            this.approvedComments.push(place.comments[i]);
            // console.log("TCL: placeDetails -> this.approvedComments", this.approvedComments);
            this.placeDetail.approve_comment = this.approvedComments;
          }
        }
        // console.log("TCL: placeDetails -> this.placeDetail", this.placeDetail);
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
    else {
      // console.log(place, this.sessionDetails.traveler.user_id);
      this.api.getPlaceDetails(place, this.sessionDetails.traveler.user_id).subscribe(res => {
        this.placeDetail.place_detail = res;
        // console.log("TCL: placeDetails -> this.placeDetail", this.placeDetail);
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
}
