import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NavController, AlertController, Events } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
// import { AuthenticationService } from 'src/app/services/authentication.service';
import { NetworkService } from '../../../services/network.service';

@Component({
  selector: 'app-business-registration',
  templateUrl: './business-registration.page.html',
  styleUrls: ['./business-registration.page.scss'],
})
export class BusinessRegistrationPage implements OnInit {
  validations_form: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  signupResponse: any;
  otpResp: any;
  connected: boolean;
  ntwrkSubscription;
  validation_messages = {
    'user_email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    'user_password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' }
    ],
    'fullname': [
      { type: 'required', message: 'Fullname is required' }
    ]
  };
  otp: any;

  constructor(
    private navCtrl: NavController,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private toastService: ToastService,
    public router: Router,
    public loader: LoaderService,
    private events: Events,
    private ntwrkService: NetworkService
  ) {
    this.ntwrkServiceSubscription();
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

  ngOnInit() {
    this.validations_form = this.formBuilder.group({
      fullname: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      user_email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')
      ])),
      user_password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9!@#$&()-`.+,/]*$')
      ]))
    });
  }

  tryRegister(value) {
    this.loader.present();
    value.role = 'business_user';
    console.log("TCL: BusinessRegistrationPage -> tryRegister -> value", value);
    this.authService.userSignup(value).subscribe(
      (resp) => {
        this.signupResponse = resp;
        console.log('try register resp', this.signupResponse);
        // console.log('OTP', this.signupResponse.otp);
        if (this.signupResponse.otp != undefined) {
          this.otp = this.signupResponse.otp;
        }
        if (this.signupResponse.message === 'Check email to verify your account.') {
          this.loader.dismiss();
          this.showAlertPrompt(this.signupResponse.otp);
          this.toastService.presentToast(this.signupResponse.message);
        }
        else if (this.signupResponse.message === 'Do you really want to signup as business user?') {
          this.loader.dismiss();
          this.yesnoalert(value);
        }
        else if (this.signupResponse.message == 'Account is not activated yet.') {
          this.loader.dismiss();
          this.showAlertPrompt(this.otp);
          this.toastService.presentToast(this.signupResponse.message);
        }
      }, err => {
        this.loader.dismiss();
        console.log('try register err', err);
      }
    );
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
            this.loader.present();
            this.authService.switchUserRoles(value.user_email, value.user_password, value.role).subscribe(res => {
              console.log(res);
              var resp: any = [];
              resp = res;
              if (resp.message == 'Business account activated successfully.') {
                var params: any = [];
                params = { user_email: value.user_email, user_password: value.user_password, user_role: value.role };
                this.authService.userLogin(params).subscribe(res => {
                  this.loader.dismiss();
                  console.log(res);
                  this.toastService.presentToast('User registered successfully!');
                }, err => {
                  this.loader.dismiss();
                  console.log(err);
                });
              }
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

  async showAlertPrompt1(otp) {
    console.log("TCL: RegisterPage -> showAlertPrompt -> otp", otp)
    const alert = await this.alertController.create({
      header: 'OTP',
      inputs: [
        {
          name: 'OTP',
          type: 'text'
        }],
      buttons: [
        {
          text: 'Verify',
          handler: (alertData) => {
            this.loader.present();
            console.log("TCL: RegisterPage -> showAlertPrompt -> alertData", alertData);
            if (alertData.OTP == otp) {
              var data: any;
              if (this.signupResponse.email != undefined) {
                data = { otp: alertData.OTP, user_email: this.signupResponse.email };
              }
              else {
                data = { otp: alertData.OTP, user_email: this.signupResponse.user_email };
              }
              //  console.log('verify params', data);
              this.authService.shareLink(data).subscribe(
                resp => {
                  console.log('verify response', resp);
                  this.otpResp = resp;
                  this.toastService.presentToast(this.otpResp.message);
                  if (this.otpResp.message === 'Account Activated Successfully') {
                    this.loader.dismiss();
                    this.navCtrl.navigateForward('/login');
                  }
                }, err => {
                  this.loader.dismiss();
                  console.log(err);
                }
              );
            }
          }
        },
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            this.router.navigate(["/register"]);
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }
  async showAlertPrompt(otp) {
    const alert = await this.alertController.create({
      header: 'OTP',
      inputs: [
        {
          name: 'OTP',
          type: 'text'
        }],
      buttons: [
        {
          text: 'Verify',
          handler: (alertData) => {
            this.loader.present();
            if (alertData.OTP == otp) {
              var data: any;
              if (this.signupResponse.email != undefined) {
                data = { otp: alertData.OTP, user_email: this.signupResponse.email };
              }
              else {
                data = { otp: alertData.OTP, user_email: this.signupResponse.user_email };
              }
              //     console.log('verify params', data);
              this.authService.shareLink(data).subscribe(
                resp => {
                  console.log('verify response', resp);
                  this.otpResp = resp;
                  this.toastService.presentToast(this.otpResp.message);
                  this.loader.dismiss();
                  if (this.otpResp.message === 'Account Activated Successfully') {
                    this.navCtrl.navigateForward('/business-login');
                  }
                },
                err => {
                  this.loader.dismiss();
                  console.log(err);
                }
              );
            }
          }
        },
        {
          text: "Cancel",
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

  goLoginPage() {
    this.navCtrl.navigateBack('');
  }
}