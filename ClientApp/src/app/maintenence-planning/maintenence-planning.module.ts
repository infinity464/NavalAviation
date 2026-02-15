import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MaintenecePlanningRoutingModule } from "./maintenence-planning-routing.module";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatStepperModule } from "@angular/material/stepper";
import { MatDatepickerModule } from "@angular/material/datepicker";
import {
  NativeDateAdapter,
  DateAdapter,
  MAT_DATE_FORMATS,
  MatNativeDateModule,
} from "@angular/material/core";
import { MaterialFileInputModule } from "ngx-material-file-input";
import { HttpClientModule } from "@angular/common/http";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatAutocompleteModule } from "@angular/material/autocomplete";

import { MaintenanceTypeListComponent } from "./maintenancetype/maintenancetype-list/maintenancetype-list.component";
import { NewMaintenanceTypeComponent } from "./maintenancetype/new-maintenancetype/new-maintenancetype.component";
import { MaintenanceScheduleListComponent } from "./maintenanceschedule/maintenanceschedule-list/maintenanceschedule-list.component";
import { NewMaintenancePlanningComponent } from "./maintenanceplanning/new-maintenanceplanning/new-maintenanceplanning.component";
import { MaintenanceCategoryListComponent } from "./maintenancecategory/maintenancecategory-list/maintenancecategory-list.component";
import { NewMaintenanceCategoryComponent } from "./maintenancecategory/new-maintenancecategory/new-maintenancecategoryr.component";
import { MaintenanceSubCategoryListComponent } from "./maintenancesubcategory/maintenancesubcategory-list/maintenancesubcategory-list.component";
import { NewMaintenanceSubCategoryComponent } from "./maintenancesubcategory/new-maintenancesubcategory/new-maintenancesubcategory.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NewMaintenanceScheduleComponent } from "./maintenanceschedule/new-maintenanceschedule/new-maintenanceschedule.component";
import { MeaSquadronStateListComponent } from "./measquadronstate/measquadronstate-list/measquadronstate-list.component";
import { NewMeaSquadronStateComponent } from "./measquadronstate/new-measquadronstate/new-measquadronstate.component";
import { CallibrationStateListComponent } from "./callibrationstate/callibrationstate-list/callibrationstate-list.component";
import { NewCallibrationStateComponent } from "./callibrationstate/new-callibrationstate/new-callibrationstate.component";
import { ViewMaintenancePlanningComponent } from "./maintenanceplanning/view-maintenanceplanning/view-maintenanceplanning.component";
import { NewDailyAirworthinessFromCategoryComponent } from "./dailyairworthinessfromcategory/new-dailyairworthinessfromcategory/new-dailyairworthinessfromcategory.component";
import { NewDailyAirworthinessFromComponent } from "./dailyairworthinessfrom/new-dailyairworthinessfrom/new-dailyairworthinessfrom.component";
import { NewDailyAirworthinessRecordFromComponent } from "./dailyairworthinessfrom/new-dailyairworthinesrecordsfrom/new-new-dailyairworthinesrecordsfrom.component";
import { NewRequiredSparesForMaintenanceComponent } from './requiredsparesformaintenance/new-requiredsparesformaintenance/new-requiredsparesformaintenance.component';
import {MaintainenceStateListComponent} from './maintainencestate/maintainencestate-list/maintainencestate-list.component';
import {MaintainenceStateViewListComponent} from './maintainencestate/maintainencestateview-list/maintainencestateview-list.component'

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Custom adapter so datepicker displays DD MMM YYYY (e.g. 01 Feb 2026) */
export class MaintenanceDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: object | string): string {
    if (displayFormat === "input") {
      const day = date.getDate().toString().padStart(2, "0");
      const month = MONTH_NAMES[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    }
    return date.toDateString();
  }
  parse(value: any): Date | null {
    if (typeof value === "string") {
      const parts = value.trim().split(/\s+/);
      if (parts.length >= 3) {
        const day = parseInt(parts[0], 10);
        const monthStr = parts[1];
        const year = parseInt(parts[2], 10);
        const month = MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthStr.toLowerCase());
        if (!isNaN(day) && month >= 0 && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
    }
    return super.parse(value);
  }
}

/** Date display/parse format: DD MMM YYYY (e.g. 01 Feb 2026) */
export const MAINTENANCE_DATE_FORMATS = {
  parse: { dateInput: "dd MMM yyyy" },
  display: {
    dateInput: "input",
    monthYearLabel: "MMM yyyy",
    dateA11yLabel: "dd MMM yyyy",
    monthYearA11yLabel: "MMMM yyyy",
  },
};

@NgModule({
  declarations: [
    MaintenanceTypeListComponent,
    NewMaintenanceTypeComponent,
    MaintenanceScheduleListComponent,
    NewMaintenancePlanningComponent,
    MaintenanceCategoryListComponent,
    NewMaintenanceCategoryComponent,
    MaintenanceSubCategoryListComponent,
    NewMaintenanceSubCategoryComponent,
    NewMaintenanceScheduleComponent,
    MeaSquadronStateListComponent,
    NewMeaSquadronStateComponent,
    CallibrationStateListComponent,
    NewCallibrationStateComponent,
    ViewMaintenancePlanningComponent,
    NewDailyAirworthinessFromCategoryComponent,
    NewDailyAirworthinessFromComponent,
    NewDailyAirworthinessRecordFromComponent,
    NewRequiredSparesForMaintenanceComponent,
    MaintainenceStateListComponent,
    MaintainenceStateViewListComponent
  ],
  imports: [
    CommonModule,
    MaintenecePlanningRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MaterialFileInputModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatTooltipModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: MaintenanceDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAINTENANCE_DATE_FORMATS },
  ],
})
export class MaintenecePlanningModule {}
