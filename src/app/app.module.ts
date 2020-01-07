import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Auth } from '../auth';
// import * as firebase from 'firebase';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ModalPagePageModule } from './pages/modal-page/modal-page.module';
import { AirportModalPageModule } from './pages/airport-modal/airport-modal.module';
// import { environment } from '../environments/environment';
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network/ngx';
import { ChartsModule } from 'ng2-charts';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
// import { IonicRatingModule } from 'ionic-rating';
import { HttpClientModule } from '@angular/common/http';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { GeojsonService } from './services/geojson.service';
import { BusinessGuardService } from './guards/business-guard.service';
import { TravellerGuardService } from './guards/traveler-guard.service';
import { Camera } from '@ionic-native/camera/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule,
    IonicModule.forRoot({swipeBackEnabled: false}),
    AppRoutingModule,
    // IonicRatingModule,
    HttpClientModule,
    ModalPagePageModule,
    AirportModalPageModule,
    // AngularFireModule.initializeApp({
    //   apiKey: 'AIzaSyDv31XmAuUh-feu6ZStP21X10Dmkr5N6KA',
    //   authDomain: 'skyviews-8a2e1.firebaseapp.com',
    //   databaseURL: 'https://skyviews-8a2e1.firebaseio.com',
    //   projectId: 'skyviews-8a2e1',
    //   storageBucket: 'skyviews-8a2e1.appspot.com',
    //   messagingSenderId: '742370383479',
    //   appId: '1:742370383479:web:7787301a4c30ee23'
    // }),
    ChartsModule,
    IonicStorageModule.forRoot(),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    GeojsonService,
    Network,
    InAppBrowser,
    CallNumber,
    SQLite,
    Auth,
    BusinessGuardService,
    TravellerGuardService,
    Camera,
    SocialSharing,
    EmailComposer,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
