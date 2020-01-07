import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events, AlertController } from '@ionic/angular';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  sessionDetails: any = { traveler: [], business: [] };
  connected: boolean;
  alertCount = 0; ntwrkSubscription;

  constructor(public storage: Storage, public events: Events, public alertController: AlertController,
    private ntwrkService: NetworkService) {

  }

  ngOnInit() {
    // this.networkSubscription();
    this.storage.get("travellerUser").then(resp => {
      this.sessionDetails.traveler = resp;
      this.events.publish("user:created", this.sessionDetails.traveler);
      // this.getSavedPlaces();
    });
    this.storage.get("businessUser").then(resp => {
      this.sessionDetails.business = resp;
    });
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

  networkSubscription() {
    console.log('networkSubscription()');
    this.events.subscribe('connected', (con) => {
      console.log(con);
      this.connected = con;
      if (con == false) {
        const option = 'retry';
        const params = { message: 'Netwrok is disconnected', header: 'No Internet' };
        this.retryConnection(params, option);
      }
    });
  }

  async retryConnection(params, option) {
    this.alertCount++;
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
                // this.alertController.dismiss();
                // console.log(this.alertCount);
                // console.log(alert.present());
                this.retryConnection(params, option);
              } else {
                console.log(this.alertCount);
                // console.log(alert.present());
                if (alert.present()) {
                  console.log('alert is present');
                  // this.alertController.dismiss();
                } else {
                  console.log('alert not present');
                }
              }
            }
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  ionViewWillLeave() {
    console.log(this.ntwrkSubscription);
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
    });
    console.log(this.ntwrkSubscription);
    // console.log('will leave aboutPage');
    // this.events.unsubscribe('connected', () => {
    //   console.log('unsubscribed about');
    // });
  }
}
