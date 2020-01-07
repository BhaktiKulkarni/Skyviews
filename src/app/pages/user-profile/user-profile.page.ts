import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Auth } from '../../../auth';
import { AlertController, Events, ActionSheetController } from '@ionic/angular';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Storage } from '@ionic/storage';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { LoaderService } from 'src/app/services/loader.service';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss']
})
export class UserProfilePage implements OnInit {
  userProfile: FormGroup;
  avatarsArr;
  preferences: any;
  categories;
  sessionDetails: any = { traveler: [], business: [] };
  checkEmailUpdate = false;
  storedAvtar: any;
  storedPref: any = [];
  prefArray: any = [];
  countries: Object;
  profileImage = '';
  getSavedTravellerDetails: any = [];
  newImage: boolean = false;
  connected: boolean;
  ntwrkSubscription;
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: Auth,
    private alertController: AlertController,
    private toastServie: ToastService,
    private router: Router,
    private events: Events,
    public userService: UserService,
    public storage: Storage,
    private cd: ChangeDetectorRef,
    public actionSheetController: ActionSheetController,
    public camera: Camera,
    public loader: LoaderService,
    private ntwrkService: NetworkService
  ) {
    this.getStoredPreferencesAvtars();
    // this.getPreferenceAvatarCategories();
    this.userProfile = this.fb.group({
      fullname: ['', Validators.required],
      mobile: [''],
      // email: ['', Validators.required],
      address: [''],
      avatars: [''],
      age: ['', Validators.required],
      country_of_origin: ['', Validators.required],
      gender: ['', Validators.required],
      //preferences: ['', Validators.required],
      budget_per_day: ['', Validators.required],
      city: ['', Validators.required]
    });
    // this.networkSubscription();
  }

  ngOnInit() {
    //   this.getAllCountries().subscribe((data)=>{
    //     this.countries = data;
    //     console.log("Data", data);
    // });
    // this.getPreferenceAvatarCategories();
    this.ntwrkServiceSubscription();
  }

  ionViewDidEnter() {
    this.loader.present();
    // this.getPreferenceAvatarCategories();
    this.storage.get('travellerUser').then(resp => {
      this.sessionDetails.traveler = resp;
      this.events.publish('user:created', this.sessionDetails.traveler);
      // console.log(resp);
      this.getStoredPreferencesAvtars();
      this.getTravellerDetails(resp);
      // console.log('user profile', this.sessionDetails.traveler)
    }).catch(err=>{
      console.log(err);
      this.loader.dismiss();
    });
    this.storage.get('businessUser').then(resp => {
      this.sessionDetails.business = resp;
    });
    // this.getPreferenceAvatarCategories();
    this.getAllCountries();
  }

  ionViewWillLeave() {
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
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

  async retryConnection(params, option){
    const alert = await this.alertController.create({
      header: params.header,
      message:params.message,
      buttons: [
        {
          text: 'Retry',
          handler: () => {
            if (option == 'retry'){
                if (this.connected == false){
                  const option = 'retry';
                  const params = {message: 'Network is disconnected', header: 'No Internet' };
                  this.alertController.dismiss();
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

  getTravellerDetails(details) {
    console.log('getTravellerDetails', details);
    this.api.getTravellerDetails(details.user_id).subscribe((res: any) => {
      this.getSavedTravellerDetails = res;
      console.log('getTravellerDetails' + JSON.stringify(this.getSavedTravellerDetails));
      if (this.getSavedTravellerDetails.profile_img == 'http://ec2-34-207-105-29.compute-1.amazonaws.com/skyviews/wp-content/uploads') {
        // console.log('found path for profile img')
        this.getSavedTravellerDetails.profile_img == '';
      }
      // console.log("res from api for getSavedTravellerDetails", this.getSavedTravellerDetails);
      this.userProfile.controls.fullname.setValue(this.getSavedTravellerDetails.fullname);
      this.userProfile.controls.mobile.setValue(this.getSavedTravellerDetails.mobile);
      this.userProfile.controls.age.setValue(this.getSavedTravellerDetails.age);
      this.userProfile.controls.country_of_origin.setValue(this.getSavedTravellerDetails.country_of_origin);
      this.userProfile.controls.gender.setValue(this.getSavedTravellerDetails.gender);
      this.userProfile.controls.budget_per_day.setValue(this.getSavedTravellerDetails.budget_per_day);
      this.userProfile.controls.city.setValue(this.getSavedTravellerDetails.city);
      // console.log('this.getSavedTravellerDetails.avatars' + this.getSavedTravellerDetails.avatars);
      this.userProfile.controls.avatars.setValue(parseInt(this.getSavedTravellerDetails.avatars));
      this.loader.dismiss();
    }, err => {
      console.log(err);
      this.loader.dismiss();
      this.toastServie.presentToast('Unabe to fetch data, please check your internet, and try again');
    }
    );
  }

  async getStoredPreferencesAvtars() {
    await this.storage.get('avtar').then(resp => {
      if (resp == {}) {
        this.storedAvtar = '';
      }
      else {
        this.storedAvtar = resp.term_id;
      }
    });

    await this.storage.get('preference').then(resp => {
      //console.log('getStoredPreferencesAvtars', resp);
      this.storedPref = resp[0];
      this.getPreferenceAvatarCategories();
    });
  }

  async getPreferenceAvatarCategories() {
    await this.api.getApiResponse('get_avatars').then(res => {
      this.avatarsArr = res;
      console.log('TCL: UserProfilePage -> getPreferenceAvatarCategories -> this.avatars', this.avatarsArr)
    }, err => {
      console.log(JSON.stringify(err));
    });

    await this.api.getApiResponse('get_preferences').then(res => {
      this.preferences = res;
      console.log('TCL: UserProfilePage -> getPreferenceAvatarCategories -> this.preferences', this.preferences)
      this.getStoredPrefName();
    }, err => {
      console.log(JSON.stringify(err));
    });
  }

  checkboxClicked(event, preference) {
    if (event.detail.checked == true) {
      if (this.storedPref.length > 0) {
        //check storedPref is null or not.
        for (var i = 0; i < this.storedPref.length; i++) {
          if (preference.term_id != this.storedPref[i]) {
            if (i == this.storedPref.length - 1) {
              this.storedPref.push(preference.term_id);
              //console.log(this.storedPref);
            }
          }
        }
      } else {
        this.storedPref.push(preference.term_id);
      }
    } else {
      for (var i = 0; i < this.storedPref.length; i++) {
        if (preference.term_id == this.storedPref[i]) {
          this.storedPref.splice(i, 1);
          // console.log(this.storedPref);
        }
      }
    }
    // console.log("TCL: UserProfilePage -> checkboxClicked -> this.storedPref", this.storedPref);
    // for(var i=0; i<this.storedPref[0].length; i++) {

    // }
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

  updateProfile(userProfile) {
    this.loader.present();
    userProfile.profilepic = this.profileImage;
    userProfile.preferences = this.storedPref;
    userProfile.user_id = this.sessionDetails.traveler.user_id;
    console.log('TCL: UserProfilePage -> updateProfile -> userProfile', userProfile);
    this.api.postUpdatedTravellerDetails(userProfile).subscribe(
      res => {
        console.log(
          'Posted response for updated profile:' + JSON.stringify(res)
        );
        if (res == 'User Updated succesfully') {
          console.log(userProfile);
          setTimeout(() => {
            console.log('inside setTimeout');
            this.getTravellerDetails(userProfile);
          }, 2000);
          this.loader.dismiss();
          this.toastServie.presentToast('User profile updated successfully!');
          this.newImage = false;
        } else {
          this.loader.dismiss();
          this.toastServie.presentToast('Unable to update, try again later!');
        }
      },
      err => {
        console.log(err);
        this.loader.dismiss();
        this.toastServie.presentToast('Unable to update, try again later!');
      }
    );
  }

  getAllCountries() {
    this.api.getApiResponse('all_countries').then(res => {
      this.countries = res;
      // console.log(this.countries);
    });
  }

  uploadFile() {
    this.presentActionSheet();
  }

  async presentActionSheet() {
    // console.log("Here.............");
    const actionSheet = await this.actionSheetController.create({
      header: 'Select an option',
      buttons: [
        {
          text: 'Camera',
          role: 'camera',
          handler: () => {
            console.log('camera clicked');
            this.openCamera('camera');
          }
        },
        {
          text: 'Saved Album',
          handler: () => {
            console.log('album clicked');
            this.openCamera('photo');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  openCamera(sourceType) {
    let src;
    // console.log(sourceType);
    if (sourceType == 'camera') {
      src = this.camera.PictureSourceType.CAMERA;
    } else if (sourceType == 'photo') {
      src = this.camera.PictureSourceType.SAVEDPHOTOALBUM;
    }
    let options: CameraOptions = {
      quality: 20,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: src,
      allowEdit: true
    };
    this.camera.getPicture(options).then(
      imageData => {
        //this.uploadImage(imageData);
        this.newImage = true;
        this.profileImage = 'data:image/jpeg;base64,' + imageData;
        console.log(
          'TCL: UserProfilePage -> openCamera -> profileImage',
          this.profileImage
        );
      },
      err => {
        console.log(JSON.stringify(err));
        //alert(JSON.stringify(err));
      }
    );
  }
}
