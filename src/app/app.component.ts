import { Component } from '@angular/core';

import { Platform, AlertController, ModalController, MenuController, Events, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
//import { PopUpPage } from './pages/pop-up/pop-up.page';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network/ngx';
import { NetworkService } from './services/network.service';
import { LoaderService } from './services/loader.service';
import { debounceTime } from 'rxjs/operators';
import { ToastService } from './services/toast.service';
import { Auth } from 'src/auth';
import { UserService } from './services/user.service';
import { Router, NavigationExtras, NavigationEnd } from '@angular/router';
import { BusinessGuardService } from './guards/business-guard.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})

export class AppComponent {
  optionReturned: any; localStorage;
  disconnectSubscription;
  connectSubscription;
  isConnected: boolean;
  sessionDetails: any = { traveler: [], business: [] };
  loginFlag: boolean = false;
  activeUser: any;
  userDetails: any;
  //loggedInUser: Observable<any>;
  navLinksArray = [];
  menuPages = [{ url: '/login' }, { url: '/landing' }, { url: '/plan-trip' }, { url: '/user-profile' }, { url: '/plan-trip' }, { url: '/saved-places' },
  { url: '/island-events' }, { url: '/island-events' }, { url: '/about' }, { url: '/list-business' }, { url: '/pop-up' }]
  constructor(
    public toastServie: ToastService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private network: Network,
    private statusBar: StatusBar,
    public alertController: AlertController,
    public modalController: ModalController,
    private menu: MenuController,
    private storage: Storage,
    private networkService: NetworkService,
    public toastService: ToastService,
    private auth: Auth,
    public router: Router,
    public events: Events,
    public userService: UserService,
    public authGuard: BusinessGuardService,
    private loader: LoaderService,
    private navCtrl: NavController
  ) {
    this.initializeApp();
  }

  storageAndEvents(){
    console.log('storageAndEvents()');
    this.storage.set('pop', true);
    this.events.subscribe('user:created', (user) => {
      // user arguments passed in `events.publish(user, time)`
      // console.log('Response after subscription', user);
      if (user) {
        this.activeUser = user.fullname;
        // console.log('Active user', this.activeUser);
        this.loginFlag = true;
      } else {
        this.activeUser = null;
        // console.log('Active user', this.activeUser);
        this.loginFlag = false;
      }
    });
  }

  routerEventSubscription() {
    this.router.events.subscribe(event => {
      // console.log(event);
      const url = this.router.url; //current url
      // console.log(url);
      if (event instanceof NavigationEnd) {
        // console.log('event instanceof NavigationEnd');
        const isCurrentUrlSaved = this.navLinksArray.find((item) => {
          return item === url;
        });
        if (!isCurrentUrlSaved) {
          this.navLinksArray.push(url);
        }
      } // end event if stmt
    }); // end subscribe
    // this.hardwareBackButton();
  }

  backButtonSubscription() {
    if (this.platform.is('android')) {
      this.platform.backButton.subscribeWithPriority(0, () => {
        const currUrl = this.router.url;
        console.log(currUrl);
        for (let i = 0; i < this.menuPages.length; i++) {
          if (currUrl.includes(this.menuPages[i].url)) {
            const params = { message: 'Do you want to exit?' };
            const option = 'exit';
            this.presentAlertConfirm(params, option);
            break;
          } else {
            if(i==(this.menuPages.length-1)){
              this.navCtrl.pop();
            }
          }
        }
      });
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.getUserDetails();
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.userRedirect();
      this.networkSubscriber();
      this.routerEventSubscription();
      this.backButtonSubscription();
      this.storageAndEvents();
      if (this.platform.is('ios')) {
        this.statusBar.overlaysWebView(false);
      }
    });
  }

  getUserDetails() {
    // console.log('getUserDetails()');
    this.storage.get('travellerUser').then(res => {
      // console.log(res);
      this.userDetails = res;
    }).catch(err => {
      console.log(err);
    });
  }

  listBusiness() {
    // console.log(this.userDetails);
    this.getUserDetails();
    if ((this.userDetails != null) || (this.userDetails != undefined)) {
      if (this.userDetails.user_role == 'traveler') {
        const params = { message: 'Would you like to use the same account for business?' };
        const option = 'business';
        this.auth.login(this.userDetails, 'business');
        this.presentAlertConfirm(params, option);
      } else if (this.userDetails.user_role == 'business') {
        this.router.navigate(['/list-business'], { replaceUrl: true });
      }
    } else {
      console.log('else');
      this.getUserDetails();
      setTimeout(() => {
        this.listBusiness();
      }, 200);
    }
  }

  networkSubscriber(): void {
    this.networkService.getNetworkStatus().pipe(debounceTime(300)).subscribe((connected: boolean) => {
      this.isConnected = connected;
      // this.events.publish('connected', connected);
      // console.log(connected);
      if(this.isConnected == false){
        if (this.loader.isLoading) {
          this.loader.dismiss();
          this.toastService.presentToast('You dont seem to have an active connection, try again later!');
          //}
        }
      }
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
              if (this.isConnected == false) {
                const option = 'retry';
                const params = { message: 'Network is disconnected', header: 'No Internet' };
                this.retryConnection(params, option);
              } else {
                //this.ngOnInit();
                //this.ionViewDidEnter();
              }

            }
          }
        },
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  handleNotConnected(connected: boolean) {
    console.log(connected);
    throw new Error('Method not implemented.');
  }

  logout() {
    const params = { message: 'Are you sure to you want to <strong>logout</strong>?' };
    const option = 'logout';
    this.presentAlertConfirm(params, option);
  }

  async presentAlertConfirm(params, option) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: params.message,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: clicked');
            if (option == 'business') {
              // this.businessRedirect();
              this.router.navigate(['/business-login'], { replaceUrl: true });
            }else if(option == 'exit'){
              console.log('Stay on Page');
            }
          }
        }, {
          text: 'Yes',
          handler: () => {
            if (option == 'logout') {
              this.logoutUser();
            } else if (option == 'business') {
              this.businessRedirect();
            } else if(option == 'exit'){
              navigator['app'].exitApp();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  businessRedirect() {
    this.router.navigate(['/list-business'], { replaceUrl: true });
  }

  logoutUser() {
    this.auth.logout('traveler');
    this.events.publish('user:created', null);
    // this.storage.clear();
    this.toastServie.presentToast('Logged out successfully!');
    const navigationExtras: NavigationExtras = {
      replaceUrl: true,
      queryParams: {
        page: 'component'
      }
    };
    this.storage.clear();
    this.router.navigate(['/pop-up'], navigationExtras);
    // this.userRedirect();
  }

  userRedirect() {
    this.businessSession();
  }

  businessSession() {
    this.storage.get('businessUser').then(resp => {
      console.log(resp);
      if (resp == null) {
        this.travellerSession();
      }
      this.sessionDetails.business = resp;
      console.log('this.sessionDetails.business', this.sessionDetails.business);
      if (this.sessionDetails.business != null) {
        console.log('redirecting to list your business.........');
        this.router.navigate(['/list-business'], { replaceUrl: true });
      }
      // console.log('Pop-up => Logged in user details', this.sessionDetails);
    }).catch(err => {
      console.log(err);
    });
  }

  travellerSession() {
    this.storage.get('travellerUser').then(resp => {
      console.log(resp);
      if (resp == null) {
        this.router.navigate(['/pop-up']);
      }
      this.sessionDetails.traveler = resp;
      console.log('this.sessionDetails.traveler', this.sessionDetails.traveler);
      if (this.sessionDetails.traveler != null) {
        console.log('redirecting to landing.........');
        this.router.navigate(['/landing']);
      }
    });
  }

  toggle() {
    this.menu.close();
  }

  async alert() {
    const alert = await this.alertController.create({
      header: 'This feature is not yet implemented',
      //subHeader: 'Subtitle',
      buttons: ['OK']
    });
    await alert.present();
  }
}
