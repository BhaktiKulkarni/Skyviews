import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanoramicImgViewPage } from './panoramic-img-view.page';

describe('PanoramicImgViewPage', () => {
  let component: PanoramicImgViewPage;
  let fixture: ComponentFixture<PanoramicImgViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanoramicImgViewPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanoramicImgViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
