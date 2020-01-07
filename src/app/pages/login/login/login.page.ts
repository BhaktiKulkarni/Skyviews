import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, Events, ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Auth } from '../../../../auth';
import { ToastService } from 'src/app/services/toast.service';
import { Location } from '@angular/common';
import { LoaderService } from 'src/app/services/loader.service';
import { Storage } from '@ionic/storage';
import { ModalPagePage } from '../../modal-page/modal-page.page';
import { NetworkService } from '../../../services/network.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  email: any;
  data: any;
  loginForm: FormGroup;
  errorMessage = '';
  countries = {};
  loginResp: any;
  forgetPasswordResp: any;
  forgetPasswordParams: { user_id: any; user_otp: any; newPassword: any; };

  validation_messages = {
    'user_email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Please enter a valid email.' }
    ],
    'user_password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' }
    ]
  };
  saveDetailsFlag: boolean;
  redirect: string;
  connected: boolean;
  ntwrkSubscription;
  constructor(
    public storage: Storage,
    private navCtrl: NavController,
    private router: Router,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    public toastService: ToastService,
    private alertController: AlertController,
    private auth: Auth,
    private events: Events,
    private location: Location,
    public loader: LoaderService,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    private ntwrkService: NetworkService
  ) {
    this.initForm();
    this.redirect = this.route.snapshot.queryParamMap.get('page');
    // this.networkSubscription();
  }

  initForm() {
    this.loginForm = this.formBuilder.group({
      user_email: ['', Validators.compose([
        Validators.required,
        Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')
      ])],
      user_password: ['', Validators.compose([
        Validators.minLength(5),
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9!@#$&()-`.+,/]*$')
      ])],
      remember: ['']
    });
    this.updateValues();
  }

  updateValues() {
    this.storage.get('remember').then(res => {
      console.log('remember me response', res);
      if (res == null) {
        this.loginForm.controls.user_email.setValue('');
        this.loginForm.controls.user_password.setValue('');
        //this.initializeLoginForm(val);
      } else {
        this.loginForm.controls.user_email.setValue(res.user_email);
        this.loginForm.controls.user_password.setValue(res.user_password);
        //this.initializeLoginForm(res);
      }
    });
  }

  ngOnInit() {
    this.ntwrkServiceSubscription();
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad LoginPage');
  }

  ionNavDidLoad() {
    // console.log('ionNavDidLoad LoginPage');
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

  networkSubscription() {
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

  isChecked(event) {
    console.log(event);
    console.log(event.detail.checked);
    if (event.detail.checked == true) {
      this.saveDetailsFlag = true;
    }
  }

  loginUser(value) {
    // console.log(JSON.stringify(value));
    value.user_role = 'traveler';
    this.loader.present();
    // console.log('Check..........', value);
    this.authService.userLogin(value).subscribe(
      res => {
        console.log('Response before publishing..', res);
        this.loginResp = res;
        if (this.loginResp != null) {
          if (this.loginResp.message === 'User login successfully.') {
            this.auth.login(res, 'traveler');
            this.events.publish('user:created', res);
            this.loader.dismiss();
            console.log(value.remember);
            if (value.remember == true) {
              var val = {
                user_email: value.user_email, user_password: value.user_password
              };
              console.log("TCL: LoginPage -> loginUser -> val", val);
              this.storage.set('remember', val);
            }
            if (this.redirect == 'place-details') {
              this.router.navigate(['/place-details'], { replaceUrl: true });
            }
            else {
              this.router.navigate(['/landing'], { replaceUrl: true });
            }
            // this.location.back();
          }
          else {
            this.loader.dismiss();
            this.toastService.presentToast(this.loginResp.message);
          }
        }
        else {
          this.loader.dismiss();
          this.toastService.presentToast('Provide valid credentials');
        }
      }, err => {
        console.log('Error!!', err);
        this.loader.dismiss();
      }
    );
  }

  goToRegisterPage() {
    // console.log('Register page')
    this.navCtrl.navigateForward('/register');
  }

  forgetPassword() {
    this.openPopUp();
    //     console.log(this.loginForm.value.user_email, 'this.loginForm.value.user_email');
    // this.showInputAlertFP();
    // if (this.email == "") {
    //   this.toastService.presentToast('Enter valid email to reset password');
    //   this.showInputAlertFP();
    // }
    // else {
    // this.authService.forgotPassword(this.email).subscribe(
    //   resp => {
    //     this.forgetPasswordResp = resp;
    //     // console.log('Forgot password response', this.forgetPasswordResp);
    //     // console.log('user id => ', this.forgetPasswordResp.user_id);
    //     if (this.forgetPasswordResp.user_id == null) {
    //       this.toastService.presentToast('User not registered! Verify your email');
    //     }
    //     else {
    //       this.toastService.presentToast('OTP sent to your email');
    //       this.showAlertPrompt();
    //     }
    //   }
    // )
    // }
    // this.authService.forgotPassword(email)
  }

  async  openPopUp() {
    // const navigationExtras: NavigationExtras = {
    //   queryParams: {
    //     page: 'forgotPass'
    //   }
    // };
    // this.router.navigate(['/modal-page'], navigationExtras);
    const modal = await this.modalCtrl.create({
      component: ModalPagePage,
      componentProps: {
        'page': 'forgotPass'
      },
      cssClass: 'modal-page-css'
    });
    modal.onWillDismiss().then(data => {
      console.log(data);
    });
    await modal.present();
  }

  async showInputAlertFP() {
    const alert = await this.alertController.create({
      header: 'Forgot Password',
      // subHeader: 'Enter valid email',
      inputs: [
        {
          name: 'email',
          placeholder: 'Email',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Submit',
          handler: (data) => {
            this.loader.present();
            // console.log(data.email);
            if (data === '') {
              this.toastService.presentToast('Enter valid email.');
            } else {
              this.authService.forgotPassword(data.email).subscribe(resp => {
                this.forgetPasswordResp = resp;
                console.log('Forgot password response', resp);
                // console.log('user id => ', this.forgetPasswordResp.user_id);
                if (this.forgetPasswordResp.user_id == null) {
                  this.loader.dismiss();
                  this.toastService.presentToast('User not registered! Verify your email');
                }
                else {
                  this.loader.dismiss();
                  this.toastService.presentToast('OTP sent to your email');
                  this.showAlertPrompt();
                }
              });
            }
            //  this.email = data;
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  async showAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Reset password',
      inputs: [
        {
          name: 'otp',
          placeholder: 'OTP',
          type: 'text'
        },
        {
          name: 'newPassword',
          placeholder: 'New Password',
          type: 'password',
        },
        {
          name: 'confirmPassword',
          placeholder: 'Confirm Password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Submit',
          handler: (alertData) => {
            //   console.log(alertData);
            if (alertData.otp !== null) {
              if (alertData.newPassword !== alertData.confirmPassword) {
                this.toastService.presentToast("Password's don't match");
                this.showAlertPrompt();
              }
              else {
                //     console.log(this.forgetPasswordResp.otp + '!=' + alertData.otp);
                if (this.forgetPasswordResp.otp != alertData.otp) {
                  this.toastService.presentToast("OTP doesn't match! Retry after 10 mins");
                }
                else {
                  // tslint:disable-next-line: max-line-length
                  this.forgetPasswordParams = { user_id: this.forgetPasswordResp.user_id, user_otp: alertData.otp, newPassword: alertData.newPassword };
                  this.authService.resetPassword(this.forgetPasswordParams).subscribe(
                    resp => {
                      console.log('forget password!!!!!!!!!!!!', resp);
                      this.toastService.presentToast('Password changed successfully');
                    }
                  );
                }
              }
            }
          }
        },
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            this.router.navigate(["/login"]);
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }
}