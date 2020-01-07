import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AlertController, Events, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ApiService } from '../../services/api.service';
import { AirportModalPage } from '../../pages/airport-modal/airport-modal.page';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-plan-trip',
  templateUrl: './plan-trip.page.html',
  styleUrls: ['./plan-trip.page.scss'],
})
export class PlanTripPage implements OnInit {
  fromAnguilla: FormGroup; toAnguilla: FormGroup;
  sessionDetails: any = { traveler: [], business: [] };
  segSelected = 'from'; tripType = 'one'; checked= true;
  currYear; maxYear; searchResults = [];
  bestPriceList = [];
  currPriceList = []; usd = 63.9722; searched= false;
  public lineChartData: Array<any> = [
    { data: [65, 59, 80, 81, 56, 55, 40, 60, 70, 70, 80, 30], label: 'Flights' },
    { data: [28, 48, 40, 19, 86, 27, 90, 40, 45, 80, 50, 10], label: 'Accomodations' },
    // { data: [18, 48, 77, 9, 100, 27, 40], label: 'Series C' }
  ];
  public lineChartLabels: Array<any> = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  public lineChartOptions: any = {
    responsive: true,
    scales: {
          yAxes: [{
            ticks: {
              display: false
            }
          }]
        }
  };
  public lineChartColors: Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  connected: boolean;
  ntwrkSubscription;
  constructor(private fb: FormBuilder, public alertController: AlertController, private storage: Storage,
              private events: Events, private api: ApiService, private modalCtrl: ModalController,
              private ntwrkService: NetworkService) {
    const year = new Date();
    this.currYear = year.getFullYear();
    this.maxYear = this.currYear + 1;
    console.log(this.currYear);
    this.fromAnguilla = this.fb.group({
      origin: ['AXA', {value: 'AXA', disabled: true}, Validators.required],
      dest: ['', Validators.required],
      depDate: ['', Validators.required]
    });
    this.toAnguilla = this.fb.group({
      origin: ['', Validators.required],
      dest: ['AXA', {value: 'AXA', disabled: true}, Validators.required],
      depDate: ['', Validators.required]
    });
    // this.networkSubscription();
    // this.getCurrencyValues();
  }

  public randomize(): void {
    let _lineChartData: Array<any> = new Array(this.lineChartData.length);
    for (let i = 0; i < this.lineChartData.length; i++) {
      _lineChartData[i] = { data: new Array(this.lineChartData[i].data.length), label: this.lineChartData[i].label };
      for (let j = 0; j < this.lineChartData[i].data.length; j++) {
        _lineChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
      }
    }
    this.lineChartData = _lineChartData;
  }
  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }
  public chartHovered(e: any): void {
    // console.log(e);
  }
  
  ngOnInit() {
    // this.alert();
    this.ntwrkServiceSubscription();
  }

  async openModal() {
    console.log('opn modal called');
    const modal = await this.modalCtrl.create({
      component: AirportModalPage,
      componentProps: {
        page: 'airport'
      },
      cssClass: ''
    });
    modal.onWillDismiss().then((data: any) => {
      console.log(data);
      console.log(data.data.city_iata);
      console.log(JSON.stringify(data));
      this.fromAnguilla.controls.dest.setValue(data.data.iata);
      this.toAnguilla.controls.origin.setValue(data.data.iata);
    });
    await modal.present();
  }


  // {lat:'',lng:''}
  // {string:''}

  searchAirport() {

  }

  getInput(ev) {
    // console.log(ev);
    console.log(ev.target.value);
    if (ev.target.value.length > 2) {
      this.api.searchAirport({string: ev.target.value}).subscribe((res: any) => {
        // console.log(res);
        // console.log(res.length);
        this.searchResults = res;
      }, err => {
        console.log(err);
      });
    }
  }

  ionViewWillLeave() {
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
    });
  }

  getCurrencyValues() {
    this.api.getCurencyValues().subscribe((res: any) => {
      console.log(res);
      this.usd = res.usd;
    }, err => {
      console.log(err);
    });
  }

  // {origin:'',dest:'',depDate:'',oneWay:''}
  FindPrices(formValue) {
    if (formValue.depDate.length > 10) {
      const str = formValue.depDate.slice(0, 10);
      // console.log(str);
      formValue.depDate = str;
      // console.log(formValue.depDate);
    }
    if (this.tripType == 'one') {
      formValue.oneWay = true;
    } else {
      formValue.oneWay = false;
    }
    this.api.getPrices(formValue).subscribe((res: any) => {
      this.searched = true;
      console.log(res);
      console.log(res.best_prices);
      this.bestPriceList = res.best_prices;
      this.currPriceList = res.current_depart_date_prices;
    }, err => {
      console.log(err);
    });
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

  async retryConnection(params, option) {
    const alert = await this.alertController.create({
      header: params.header,
      message: params.message,
      buttons: [
        {
          text: 'Retry',
          handler: () => {
            if (option == 'retry') {
                if (this.connected == false) {
                  const option = 'retry';
                  const params = {message: 'Network is disconnected', header: 'No Internet' };
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

  async loggedUser() {
    await this.storage.get('travellerUser').then(resp => {
      this.sessionDetails.traveler = resp;
      this.events.publish('user:created', this.sessionDetails.traveler);
      console.log('Logged in user details', this.sessionDetails);
    });
  }

  ionViewDidEnter() {
    this.loggedUser();
  }

  segmentChanged(ev) {
    // console.log(ev);
  }

  changeForm(seg) {
    this.segSelected = seg;
  }

  segmentButtonClicked(opt) {
    console.log(opt);
    this.tripType = opt;
    if (opt == 'one') {
      this.checked = true;
    } else if (opt == 'two') {
      this.checked = false;
    }
    console.log(this.checked);
  }

  async alert() {
    const alert = await this.alertController.create({
      header: 'This feature is not yet implemented',
      subHeader: 'Page contains hardcoded data',
      buttons: ['OK']
    });
    await alert.present();
  }
}
