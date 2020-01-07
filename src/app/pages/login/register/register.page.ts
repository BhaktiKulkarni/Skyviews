import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, AlertController, Events } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { async } from 'q';
import { ToastService } from 'src/app/services/toast.service';
import { LoaderService } from 'src/app/services/loader.service';
//import { AuthenticationService } from 'src/app/services/authentication.service';
import { NetworkService } from '../../../services/network.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  validations_form: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  signupResponse: any;
  otpResp: any;

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
  connected: boolean;
  ntwrkSubscription;
  constructor(
    public router: Router,
    private navCtrl: NavController,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    public toastService: ToastService,
    private alertController: AlertController,
    public loader: LoaderService,
    public events: Events,
    private ntwrkService: NetworkService
  ) {
    // this.networkSubscription();

  }

  ngOnInit() {
    this.validations_form = this.formBuilder.group({
      user_email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')
      ])),
      user_password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9!@#$&()-`.+,/]*$')
      ])),
      fullname: new FormControl('', Validators.compose([
        Validators.required,
      ])),
    });
    this.ntwrkServiceSubscription();
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

  ionViewWillLeave() {
    this.ntwrkSubscription.unsubscribe(() => {
      console.log('unsubscribed');
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

  tryRegisterb(value) {
    value.role = 'business';
    console.log("TCL: BusinessRegistrationPage -> tryRegister -> value", value);
    this.authService.userSignup(value).subscribe(
      (resp) => {
        this.signupResponse = resp;
        console.log('try register resp', this.signupResponse);
        // console.log('OTP', this.signupResponse.otp);
        if (this.signupResponse.message === 'OTP Sent to your mail.') {
          this.showAlertPrompt(this.signupResponse.otp);
          this.toastService.presentToast(this.signupResponse.message);
        }
        else if (this.signupResponse.message === 'Do you really want to be a business user account?') {
          this.yesnoalert(value);
        }
        else {
          this.toastService.presentToast(this.signupResponse.message);
        }
      }, err => {
        // console.log('try register err', err);
      }
    );
  }

  tryRegister(value) {
    this.loader.present();
    value.role = 'traveler';
    console.log("TCL: RegisterPage -> tryRegister -> value", value);
    this.authService.userSignup(value).subscribe(
      (resp) => {
        this.signupResponse = resp;
        if (this.signupResponse.otp != undefined) {
          this.otp = this.signupResponse.otp;
        }
        console.log('try register resp', this.signupResponse);
        // console.log('OTP', this.signupResponse.otp);
        if (this.signupResponse.message === 'Check email to verify your account.') {
          this.loader.dismiss();
          this.showAlertPrompt(this.signupResponse.otp);
          this.toastService.presentToast(this.signupResponse.message);
        }
        else if (this.signupResponse.message === 'Do you really want to sigpup as traveller?') {
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
            this.authService.switchUserRoles(value.user_email, value.user_password, value.role).subscribe((res: any) => {
              console.log(res);
              this.toastService.presentToast(res.message);
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

  async showAlertPrompt(otp) {
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
                  this.loader.dismiss();
                  if (this.otpResp.message === 'Account Activated Successfully') {
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

  goLoginPage() {
    this.navCtrl.navigateBack('');
  }
}
