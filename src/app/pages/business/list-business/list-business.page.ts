import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth } from 'src/auth';
import { Events, Platform, IonRouterOutlet, AlertController, NavController, LoadingController, ModalController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { Storage } from "@ionic/storage";
import { LoaderService } from 'src/app/services/loader.service';
import { ModalPagePage } from '../../modal-page/modal-page.page';
import { NetworkService } from '../../../services/network.service';

@Component({
  selector: 'app-list-business',
  templateUrl: './list-business.page.html',
  styleUrls: ['./list-business.page.scss'],
})
export class ListBusinessPage implements OnInit {
  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;
  businessList = []; backButtonSubscription;
  sessionDetails: any = { traveler: [], business: [] };
  connected: boolean; ntwrkSubscription;

  constructor(
    private auth: Auth,
    private events: Events,
    private toastServie: ToastService,
    private router: Router,
    public platform: Platform,
    public alertController: AlertController,
    private apiService: ApiService,
    private storage: Storage,
    private navCtrl: NavController,
    private loadCtrl: LoadingController,
    public loader: LoaderService,
    private modalCtrl: ModalController,
    private ntwrkService: NetworkService
  ) {
    this.getUserDetails();
    // this.backButtonSubscribe();
    this.getLoggedinUserDetails();
    this.loader.present();
    // this.networkSubscription();
  }

  ntwrkServiceSubscription() {
    this.ntwrkSubscription = this.ntwrkService.getNetworkStatus().subscribe((res: boolean) => {
      // console.log(res);
      this.connected = res;
      if (res == false) {
        const option = 'retry';
        const params = { message: 'Netwrok is disconnected', header: 'No Internet', option: 'retry' };
        this.retryConnection(params);
      }
    }, err => {
      console.log(err);
    });
  }

  ionViewWillLeave() {
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
    });
  }

  getLoggedinUserDetails() {
    this.storage.get("travellerUser").then(resp => {
      this.sessionDetails.traveler = resp;
      // console.log('session traveller', this.sessionDetails.traveler)
      // this.getSavedPlaces();
    });
    this.storage.get("businessUser").then(resp => {
      this.sessionDetails.business = resp;
      // console.log('session business', this.sessionDetails.business)
    });
  }

  backButtonSubscribe() {
    console.log('backButtonSubscribe()');
    this.platform.backButton.subscribeWithPriority(1, () => {
      //navigator['app'].exitApp();
      this.presentAlertonBackButtons();
    });
  }

  async addBusiness() {
    console.log('addBusiness');
    const modal = await this.modalCtrl.create({
      component: ModalPagePage,
      componentProps: {
        'page': 'map'
      },
      cssClass: 'map-page-css'
    });
    modal.onWillDismiss().then((data: any) => {
      // console.log(data);
      // console.log(data.data.lat);
      // console.log(data.data.lng);
      if (data.data != undefined) {
        const coords = data.data;
        this.router.navigate(['/add-business'], { queryParams: { coordinates: JSON.stringify(coords) } });
      }

      // this.storage.set('pop', false);
    });
    await modal.present();
  }

  async retryConnection(params) {
    console.log('retryConnection', params);
    const alert = await this.alertController.create({
      header: params.header,
      message: params.message,
      backdropDismiss: false,
      buttons: [
        {
          text: "Retry",
          handler: () => {
            if (params.option == 'retry') {
              console.log('connected >>' + this.connected);
              if (this.connected == false) {
                const params = { message: 'Network is disconnected', header: 'No Internet', option: 'retry' };
                this.retryConnection(params);
              } else {
                this.ngOnInit();
                this.alertController.dismiss();
              }
            }
          }
        }
      ],
    });

    await alert.present();
  }

  ionViewDidLeave() {
    //this.backButtonSubscription.unsubscribe();
    console.log('ionViewDidLeave()');
  }

  ionViewWillEnter() {
    this.getUserDetails();
  }

  getUserDetails() {
    this.storage.get("businessUser").then(resp => {
      console.log(resp);
      this.listBusiness({ user_id: resp.user_id });
    }).catch(err => {
      console.log(err);
    });
  }

  listBusiness(data) {
    this.apiService.listBusinesses(data).subscribe((res: any) => {
      console.log(res);
      // this.loadCtrl.dismiss();
      this.loader.dismiss();
      if (res.message == 'No requests found.') {
        this.businessList = [];
      } else {
        this.businessList = res;
      }
    }, err => {
      this.loader.dismiss();
      console.log(err);
      this.toastServie.presentToast('Unable to load data, try again later');
    });
  }

  async editBusiness(business) {
    console.log(business);
    // console.log(business);
    // const modal = await this.modalCtrl.create({
    //   component: ModalPagePage,
    //   componentProps: {
    //     'page': 'events',
    //     business: business
    //   },
    //   cssClass: 'event-page-css'
    // });
    // modal.onWillDismiss().then(data => {
    //   // console.log(data);
    //   this.storage.set('pop', false);
    // });
    // await modal.present();
    this.router.navigate(['/add-business'], { queryParams: { business: JSON.stringify(business) } });
  }

  deleteBusiness(business) {
    // alert('Delete business');
    // console.log(business);
    const params = { message: 'Place will be deleted from your list', place_id: business.ID }
    const option = 'delete';
    this.presentAlertConfirm(params, option);
  }

  async present() {
    const loading = await this.loadCtrl.create({
      message: 'Deleting place..'
    });
    await loading.present();
  }

  async presentAlertonBackButtons() {
    const alert = await this.alertController.create({
      header: 'Do you want to exit?',
      // subHeader: 'Subtitle',
      // message: 'This is an alert message.',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            //  console.log('Yes clicked');
            navigator['app'].exitApp();
          }
        },
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            //   console.log('Cancel clicked');
            //this.router.navigate(['/preferences']);
          }
        }
      ],
      backdropDismiss: false
    });

    await alert.present();
  }

  ngOnInit() {
    //this.getUserDetails();
    this.ntwrkServiceSubscription();
  }

  logout() {
    const params = { message: 'Are you sure to you want to <strong>logout</strong>?' };
    const option = 'logout';
    this.presentAlertConfirm(params, option);
  }

  async presentAlertConfirm(params, option) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: params.message,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: clicked');
          }
        }, {
          text: 'Yes',
          handler: () => {
            if (option == 'logout') {
              //console.log('Confirm Okay');
              this.auth.logout('business');
              this.events.publish('user:created', null);
              this.toastServie.presentToast('Logged out successfully!');
              //if traveller is logged in push to landing pg, else push to pop-up pg
              if (this.sessionDetails.traveler != null) {
                this.router.navigate(['/landing'], { replaceUrl: true });
              }
              else {
                this.router.navigate(['/pop-up'], { replaceUrl: true });
              }
            } else if (option = 'delete') {
              this.present();
              const data = { place_id: params.place_id }
              this.apiService.deleteBusiness(data).subscribe((res: any) => {
                //console.log(res);
                if (res.message == 'Place deleted successfully.') {
                  this.toastServie.presentToast(res.message);
                  this.getUserDetails();
                } else {
                  this.toastServie.presentToast('Unable to process, try later!');
                }
                this.loadCtrl.dismiss();
              }, err => {
                console.log(err);
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }
}