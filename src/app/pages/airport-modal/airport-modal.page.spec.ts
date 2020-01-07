import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportModalPage } from './airport-modal.page';

describe('AirportModalPage', () => {
  let component: AirportModalPage;
  let fixture: ComponentFixture<AirportModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirportModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirportModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
