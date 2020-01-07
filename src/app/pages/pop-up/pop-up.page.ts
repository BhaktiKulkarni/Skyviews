import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController, Platform, MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
// import { Auth } from 'src/auth';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.page.html',
  styleUrls: ['./pop-up.page.scss'],
})
export class PopUpPage implements OnInit {
  subscription: any;
  sessionDetails: any = { traveler: [], business: [] };
  page;
  constructor(
    private router: Router,
    public modalController: ModalController,
    private platform: Platform,
    private storage: Storage,
    // private auth: Auth,
    public menuCtrl: MenuController,
    private route: ActivatedRoute
  ) {
    this.storage.get('businessUser').then(resp => {
      this.sessionDetails.business = resp;
      console.log('this.sessionDetails.business', this.sessionDetails.business);
      if (this.sessionDetails.business != null) {
        console.log('redirecting to list your business.........');
        this.router.navigate(['/list-business']);
      }
      // console.log('Pop-up => Logged in user details', this.sessionDetails);
    });

    this.storage.get('travellerUser').then(resp => {
      this.sessionDetails.traveler = resp;
      console.log('this.sessionDetails.traveler', this.sessionDetails.traveler);
      if (this.sessionDetails.traveler != null) {
        console.log('redirecting to landing.........');
        this.router.navigate(['/landing']);
      }
    });

    this.route.queryParams.subscribe(params => {
      console.log(params);
      this.page = params.page;
    }, err => {
      console.log(err);
    });
    this.menuCtrl.enable(false, 'myMenu');
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    console.log('Pop-up => Logged in user details', this.sessionDetails);
    // this.subscription = this.platform.backButton.subscribe(() => {
    //   navigator['app'].exitApp();
    // });
  }

  optionSelected(option) {
    console.log('Are you on Islnd? => Pop-up', option)
    if (option == 'business') {
      this.router.navigate(['/business-login']);
    } else if (option == 'yes') {
      //  this.modalController.dismiss(option);
      console.log('Yes', option);
      this.storage.set('onIsland', option);
      // console.log('localstorage', localstorage)
      //check if user is logged in
      this.router.navigate(['/preferences']);
    } else {
      console.log('No', option);

      this.storage.set('onIsland', option);
      //   console.log('localstorage', localstorage);
      //check if user is logged in
      this.router.navigate(['/preferences']);
    }
  }

  // async presentModal() {
  //   const modal = await this.modalController.create({
  //     component: PopUpPage,
  //     cssClass: 'pop-modal'
  //   });
  //   modal.onDidDismiss().then((optionReturned) => {
  //     if (optionReturned !== null) {
  //       this.optionReturned = optionReturned.data;
  //       console.log('ondismiss' + this.optionReturned);
  //       if (this.optionReturned === 'Yes') {
  //         let localstorage = {onIsland: true};
  //         this.storage.set('localStorage', localstorage);
  //         console.log('localstorage', localstorage)
  //       } else {
  //         let localstorage = {onIsland: false};
  //         this.storage.set('localStorage', localstorage);
  //         console.log('localstorage', localstorage)
  //       }
  //       //let localstorage = {onIsland:true}
  //       //alert('Modal Sent Data :'+ dataReturned);
  //       //this.storage.set()
  //     }
  //   });
  //   return await modal.present();
  // }

  ionViewWillLeave() {
    // this.subscription.unsubscribe();
  }
}
