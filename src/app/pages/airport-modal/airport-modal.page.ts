import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ModalController, AlertController } from '@ionic/angular';
import { NetworkService } from '../../services/network.service';
@Component({
  selector: 'app-airport-modal',
  templateUrl: './airport-modal.page.html',
  styleUrls: ['./airport-modal.page.scss'],
})
export class AirportModalPage implements OnInit {
  searchResults = []; page; connected: boolean;
  ntwrkSubscription;
  constructor(private api: ApiService, private modalCtrl: ModalController, private ntwrkService: NetworkService,
    private alertCtrl: AlertController) {
    // this.page = this.navParams.get('page');
   }

  ngOnInit() {
    console.log(`${this.page}`);
    this.ntwrkServiceSubscription();
  }

  ntwrkServiceSubscription() {
    this.ntwrkSubscription = this.ntwrkService.getNetworkStatus().subscribe((res:boolean)=>{
      // console.log(res);
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

  getItems(ev){
    const val = ev.srcElement.value;
    // console.log(val);
    this.api.searchAirport({string: ev.srcElement.value}).subscribe((res: any) => {
      // console.log(res);
      // console.log(res.length);
      this.searchResults = res;
    }, err => {
      console.log(err);
    });
  }

  selectCode(search){
    // console.log(search);
    this.modalCtrl.dismiss(search);
  }

  async retryConnection(params, option) {
    // this.alertCount++;
    const alert = await this.alertCtrl.create({
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
                // console.log(this.alertCount);
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
}
