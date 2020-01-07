import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, first } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  url = 'http://ec2-34-207-105-29.compute-1.amazonaws.com/skyviews/wp-api/skyview-api.php?action=';
  // http://ec2-34-207-105-29.compute-1.amazonaws.com/skyviews/wp-api/skyview-api.php?action=my_requests
  // url = 'http://moderni-projects.in/projects/wordpress/skyviews/wp-api/skyview-api.php?action=';
  constructor(private http: HttpClient) { }

  getApiResponse(category) {
    console.log(category)
    return new Promise((resolve, reject) => {
      this.http.get(this.url + category).pipe(first()).subscribe(
        resp => {
          // console.log("TCL: ApiService -> getApiResponse -> resp", resp)
          resolve(resp);
        },
        error => {
          this.handleError(error);
          reject(error);
        }
      );
    });
  }

  // PLAN MY TRIP START
  getPrices(data) {
    // {origin:'',dest:'',depDate:'',oneWay:''}
    return this.http.get('http://min-prices.aviasales.ru/calendar_preload?origin=' + data.origin + '&destination=' + data.dest + '&depart_date=' + data.depDate + '&one_way=' + data.oneWay).pipe(catchError(this.handleError));
  }

  getNearestAirportByCoordinates(data) {
    // {lat:'',lng:''}
    return this.http.get('http://nano.aviasales.ru/places/coords_to_places_en.json?coords=' + data.lat + ',' + data.lng).pipe(catchError(this.handleError));
  }

  searchAirport(data) {
    // {string:''}
    return this.http.get('http://nano.aviasales.ru/places_en?term=' + data.string).pipe(catchError(this.handleError));
  }

  getCurencyValues() {
    // http://yasen.aviasales.ru/adaptors/currency.json
    return this.http.get('http://yasen.aviasales.ru/adaptors/currency.json').pipe(catchError(this.handleError));
  }
  //PLAN MY TRIP END

  sendComment(userid, placeid, comment, title) {
    const postData = new FormData();
    postData.append('user_id', userid);
    postData.append('place_id', placeid);
    postData.append('comment', comment);
    postData.append('title', title);
    return this.http.post(this.url + 'add_comment', postData).pipe(catchError(this.handleError));
  }

  deleteComment(commentId) {
    let postData = new FormData();
    postData.append('comment_id', commentId);
    return this.http.post(this.url + 'delete_comment', postData).pipe(catchError(this.handleError));
  }

  likePlace(userid, placeid, action) {
    let postData = new FormData();
    postData.append('user_id', userid);
    postData.append('place_id', placeid);
    postData.append('user_action', action);
    return this.http.post(this.url + 'like_functionality', postData).pipe(catchError(this.handleError));
  }

  getAllComments(userid, placeId) {
    let postData = new FormData();
    postData.append('user_id', userid);
    postData.append('place_id', placeId);
    return this.http.post(this.url + 'show_user_comments', postData).pipe(catchError(this.handleError));
  }

  getPlacesWithinTwoMiles(placeId) {
    let postData = new FormData();
    postData.append('place_id', placeId);
    return this.http.post(this.url + 'within_two_miles', postData).pipe(catchError(this.handleError));
  }

  getCategoryHotels(categoryId) {
    console.log("TCL: ApiService -> getCategoryHotels -> categoryId", categoryId)
    let postData = new FormData();
    postData.append('category_id', categoryId);
    return this.http.post(this.url + 'get_category_hotels', postData).pipe(catchError(this.handleError));
  }

  getSearchPlaces(search) {
    console.log("TCL: ApiService -> getSearchPlaces -> search", search);
    let postData = new FormData();
    postData.append('search', search);
    return this.http.post(this.url + 'get_cat_listing', postData).pipe(catchError(this.handleError));
  }

  savePlace(userId, placeId) {
    console.log("TCL: ApiService -> savePlace -> userId, placeId", userId, placeId)
    let postData = new FormData();
    postData.append('user_id', userId);
    postData.append('place_id', placeId);
    return this.http.post(this.url + 'save_place', postData).pipe(catchError(this.handleError));
  }

  removeSavedPlace(placeId, userId) {
    let postData = new FormData();
    postData.append('place_id', placeId);
    postData.append('user_id', userId);
    return this.http.post(this.url + 'remove_place', postData).pipe(catchError(this.handleError));
  }

  getSavedPlaces(place) {
    console.log("TCL: ApiService -> getSavedPlaces -> place", place)
    let postData = new FormData();
    postData.append('user_id', place);
    return this.http.post(this.url + 'my_places', postData).pipe(catchError(this.handleError));
  }

  addBusinessUser(data) {
    console.log(JSON.stringify(data));
    const postData = new FormData();
    postData.append('establishment_name', data.establishment_name);
    postData.append('establishment_description', data.establishment_description);
    postData.append('user_id', data.user_id);
    postData.append('loc_lat', data.loc_lat);
    postData.append('loc_lng', data.loc_lng);
    postData.append('tollfree_phoneno', data.tollfree_phoneno);
    postData.append('mobile_no1', data.mobile_no1);
    postData.append('mobile_no2', data.mobile_no2);
    postData.append('establishment_phoneno', data.establishment_phoneno);
    postData.append('establishment_email', data.establishment_email);
    postData.append('fb_url', data.fb_url);
    postData.append('twitter_url', data.twitter_url);
    postData.append('instagram_url', data.instagram_url);
    postData.append('tripadvisor_url', data.tripadvisor_url);
    postData.append('book_now_url', data.book_now_url);
    postData.append('star_rating', data.star_rating);
    postData.append('business_type', data.business_type);
    postData.append('free_wifi', data.free_wifi);
    postData.append('establishment_website_url', data.establishment_website_url);
    postData.append('establishment_charges_daily', data.establishment_charges_daily);
    postData.append('categories_check', data.categories_check);
    postData.append('avatars_check', data.avatars_check);
    postData.append('preferences_check', data.preferences_check);
    postData.append('logo_img', data.logo_img);
    postData.append('display_img', data.display_img);
    if (data.gallery_images != undefined) {
      for (let i = 0; i < data.gallery_images.length; i++) {
        postData.append("gallery_images[]", data.gallery_images[i]);
      }
    }
    //postData.append('gallery_images',JSON.stringify(data.gallery_images));
    console.log(postData);
    return this.http.post(this.url + 'add_location', postData).pipe(catchError(this.handleError));
  }

  updateBusinessUser(data) {
    console.log(data);
    const postData = new FormData();
    postData.append('establishment_name', data.establishment_name);
    postData.append('establishment_description', data.establishment_description);
    postData.append('user_id', data.user_id);
    postData.append('loc_lat', data.loc_lat);
    postData.append('loc_lng', data.loc_lng);
    postData.append('tollfree_phoneno', data.tollfree_phoneno);
    postData.append('mobile_no1', data.mobile_no1);
    postData.append('mobile_no2', data.mobile_no2);
    postData.append('establishment_phoneno', data.establishment_phoneno);
    postData.append('establishment_email', data.establishment_email);
    postData.append('fb_url', data.fb_url);
    postData.append('twitter_url', data.twitter_url);
    postData.append('instagram_url', data.instagram_url);
    postData.append('tripadvisor_url', data.tripadvisor_url);
    postData.append('book_now_url', data.book_now_url);
    postData.append('star_rating', data.star_rating);
    postData.append('business_type', data.business_type);
    postData.append('free_wifi', data.free_wifi);
    postData.append('establishment_website_url', data.establishment_website_url);
    postData.append('establishment_charges_daily', data.establishment_charges_daily);
    postData.append('categories_check', data.categories_check);
    postData.append('avatars_check', data.avatars_check);
    postData.append('preferences_check', data.preferences_check);
    postData.append('logo_img', data.logo_img);
    postData.append('display_img', data.display_img);
    postData.append('removeImg', data.removeImg);
    postData.append('place_id', data.place_id);
    // if (data.removeImg != undefined) {
    //   for (let i = 0; i < data.removeImg.length; i++) {
    //     postData.append("removeImg[]", data.removeImg[i]);
    //   }
    // }
    if (data.gallery_images != undefined) {
      for (let i = 0; i < data.gallery_images.length; i++) {
        postData.append("gallery_images[]", data.gallery_images[i]);
      }
    }
    console.log(data);
    return this.http.post(this.url + 'update_location', postData).pipe(catchError(this.handleError));
  }

  listBusinesses(data) {
    const postData = new FormData();
    postData.append('user_id', data.user_id);
    return this.http.post(this.url + 'my_requests', postData).pipe(catchError(this.handleError));
  }

  editBusiness(data) {
    console.log(data);
  }

  switchRole(data) {
    const postData = new FormData();
    postData.append('user_role', data.user_role);
    postData.append('user_password', data.user_password);
    postData.append('user_email', data.user_email);
    return this.http.post(this.url + 'switch_role', postData).pipe(catchError(this.handleError));
  }

  deleteBusiness(data) {
    const postData = new FormData();
    postData.append('place_id', data.place_id);
    return this.http.post(this.url + 'delete_location', postData).pipe(catchError(this.handleError));
  }

  getCategoryIdByAvtarPrefrence(avtarId, preferenceIds, island) {
    //  console.log('api service => getCategoryIdByAvtarPrefrence => avtar', avtarId,'preference =>', preferenceIds);
    const postData = new FormData();
    postData.append('selected_avatar', avtarId);
    postData.append('selected_preferences', preferenceIds);
    postData.append('on_island', island);
    return this.http.post(this.url + 'get_cat_listing', postData).pipe(catchError(this.handleError));
    //return this.http.post(this.url + 'get_cat_properties', postData).pipe(catchError(this.handleError));
  }

  getTravellerDetails(userId) {
    let postData = new FormData();
    postData.append('user_id', userId);
    return this.http.post(this.url + 'login_traveler_details', postData).pipe(catchError(this.handleError));
  }

  getPlaceDetails(placeId, userId) {
    let postData = new FormData();
    if (userId != '') {
      postData.append('user_id', userId);
    }
    console.log('TCL: ApiService -> getPlaceDetails -> placeId, userId', placeId, userId);
    postData.append('place_id', placeId);
    return this.http.post(this.url + 'get_single_hotel', postData).pipe(catchError(this.handleError));
  }

  postUpdatedTravellerDetails(userPofile) {
    console.log('TCL: ApiService -> postUpdatedTravellerDetails -> userPofile', userPofile);
    let postData = new FormData();
    postData.append('user_id', userPofile.user_id);
    postData.append('fullname', userPofile.fullname);
    // postData.append('address', userPofile.address);
    postData.append('address', '');
    postData.append('mobile', userPofile.mobile);
    postData.append('profilepic', userPofile.profilepic);
    postData.append('avatars', userPofile.avatars);
    postData.append('preferences', userPofile.preferences);
    postData.append('age', userPofile.age);
    postData.append('gender', userPofile.gender);
    postData.append('country_of_origin', userPofile.country_of_origin);
    postData.append('budget_per_day', userPofile.budget_per_day);
    postData.append('city', userPofile.city);
    return this.http.post(this.url + 'update_traveler_profile', postData).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${JSON.stringify(error.status)}, ` +
        `body was: ${JSON.stringify(error.error)}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      // 'Something bad happened; please try again later.',
      error);
  }

}
