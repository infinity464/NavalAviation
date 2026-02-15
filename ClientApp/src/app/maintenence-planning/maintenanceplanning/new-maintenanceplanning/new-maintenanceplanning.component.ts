import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { MaintenancePlanningService } from "../../service/MaintenancePlanning.service";
import { MaintenanceSubCategoryService } from "../../service/maintenanceSubCategory.service";
import { ConfirmService } from "../../../core/service/confirm.service";
import { SelectedModel } from "src/app/core/models/selectedModel";
import { MaintenancePlanning } from "../../models/MaintenancePlanning";
import { MasterData } from "src/assets/data/master-data";
import { Role } from "src/app/core/models/role";
import { AuthService } from "src/app/core/service/auth.service";

@Component({
  selector: "app-new-maintenanceplanning",
  templateUrl: "./new-maintenanceplanning.component.html",
  styleUrls: ["./new-maintenanceplanning.component.sass"],
})
export class NewMaintenancePlanningComponent implements OnInit {
  pageTitle: string;
  fileUrl = "/content/";
  destination: string;
  btnText: string;
  MaintenancePlanningForm: FormGroup;
  validationErrors: string[] = [];
  selectedStatus: SelectedModel[];
  selectedDepartmentNames: SelectedModel[];
  selectedAirCraftName: SelectedModel[];
  selectedType: SelectedModel[];
  selectedCategory: SelectedModel[];
  selectedSubCategory: SelectedModel[];
  selectedExtensionValue: SelectedModel[];
  selectedMaintenanceTypes: SelectedModel[];
  getsubcategoryid: number;
  getextensionname: string;
  maintenancePlanningList: MaintenancePlanning[];
  maintenanceScheduleList: any[];
  countMaintenanceSchedules: any;
  isShown: boolean = false;
  popup = false;
  masterData = MasterData;
  mCategory: any;
  category: any;
  userRole = Role;

  traineeId: any;
  role: any;
  branchId: any;

  displayedColumns: string[] = [
    "ser",
    "airCraftName",
    "categoryType",
    "category",
    "subCategory",
    "jobListDocument",
    "approved",
    "actions",
  ];
  paging = {
    pageIndex: this.masterData.paging.pageIndex,
    pageSize: this.masterData.paging.pageSize,
    length: 1,
  };
  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private confirmService: ConfirmService,
    private MaintenancePlanningService: MaintenancePlanningService,
    private MaintenanceSubCategoryService: MaintenanceSubCategoryService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("maintenancePlanningId");

    this.role = this.authService.currentUserValue.role.trim();
    this.traineeId = this.authService.currentUserValue.traineeId.trim();
    this.branchId = this.authService.currentUserValue.branchId.trim();
    console.log(this.role, this.traineeId, this.branchId);

    if (id) {
      this.pageTitle = "Edit Maintenance Planning";
      this.destination = "Edit";
      this.btnText = "Update";
      this.MaintenancePlanningService.find(+id).subscribe((res) => {
        this.MaintenancePlanningForm.patchValue({
          maintenancePlanningId: res.maintenancePlanningId,
          airCraftNameId: res.airCraftNameId,
          slNo: res.slNo,
          maintenanceTypeId: res.maintenanceTypeId,
          maintenanceCategoryId: res.maintenanceCategoryId,
          maintenanceSubCategoryId: res.maintenanceSubCategoryId,
          maintenancePlanningStatusId: res.maintenancePlanningStatusId,
          departmentNameId: res.departmentNameId,
          reportCalculationDay: res.reportCalculationDay,
          lastInspDate: res.lastInspDate,
          nestInspDate: res.nestInspDate,
          //lastInspectionDay: res.lastInspectionDay,
          //nextInspectionDay:res.nextInspectionDay,
          lastInspectionFH: res.lastInspectionFH,
          nextInspectionFH: res.nextInspectionFH,
          lastInspectionOH: res.lastInspectionOH,
          nextInspectionOH: res.nextInspectionOH,
          extensionGiven: res.extensionGiven,
          extensionDay: res.extensionDay,
          requiredDay: res.requiredDay,
          maintenanceDocument: res.maintenanceDocument,
          extensionDocument: res.extensionDocument,
          othersDocument: res.othersDocument,
          jobListDocument: res.jobListDocument,
          requiredSpearsDoc: res.requiredSpearsDoc,
          requiredToolsDoc: res.requiredToolsDoc,
          requiredConsumablesDoc: res.requiredConsumablesDoc,
          toleranceDocument: res.toleranceDocument,
          verificationCompletStatus: res.verificationCompletStatus,
          //commencingDate: res.commencingDate,
          //plannedCompletionDate: res.plannedCompletionDate,
          remarks: res.remarks,
        });
        this.category = res.maintenanceCategoryId;
        this.onDepartmentNameSelectionChangeGetAirCraftName(),
          //this.onDepartmentNameSelectionChangeGetMaintenanceType(res.departmentNameId),
          this.onDepartmentNameAndTypeSelectionChangeGetCategory(),
          
          this.onDepartmentNameAndCategorySelectionChangeGetSubCategory(
            res.maintenanceCategoryId
          );
        this.onSubCategorySelectionChangeGetExtension(
          res.maintenanceSubCategoryId
        );
      });
    } else {
      this.pageTitle = "Create Maintenance Planning";
      this.destination = "Add";
      this.btnText = "Save";
    }
    this.intitializeForm();
    if (this.role != this.userRole.SuperAdmin) {
      this.MaintenancePlanningForm.get("departmentNameId").setValue(
        this.branchId
      );
      this.onDepartmentNameSelectionChangeGetAirCraftName();
    }
    this.getselectedplanningStatus();
    this.GetDepartmentNameById(this.masterData.schoolDept.navalAviation);
    this.getselectedMaintenanceTypes();
  }
  intitializeForm() {
    this.MaintenancePlanningForm = this.fb.group({
      maintenancePlanningId: [0],
      airCraftNameId: [],
      slNo: [""],
      maintenanceTypeId: [],
      maintenanceCategoryId: [],
      maintenanceSubCategoryId: [],
      maintenancePlanningStatusId: [1],
      departmentNameId: [],
      reportCalculationDay: [null],
      lastInspDate: [],
      nestInspDate: [],
      //lastInspectionDay:[''],
      //nextInspectionDay:[''],
      lastInspectionFH: [""],
      nextInspectionFH: [""],
      lastInspectionOH: [""],
      nextInspectionOH: [""],
      extensionGiven: [true],
      extensionDay: [""],
      requiredDay: [""],
      maintenanceDocument: [""],
      extensionDocument: [""],
      othersDocument: [""],
      jobListDocument: [""],
      jobList: [""],
      requiredSpearsDoc: [""],
      spearsDoc: [""],
      requiredToolsDoc: [""],
      toolsDoc: [""],
      requiredConsumablesDoc: [""],
      consumableDoc: [""],
      toleranceDocument: [""],
      commencingDate: [""],
      plannedCompletionDate: [""],
      verificationCompletStatus: [""],
      remarks: [""],

      isActive: [true],
    });
  }
  // onmCategory(dropdown){

  //   if(dropdown.isUserInput) {
  //     //this.getProcurementsList(dropdown.source.value);
  //     this.mCategory=dropdown.source.value;
  //     console.log(this.mCategory)
  //   }
  // }
  onDepartmentNameSelectionChangeGetAirCraftName() {
    var departmentNameId =
      this.MaintenancePlanningForm.value["departmentNameId"];
    this.MaintenancePlanningService.getAirCraftNameByDepartmentNameId(
      departmentNameId
    ).subscribe((res) => {
      this.selectedAirCraftName = res;
    });
    this.MaintenancePlanningService.getMaintenanceTypeByDepartmentNameId(
      departmentNameId
    ).subscribe((res) => {
      //this.onDepartmentNameSelectionChangeGetAirCraftName(departmentNameId)
      this.selectedType = res;
      console.log(this.selectedType);
    });
  }
  //  onDepartmentNameSelectionChangeGetMaintenanceType(departmentNameId){
  //   this.MaintenancePlanningService.getMaintenanceTypeByDepartmentNameId(departmentNameId).subscribe(res=>{
  //     //this.onDepartmentNameSelectionChangeGetAirCraftName(departmentNameId)
  //     this.selectedType=res
  //   });
  //  }
  onDepartmentNameAndTypeSelectionChangeGetCategory() {
    var departmentNameId = this.MaintenancePlanningForm.value["departmentNameId"];
    var maintenanceTypeId = this.MaintenancePlanningForm.value["maintenanceTypeId"];

    this.MaintenancePlanningService.getCategoryByDepartmentNameIdAndMaintenanceTypeId(departmentNameId,maintenanceTypeId).subscribe((res) => {
      this.selectedCategory = res;
    });
  }
  onDepartmentNameAndCategorySelectionChangeGetSubCategory(
    maintenanceCategoryId
  ) {
    this.MaintenancePlanningService.getCategoryByDepartmentNameIdAndMaintenanceCategoryId(
      maintenanceCategoryId
    ).subscribe((res) => {
      this.selectedSubCategory = res;
    });
  }
  onSubCategorySelectionChangeGetExtension(maintenanceSubCategoryId) {
    this.MaintenancePlanningService.getAllowedExtensionBySubCategoryId(
      maintenanceSubCategoryId
    ).subscribe((res) => {
      this.selectedExtensionValue = res;
      (this.getsubcategoryid = this.selectedExtensionValue[0].value),
        (this.getextensionname = this.selectedExtensionValue[0].text);
      this.calculateNextInspectionDate(maintenanceSubCategoryId);
    });
  }

  /**
   * Parses sub category name (e.g. "12 Months", "3 Month", "Weekly", "5 years", "14 year SSI") and
   * returns the next inspection date by adding the interval to lastDate. Returns null if no pattern matches.
   */
  private getNextInspectionDateFromName(lastDate: Date, subCategoryName: string): Date | null {
    if (!subCategoryName || typeof subCategoryName !== "string") return null;
    const name = subCategoryName.trim().toLowerCase();
    const next = new Date(lastDate.getTime());

    // Weekly or N week(s)
    const weeklyMatch = name.match(/^weekly$/);
    if (weeklyMatch) {
      next.setDate(next.getDate() + 7);
      return next;
    }
    const weeksMatch = name.match(/(\d+)\s*week(s)?/);
    if (weeksMatch) {
      next.setDate(next.getDate() + parseInt(weeksMatch[1], 10) * 7);
      return next;
    }

    // N day(s)
    const daysMatch = name.match(/(\d+)\s*day(s)?/);
    if (daysMatch) {
      next.setDate(next.getDate() + parseInt(daysMatch[1], 10));
      return next;
    }

    // N month(s) - e.g. 3 Month, 6 months, 12 Months, 72 month
    const monthsMatch = name.match(/(\d+)\s*month(s)?/);
    if (monthsMatch) {
      next.setMonth(next.getMonth() + parseInt(monthsMatch[1], 10));
      return next;
    }

    // N year(s) - e.g. 12 Year, 5 years, 14 years, 14 year SSI
    const yearsMatch = name.match(/(\d+)\s*year(s)?/);
    if (yearsMatch) {
      next.setFullYear(next.getFullYear() + parseInt(yearsMatch[1], 10));
      return next;
    }

    return null;
  }

  /**
   * Calculates Next Inspection Date from Last Inspection Date + sub category interval.
   * Uses totalDaysCount from API when > 0; otherwise parses sub category name (e.g. "12 Months", "Weekly", "5 years").
   * Only for date-based categories (2 or 36). User can still change the value manually.
   */
  calculateNextInspectionDate(subCategoryId?: number): void {
    const category = this.category;
    if (category != "2" && category != "36") return;
    const subId = subCategoryId ?? this.MaintenancePlanningForm.get("maintenanceSubCategoryId")?.value;
    const lastInspDate = this.MaintenancePlanningForm.get("lastInspDate")?.value;
    if (!subId || subId === 0 || !lastInspDate) return;
    this.MaintenanceSubCategoryService.find(subId).subscribe((subCat) => {
      const last = new Date(lastInspDate);
      let next: Date | null = null;

      const totalDays = subCat.totalDaysCount ?? 0;
      if (totalDays > 0) {
        next = new Date(last);
        next.setDate(next.getDate() + totalDays);
      } else if (subCat.subCategoryName) {
        next = this.getNextInspectionDateFromName(last, subCat.subCategoryName);
      }

      if (next) {
        this.MaintenancePlanningForm.get("nestInspDate")?.setValue(next, { emitEvent: false });
      }
    });
  }
  onMaintenancePlanningListSelectionChange(dropdown) {
    this.isShown = true;
    if (dropdown.isUserInput) {
      var departmentNameId = this.MaintenancePlanningForm.value["departmentNameId"];
      this.MaintenancePlanningService.maintenancePlanningListByDepartmentAndAirCraftName(dropdown.source.value,departmentNameId).subscribe((res) => {
        this.maintenancePlanningList = res;
        console.log(this.maintenancePlanningList);
        console.log("Planning List 2 AirCraft Select");
      });
      this.getMaintananceScheduleListByParams(departmentNameId,dropdown.source.value,0,0,0);
    }
  }

  getMaintananceScheduleListByParams(departmentNameId,airCraftNameId,maintenanceTypeId,maintenanceCategoryId,maintenanceSubCategoryId){
    console.log(departmentNameId,airCraftNameId,maintenanceTypeId,maintenanceCategoryId,maintenanceSubCategoryId);
    this.countMaintenanceSchedules=0;
    this.MaintenancePlanningService.maintemanceScheduleListByParams(departmentNameId,airCraftNameId,maintenanceTypeId,maintenanceCategoryId,maintenanceSubCategoryId).subscribe((res) => {
      this.maintenanceScheduleList = res;
      this.countMaintenanceSchedules = res.length;
      console.log(this.maintenanceScheduleList);
      console.log("Planning List 3");
      console.log(this.countMaintenanceSchedules);
    });
  }

  getPopup(){
    this.popup = true;
   // this.barcodeId = itemStoreId;
    console.log("popup apairs")
  }
  inCompleteStatusItem(row){
    const id = row.maintenancePlanningId; 
          this.confirmService.confirm('Confirm Approved message', 'Are You Sure Completed This Work?').subscribe(result => {
            if (result) {
              console.log(result)
          this.MaintenancePlanningService.completeMaintenancePlanning(id).subscribe(() => {
            //this.getselectedPresentStocks(this.departmentId);
            this.reloadCurrentRoute();
            this.snackBar.open('Work Completed Successfully ', '', {
              duration: 3000,
              verticalPosition: 'bottom',
              horizontalPosition: 'right',
              panelClass: 'snackbar-success'
            });
          })
        }
      })
    
}
  inActiveItem(row){
    const id = row.maintenancePlanningId; 
          this.confirmService.confirm('Confirm Approved message', 'Are You Sure Approved This Item').subscribe(result => {
            if (result) {
              console.log(result)
          this.MaintenancePlanningService.approvedMaintenancePlanning(id).subscribe(() => {
            //this.getselectedPresentStocks(this.departmentId);
            this.reloadCurrentRoute();
            this.snackBar.open('Information Approved Successfully ', '', {
              duration: 3000,
              verticalPosition: 'bottom',
              horizontalPosition: 'right',
              panelClass: 'snackbar-warning'
            });
          })
        }
      })
    
}
  // onCategory(dropdown){
  //   if(dropdown.isUserInput) {
  //     this.category=dropdown.source.value;
  //     console.log(this.category)
  //   }
  // }

  onMaintenancePlanningLisByTypetSelectionChange(dropdown) {
    this.isShown = true;
    if (dropdown.isUserInput) {
      var airCraftNameId = this.MaintenancePlanningForm.value["airCraftNameId"];
      var departmentNameId =
        this.MaintenancePlanningForm.value["departmentNameId"];
      this.MaintenancePlanningService.maintenancePlanningListByDepartmentAndAirCraftNameAndType(dropdown.source.value,airCraftNameId,departmentNameId).subscribe((res) => {
        this.maintenancePlanningList = res;
        console.log(this.maintenancePlanningList);
        console.log(res)
        console.log("Planning List 1");
      });
      this.getMaintananceScheduleListByParams(departmentNameId,airCraftNameId,dropdown.source.value,0,0);
    }
  }
  onMaintenancePlanningLisByTypeAndCategorytSelectionChange(dropdown) {
    this.isShown = true;
    if (dropdown.isUserInput) {
      var maintenanceTypeId =
        this.MaintenancePlanningForm.value["maintenanceTypeId"];
      var airCraftNameId = this.MaintenancePlanningForm.value["airCraftNameId"];
      var departmentNameId =
        this.MaintenancePlanningForm.value["departmentNameId"];
      this.MaintenancePlanningService.maintenancePlanningListByDepartmentAndAirCraftNameAndTypeAndCategory(dropdown.source.value,departmentNameId,airCraftNameId,maintenanceTypeId).subscribe((res) => {
        this.maintenancePlanningList = res;
        console.log(this.maintenancePlanningList);
      });
      this.getMaintananceScheduleListByParams(departmentNameId,airCraftNameId,maintenanceTypeId,dropdown.source.value,0);
    }
    if (dropdown.isUserInput) {
      this.category = dropdown.source.value;
      console.log(this.category);
    }
    // if(dropdown.isUserInput) {
    //   //this.getProcurementsList(dropdown.source.value);
    //   this.mCategory=dropdown.source.value;
    //   console.log(this.mCategory)
    // }
  }
  onMaintenancePlanningLisByTypeAndCategoryAndSubCategorytSelectionChange(dropdown) {
    this.isShown = true;
    if (dropdown.isUserInput) {
      var maintenanceCategoryId = this.MaintenancePlanningForm.value["maintenanceCategoryId"];
      var maintenanceTypeId = this.MaintenancePlanningForm.value["maintenanceTypeId"];
      var airCraftNameId = this.MaintenancePlanningForm.value["airCraftNameId"];
      var departmentNameId = this.MaintenancePlanningForm.value["departmentNameId"];
      this.MaintenancePlanningService.maintenancePlanningListByDepartmentAndAirCraftNameAndTypeAndCategoryAndSubCategory(dropdown.source.value,maintenanceCategoryId,maintenanceTypeId,airCraftNameId,departmentNameId).subscribe((res) => {
        this.maintenancePlanningList = res;
        console.log("by sub cat")
        console.log(res)
      });
      this.getMaintananceScheduleListByParams(departmentNameId,airCraftNameId,maintenanceTypeId,maintenanceCategoryId,dropdown.source.value);
    }
  }
  // getselectedAirCraftNames(){
  //   this.MaintenancePlanningService.getselectedAirCraftNames().subscribe(res=>{
  //     this.selectedAirCraftNames=res
  //     console.log(this.selectedAirCraftNames);
  //   });
  // }
  getselectedMaintenanceTypes() {
    this.MaintenancePlanningService.getselectedMaintenanceTypes().subscribe(
      (res) => {
        this.selectedMaintenanceTypes = res;
        console.log(this.selectedMaintenanceTypes);
      }
    );
  }
  // getselectedMaintenanceCategorys(){
  //   this.MaintenancePlanningService.getselectedMaintenanceCategorys().subscribe(res=>{
  //     this.selectedCategorys=res
  //     console.log(this.selectedCategorys);
  //   });
  // }
  // getselectedMaintenanceSubCategorys(){
  //   this.MaintenancePlanningService.getselectedMaintenanceSubCategorys().subscribe(res=>{
  //     this.selectedSubCategorys=res
  //     console.log(this.selectedSubCategorys);
  //   });
  // }
  getselectedplanningStatus() {
    this.MaintenancePlanningService.getselectedplanningStatus().subscribe(
      (res) => {
        this.selectedStatus = res;
      }
    );
  }
  // getselectedDepartmentNames(){
  //   this.MaintenancePlanningService.getselectedDepartmentNames().subscribe(res=>{
  //     this.selectedDepartmentNames=res
  //   });
  // }
  GetDepartmentNameById(baseNameId) {
    this.MaintenancePlanningService.getSelectedSchoolName(baseNameId).subscribe(
      (res) => {
        this.selectedDepartmentNames = res;
        console.log(res);
      }
    );
  }
  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }
  onFileChanged(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log(file);
      this.MaintenancePlanningForm.patchValue({
        jobList: file,
      });
    }
  }
  onSpearsDocFileChanged(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log(file);
      this.MaintenancePlanningForm.patchValue({
        spearsDoc: file,
      });
    }
  }
  onToolsDocFileChanged(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log(file);
      this.MaintenancePlanningForm.patchValue({
        toolsDoc: file,
      });
    }
  }
  onConsumableDocFileChanged(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log(file);
      this.MaintenancePlanningForm.patchValue({
        consumableDoc: file,
      });
    }
  }
  deleteItem(row) {
    const id = row.maintenancePlanningId;
    this.confirmService
      .confirm("Confirm delete message", "Are You Sure Delete This Item?")
      .subscribe((result) => {
        console.log(result);
        if (result) {
          this.MaintenancePlanningService.delete(id).subscribe(() => {
            this.reloadCurrentRoute();
            //this.getMaintenancePlannings();
            this.snackBar.open("Information Deleted Successfully ", "", {
              duration: 2000,
              verticalPosition: "bottom",
              horizontalPosition: "right",
              panelClass: "snackbar-danger",
            });
          });
        }
      });
  }
  onSubmit() {
    const id = this.MaintenancePlanningForm.get("maintenancePlanningId").value;
    console.log(this.MaintenancePlanningForm);
    const lastInspVal = this.MaintenancePlanningForm.get("lastInspDate").value;
    const nestInspVal = this.MaintenancePlanningForm.get("nestInspDate").value;
    this.MaintenancePlanningForm.get("lastInspDate").setValue(
      lastInspVal ? new Date(lastInspVal).toUTCString() : null
    );
    this.MaintenancePlanningForm.get("nestInspDate").setValue(
      nestInspVal ? new Date(nestInspVal).toUTCString() : null
    );
    // this.MaintenancePlanningForm.get('commencingDate').setValue((new Date(this.MaintenancePlanningForm.get('commencingDate').value)).toUTCString());
    // this.MaintenancePlanningForm.get('plannedCompletionDate').setValue((new Date(this.MaintenancePlanningForm.get('plannedCompletionDate').value)).toUTCString());
    console.log(this.MaintenancePlanningForm.value);
    const formData = new FormData();
    for (const key of Object.keys(this.MaintenancePlanningForm.value)) {
      const value = this.MaintenancePlanningForm.value[key];
      // Send empty string for null/undefined so API accepts nullable fields (e.g. ReportCalculationDay)
      formData.append(key, value == null ? '' : value);
    }

    if (id) {
      this.confirmService
        .confirm("Confirm Update message", "Are You Sure Update This  Item?")
        .subscribe((result) => {
          if (result) {
            this.MaintenancePlanningService.update(+id, formData).subscribe(
              (response) => {
                this.router.navigateByUrl(
                  "/maintenence-planning/add-maintenanceplanning"
                );
                this.snackBar.open("Information Updated Successfully ", "", {
                  duration: 2000,
                  verticalPosition: "bottom",
                  horizontalPosition: "right",
                  panelClass: "snackbar-success",
                });
              },
              (error) => {
                this.validationErrors = error;
              }
            );
          }
        });
    } else {
      this.MaintenancePlanningService.submit(formData).subscribe(
        (response) => {
          //this.router.navigateByUrl('/maintenence-planning/maintenanceplanning-list');
          this.reloadCurrentRoute();
          this.snackBar.open("Information Inserted Successfully ", "", {
            duration: 2000,
            verticalPosition: "bottom",
            horizontalPosition: "right",
            panelClass: "snackbar-success",
          });
        },
        (error) => {
          this.validationErrors = error;
        }
      );
    }
  }
}
