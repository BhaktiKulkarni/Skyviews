import { Component, OnInit, EventEmitter } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Router } from '@angular/router';
import { Auth } from 'src/auth';
import { Storage } from '@ionic/storage';
import { Events, AlertController } from '@ionic/angular';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
})

export class PreferencesPage implements OnInit {
  // @Output() featureSelected=new EventEmitter<string>();
  avatarSelected: any = {};
  isLoading = false;
  avatarFlag = false;
  preferenceFlag = false;
  selectedpreference: string[] = [];
  preferenceavatar: any;
  preferenceava: any;
  avatars;
  preferences;
  sessionDetails: any = { traveler: [], business: [] };
  connected: boolean; storedPref;
  ntwrkSubscription;
  constructor(
    private api: ApiService,
    public loader: LoaderService,
    private sqlite: SQLite,
    private router: Router,
    private auth: Auth,
    public storage: Storage,
    public events: Events,
    public alertController: AlertController,
    private ntwrkService: NetworkService
  ) {
    // this.networkSubscription();
  }

  ionViewWillLeave() {
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
    });
  }

  getStoredPrefName() {
    // console.log(this.preferences);
    // console.log(this.storedPref);
    this.preferences.checked = false;
    for (var i = 0; i < this.preferences.length; i++) {
      for (var j = 0; j < this.storedPref.length; j++) {
        if (this.preferences[i].term_id == this.storedPref[j]) {
          this.preferences[i].checked = true;
        }
      }
    }
  }

  ngOnInit() {
    this.storage.get('travellerUser').then(resp => {
      this.sessionDetails.traveler = resp;
      //console.log('Preference => Logged in user details', this.sessionDetails);
    });
    this.storage.get('businessUser').then(resp => {
      this.sessionDetails.business = resp;
      //console.log('Preference => Logged in user details', this.sessionDetails);
    });

    this.loader.present();
    this.api.getApiResponse('get_avatars').then(res => {
      // console.log(res);
      this.avatars = res;
    },
      error => {
        console.log(error);
        this.loader.dismiss();
      });

    this.api.getApiResponse('get_preferences').then(res => {
      this.preferences = res;
      // console.log(res);
      this.loader.dismiss();
      this.storage.get('preference').then(resp => {
        console.log('getStoredPreferencesAvtars', resp);
        if (resp != null) {
          console.log(resp[0]);
          this.storedPref = resp[0];
          this.selectedpreference = resp[0];
          this.getStoredPrefName();
        }
      }).catch(err => {
        console.log(err);
      });
    }, error => {
      console.log(error);
      this.loader.dismiss();
    });
    this.ntwrkServiceSubscription();
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

  checkSelected(selectedAvatar) {
    if (selectedAvatar == '') {
      this.avatarSelected = '';
    }
    else {
      this.avatars.filter((avatar) => {
        if (avatar.name == selectedAvatar) {
          this.avatarSelected = avatar;
        }
      });
    }
    this.avatarFlag = true;
  }

  checkEvent(ev, preference) {
    console.log(ev.detail.checked);
    console.log(preference);
    if(ev.detail.checked == true){
      console.log(this.selectedpreference.includes(preference.term_id));
      if (this.selectedpreference.includes(preference.term_id)) {
        console.log('preference exists');
      } else {
        this.selectedpreference.push(preference.term_id);
        console.log(this.selectedpreference);
      }
    }else{
      const index: number = this.selectedpreference.indexOf(preference.term_id);
      console.log(index);
      if (index !== -1) {
        this.selectedpreference.splice(index, 1);
        console.log(this.selectedpreference);
      }
    }
    // if (this.selectedpreference.length !== 0) {
    //   this.preferenceFlag = true;
    // } else {
    //   this.preferenceFlag = false;
    // }
  }

  navigate() {
    var preferenceList: any = [];
    var list: any = [];
    // console.log('TCL: PreferencesPage -> navigate -> this.avatarSelected', this.avatarSelected)

    if (this.avatarSelected == undefined) {
      this.storage.set('avtar', '');
      this.avatarSelected.term_id = '';
    } else if (this.avatarSelected == '') {
      this.storage.set('avtar', '');
      this.avatarSelected.term_id = '';
    }
    this.storage.set('avtar', this.avatarSelected);
    this.storage.set('preference', [this.selectedpreference]);
    // console.log(this.avatarSelected.term_id, list);
    this.router.navigate(['/landing'], { replaceUrl: true, queryParams: { id: this.avatarSelected.term_id, ids: [list] } });
    // this.router.navigate(['/landing']);
  }
}