import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, Events, AlertController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
// import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastService } from 'src/app/services/toast.service';
import { Auth } from 'src/auth';
import { Storage } from '@ionic/storage';
import { LoaderService } from 'src/app/services/loader.service';
import { ModalPagePage } from '../../modal-page/modal-page.page';
import { NetworkService } from '../../../services/network.service';
@Component({
  selector: 'app-business-login',
  templateUrl: './business-login.page.html',
  styleUrls: ['./business-login.page.scss'],
})

export class BusinessLoginPage implements OnInit {
  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;
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
  sessionDetails: any;
  saveDetailsFlag: boolean = false;
  connected: boolean;
  ntwrkSubscription;
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private auth: Auth,
    private events: Events,
    private alertController: AlertController,
    public storage: Storage,
    public loader: LoaderService,
    private modalCtrl: ModalController,
    private ntwrkService: NetworkService
  ) {
    // this.networkSubscription();
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      user_email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')
      ])),
      user_password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9!@#$&()-`.+,/]*$')
      ])),
      remember: ['']
    });
    this.updateValues();

    //     this.storage.get('businessUser').then(resp => {
    //     this.sessionDetails = resp;
    //     console.log('this.sessionDetails.business', this.sessionDetails);
    //   // console.log('Pop-up => Logged in user details', this.sessionDetails);
    //   if (this.sessionDetails.user_email != null) {
    //     this.router.navigate(['/list-business']);
    //   }
    // });
    this.ntwrkServiceSubscription()
  }

  updateValues() {
    this.storage.get('b_remember').then(res => {
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

  ionViewDidLoad() {
    //    console.log('ionViewDidLoad LoginPage');
    // this.storage.get('businessUser').then(resp => {
    //   this.sessionDetails = resp;
    //   console.log('Logged in user details', this.sessionDetails);
    // });
  }

  ionNavDidLoad() {
    // console.log('ionNavDidLoad LoginPage');
  }

  ionViewWillLeave() {
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
    });
  }

  isChecked(event) {
    console.log(event);
    console.log(event.detail.checked);
    if (event.detail.checked == true) {
      this.saveDetailsFlag = true;
    }
  }

  loginUser(value) {
    console.log("TCL: BusinessLoginPage -> loginUser -> value", value);
    value.user_role = 'business_user';
    this.loader.present();
    this.authService.userLogin(value).subscribe(res => {
      this.loginResp = res;
      // console.log("TCL: BusinessLoginPage -> loginUser -> this.loginResp", this.loginResp);
      if (this.loginResp != null) {
        if (this.loginResp.message === 'User login successfully.') {
          // console.log(this.loginResp.message);
          this.auth.login(res, 'business');
          //  this.events.publish('user:created', res);
          this.loader.dismiss();
          console.log(value.remember);
          if (value.remember == true) {
            var val = {
              user_email: value.user_email, user_password: value.user_password
            };
            console.log("TCL: LoginPage -> loginUser -> val", val);
            this.storage.set('b_remember', val);
          }

          // this.navCtrl.navigateRoot('/list-business');
          this.router.navigate(['/list-business'], { replaceUrl: true });
          // this.router.navigate(['/list-business']);
        }
        else if (this.loginResp.message === 'Do you really want to be a business user account?') {
          // console.log(this.loginResp.message);
          this.loader.dismiss();
          this.toastService.presentToast('User does not exist for this role. Please register');
          // this.yesnoalert(value);
        }
        else {
          // console.log(this.loginResp.message);
          this.loader.dismiss();
          this.toastService.presentToast(this.loginResp.message);
        }
      }
      else {
        this.toastService.presentToast('Provide valid credentials');
      }
    }, err => {
      //    console.log(err);

    });
  }

  ntwrkServiceSubscription() {
    this.ntwrkSubscription = this.ntwrkService.getNetworkStatus().subscribe((res: boolean) => {
      console.log(res);
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

  async yesnoalert(value) {
    const alert = await this.alertController.create({
      header: "Do you want the same username for traveller and business?",
      // subHeader: 'Subtitle',
      // message: 'This is an alert message.',
      buttons: [
        {
          text: "Yes",
          handler: () => {
            this.authService.switchUserRoles(value.user_email, value.user_password, value.role).subscribe(res => {
              var resp: any = [];
              resp = res;
              // console.log(resp);
              // if(resp.message == 'Traveller account activated successfully.'){
              //   this.toastService.presentToast('User not activated, Please register');
              // }
            });
          }
        },
        {
          text: "No",
          role: "cancel",
          handler: () => {
            this.router.navigate(["/business-registration"]);
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  goToRegisterPage() {
    //     console.log('Register page')
    this.navCtrl.navigateForward('/business-registration');
  }

  forgetPassword() {
    // this.showInputAlertFP();
    this.openPopUp();
  }

  async  openPopUp() {
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
            //console.log(data.email);
            if (data === '') {
              this.loader.dismiss();
              this.toastService.presentToast('Enter valid email.');
            }
            else {
              this.authService.forgotPassword(data.email).subscribe(
                resp => {
                  this.forgetPasswordResp = resp;
                  // console.log('Business pg => Forgot password response', this.forgetPasswordResp);
                  // console.log('user id => ', this.forgetPasswordResp);
                  if (this.forgetPasswordResp == null) {
                    this.loader.dismiss();
                    this.toastService.presentToast('User not registered! Verify your email');
                  }
                  else {
                    this.loader.dismiss();
                    this.toastService.presentToast('OTP sent to your email');
                    this.showAlertPrompt();
                  }
                }
              );
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
                      //  console.log('forget password!!!!!!!!!!!!', resp);
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
            this.router.navigate(["/business-login"]);
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }
}