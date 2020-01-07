import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, Events } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToastService } from 'src/app/services/toast.service';
import { NetworkService } from '../../../services/network.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.page.html',
  styleUrls: ['./comments.page.scss'],
})
export class CommentsPage implements OnInit {
  userId: any;
  placeId: any;
  placeTitle: any;
  comment: any;
  comments: any = [];
  approvedComments: any = [];
  connected: boolean;
  ntwrkSubscription;
  constructor(
    public toast: ToastService,
    public loader: LoaderService,
    private route: ActivatedRoute,
    public api: ApiService,
    private alertCtrl: AlertController,
    public events: Events,
    private ntwrkService: NetworkService
  ) {
    // this.networkSubscription();
   }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log(params);
      this.userId = params["id"];
      this.placeId = params['place_id'];
      this.placeTitle = params['place_title'];
    });
    this.getComments();
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

  async retryConnection(params, option){
    const alert = await this.alertCtrl.create({
      header: params.header,
      message:params.message,
      buttons: [
        {
          text: "Retry",
          handler: () => {
            if (option == 'retry'){
                if (this.connected == false){
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
  
  sendComment() {
    console.log('comment is: ', this.comment);
    if (this.comment != undefined && this.comment != ' ') {
      console.log('comment is: ', this.comment.length);
      this.api.sendComment(this.userId, this.placeId, this.comment, this.placeTitle).subscribe(res => {
        console.log(res);
        this.getComments();
        this.comment = '';
      }, err => {
        console.log(err);
      });
    }
    else {
      this.toast.presentToast('Add some comment!');
    }
  }

  getComments() {
    this.comments = [];
    this.api.getAllComments(this.userId, this.placeId).subscribe((res:any) => {
      console.log('all comments for a place', res);
      if(res.message != 'Comments not found.') {
        this.comments = res;
      } else {
        this.comments = [];
      }
      //this.comments = res;
      console.log('Available comments', this.comments);
    });
  }

  deleteComment(commentid) {
    const params = {message:'This will delete your comment!', commentid: commentid}
    const option = 'delete';
    this.presentAlertConfirm(params, option);
    //console.log("TCL: CommentsPage -> deleteComment -> commentid", commentid);
    //console.log('deleteComment');
    
  }

  async presentAlertConfirm(params, option) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: params.message,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: clicked');
          }
        }, {
          text: 'Yes',
          handler: () => {
            if (option == 'delete'){
              this.loader.present();
              this.api.deleteComment(params.commentid).subscribe((resp:any) => {
                console.log(resp);
                if (resp.message == 'Comment removed successfully.') {
                  this.toast.presentToast(resp.message);
                  this.getComments();
                  this.loader.dismiss();
                } else {
                  this.toast.presentToast('Unable to delete comment, Please try again!');
                  this.loader.dismiss();
                }
              }, err => {
                console.log(err);
                this.loader.dismiss();
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
