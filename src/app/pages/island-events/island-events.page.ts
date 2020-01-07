import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Storage } from '@ionic/storage';
import { Events, AlertController } from '@ionic/angular';
import { LoaderService } from 'src/app/services/loader.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { NetworkService } from '../../services/network.service';
@Component({
  selector: 'app-island-events',
  templateUrl: './island-events.page.html',
  styleUrls: ['./island-events.page.scss'],
})
export class IslandEventsPage implements OnInit {
  sessionDetails: any = { traveler: [], business: [] };

  eventsArr: any = []; shownGroup = null; connected: boolean;
  months: any = [{ month: 'Jan', index: 0, name: 'January' }, { month: 'Feb', index: 1, name: 'February' }, { month: 'Mar', index: 2, name: 'March' }, { month: 'Apr', index: 3, name: 'April' }, { month: 'May', index: 4, name: 'May' }, { month: 'Jun', index: 5, name: 'June' },
  { month: 'Jul', index: 6, name: 'July' }, { month: 'Aug', index: 7, name: 'August' }, { month: 'Sep', index: 8, name: 'September' }, { month: 'Oct', index: 9, name: 'October' }, { month: 'Nov', index: 10, name: 'November' }, { month: 'Dec', index: 11, name: 'December' }]
  selectedEvent: any; event = []; currMonth;
  ntwrkSubscription
  constructor(public loader: LoaderService, public apiService: ApiService, public storage: Storage,
    public events: Events,
    private alertController: AlertController,
    private iab: InAppBrowser, private ntwrkService: NetworkService) {
      
  }

  networkSubscription() {
    this.events.subscribe('connected', (con) => {
      // console.log(con);
      this.connected = con;
      if (con == false) {
        const option = 'retry';
        const params = { message: 'Netwrok is disconnected', header: 'No Internet' };
        this.retryConnection(params, option);
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
              if (this.connected == false) {
                const option = 'retry';
                const params = { message: 'Network is disconnected', header: 'No Internet' };
                this.retryConnection(params, option);
              } else {
                this.ngOnInit();
                this.ionViewDidEnter();
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
  
  //get_current_event_category_posts
  ionViewDidEnter() {
    this.loader.present();
    this.apiService.getApiResponse('event_category_posts').then(res => {
      this.loader.dismiss();
      // console.log(res);
      this.eventsArr = res;
      const month = new Date().getMonth();
      for (let i = 0; i < 12; i++) {
        if (this.months[i].index == month) {
          this.showEvents(this.months[i]);
          this.currMonth = this.months[i].name;
        }
      }
    });
  }

  showEvents(month) {
    console.log(this.eventsArr);
    console.log(month);
    // console.log('TCL: IslandEventsPage -> showEvents -> month', month);
    for (let i = 0; i < this.eventsArr.length; i++) {
      if (month.name == this.eventsArr[i].month) {
        console.log(this.events[i]);
        console.log(this.eventsArr[i]);
        // console.log(this.eventsArr[i].events);
        this.selectedEvent = this.eventsArr[i];
        this.currMonth = this.eventsArr[i].month;
        // this.event = this.eventsArr[i].events;
        break;
      } else {
        this.selectedEvent = [];
      }
    }
  }

  openUrl(event) {
    console.log(event.more_info_url);
    this.iab.create(event.more_info_url);
    //browser.exec
  }

  expandEvent(event, i) {
    // console.log(event);
    // console.log(i);
    if (this.showDetails(i)) {
      this.shownGroup = null;
    } else {
      this.shownGroup = i;
    }
  }

  showDetails(i) {
    return this.shownGroup === i;
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

  ionViewWillLeave() {
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
    });
  }
}
