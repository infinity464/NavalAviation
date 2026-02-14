import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MaintenanceScheduleService } from '../../service/MaintenanceSchedule.service';
import { ConfirmService } from '../../../core/service/confirm.service';
import { SelectedModel } from 'src/app/core/models/selectedModel';
import { MaintenanceSchedule } from '../../models/MaintenanceSchedule';
import { MasterData } from 'src/assets/data/master-data';
import { MaintenanceSubCategoryService } from '../../service/maintenanceSubCategory.service';
import { Role } from 'src/app/core/models/role';
import { AuthService } from 'src/app/core/service/auth.service';
import { count } from 'rxjs';
import {MaintenancePlanningService} from '../../service/MaintenancePlanning.service'

@Component({
  selector: 'app-new-maintenanceschedule',
  templateUrl: './new-maintenanceschedule.component.html',
  styleUrls: ['./new-maintenanceschedule.component.sass']
})
export class NewMaintenanceScheduleComponent implements OnInit {
  pageTitle: string;
  destination: string;
  btnText: string;
  departmentNameId: number;
  maintenanceCategoryId: number;
  maintenanceSubCategoryId: number;
  MaintenanceScheduleForm: FormGroup;
  validationErrors: string[] = [];
  selectedStatus: SelectedModel[];
  selectedDepartmentNames: SelectedModel[];
  selectedAirCraftName: SelectedModel[];
  selectedType: SelectedModel[];
  selectedCategory: SelectedModel[];
  selectedSubCategory: SelectedModel[];
  selectedExtensionValue: SelectedModel[];
  selectedMaintenanceType: SelectedModel[];
  selectedMaintenanceCategoryByDepartment: SelectedModel[];
  selectedMaintenanceTypes1: any;
  allowedExtension: string;
  selectedMaintenancePlanning: SelectedModel[];
  selectedNestInsDateValue: SelectedModel[];

  lastInspectionFH:any;
  lastInspectionOH:any;
  
  deptId:any;
  airCraftId:any;
  mntTypeId:any;
  mntCategoryId:any;
  mntSubCategoryId:any;

  getsubcategoryid: number;
  getmaintenanceplanningid: number;
  getextensionname: string;
  getnextdate: Date;
  maintenanceScheduleList: MaintenanceSchedule[];
  maintenanceScheduleListByRange: any[];
  isShown: boolean = false;
  masterData = MasterData;
  lastInspDate: any;
  nextDate = new Date();

  extentionDays:any;
  getCalculate: any = {};

  userRole = Role;
  
  traineeId:any;
  role:any;
  branchId:any;
  

  displayedColumns: string[] = ['ser', 'airCraftName', 'categoryType', 'category', 'maintenanceDocument', 'actions'];
  paging = {
    pageIndex: this.masterData.paging.pageIndex,
    pageSize: this.masterData.paging.pageSize,
    length: 1
  }
  constructor(private snackBar: MatSnackBar,private MaintenancePlanningService:MaintenancePlanningService,private authService: AuthService, private MaintenanceSubCategoryService: MaintenanceSubCategoryService, private confirmService: ConfirmService, private MaintenanceScheduleService: MaintenanceScheduleService, private fb: FormBuilder, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('maintenanceScheduleId');
    
    this.role = this.authService.currentUserValue.role.trim();
    this.traineeId =  this.authService.currentUserValue.traineeId.trim();
    this.branchId =  this.authService.currentUserValue.branchId.trim();
    console.log(this.role, this.traineeId,  this.branchId)
 
    if (id) {
      this.pageTitle = 'Edit Maintenance Schedule';
      this.destination = "Edit";
      this.btnText = 'Update';
      this.MaintenanceScheduleService.find(+id).subscribe(
        res => {
          this.MaintenanceScheduleForm.patchValue({
            maintenanceScheduleId: res.maintenanceScheduleId,
            maintenancePlanningId: res.maintenancePlanningId,
            airCraftNameId: res.airCraftNameId,
            slNo: res.slNo,
            maintenanceTypeId: res.maintenanceTypeId,
            maintenanceCategoryId: res.maintenanceCategoryId,
            //maintenanceSubCategoryId: res.maintenanceSubCategoryId,
            maintenancePlanningStatusId: res.maintenancePlanningStatusId,
            departmentNameId: res.departmentNameId,
            startInspDate: res.startInspDate,
            endInspDate: res.endInspDate,
            allowedExtension: res.allowedExtension,
            extensionGiven: res.extensionGiven,
            extensionDay: res.extensionDay,
            requiredDay: res.requiredDay,
            maintenanceDocument: res.maintenanceDocument,
            extensionDocument: res.extensionDocument,
            othersDocument: res.othersDocument,
            jobListDocument: res.jobListDocument,
            requiredSpearsDoc: res.requiredSpearsDoc,
            requiredToolsDoc: res.requiredToolsDoc,
            inspCompleteStatus: res.inspCompleteStatus,
            requiredConsumablesDoc: res.requiredConsumablesDoc,
            toleranceDocument: res.toleranceDocument,
            remarks: res.remarks,


          });
          this.onDepartmentNameSelectionChangeGetAirCraftName(),
            //this.onDepartmentNameSelectionChangeGetMaintenanceType(res.departmentNameId),  
            this.onDepartmentNameAndTypeSelectionChangeGetCategory(res.maintenanceTypeId),
            //this.onDepartmentNameAndCategorySelectionChangeGetSubCategory(res.maintenanceCategoryId),  
            //this.onSubCategorySelectionChangeGetExtension(res.maintenanceSubCategoryId),
            this.onLastInsDateelectionChangeGetNestInspDate(res.maintenancePlanningId)
        } 
      );
    } else {
      this.pageTitle = 'Create Maintenance Schedule';
      this.destination = "Add";
      this.btnText = 'Save';
    }
    this.intitializeForm();
    if(this.role != this.userRole.SuperAdmin && this.role != this.userRole.CO){
      this.MaintenanceScheduleForm.get('departmentNameId').setValue(this.branchId);
      this.onDepartmentNameSelectionChangeGetAirCraftName();
    }
    this.getselectedplanningStatus();
    this.GetDepartmentNameById(this.masterData.schoolDept.navalAviation);
    // this.getselectedMaintenanceTypes();
    this.getselectedSubCategory();
  }
  intitializeForm() {
    this.MaintenanceScheduleForm = this.fb.group({
      maintenanceScheduleId: [0],
      maintenancePlanningId: [],
      airCraftNameId: [],
      slNo: [''],
      maintenanceTypeId: [],
      maintenanceCategoryId: [],
      maintenanceSubCategoryId:[],
      maintenancePlanningStatusId: [1],
      departmentNameId: [],
      startInspDate: [''],
      endInspDate: [''],
      allowedExtension: [''],
      extensionGiven: [''],
      extensionDay: [''],
      requiredDay: [''],
      maintenanceDocument: [''],
      doc: [''],
      extensionDocument: [''],
      othersDocument: [''],
      jobListDocument: [''],
      jobList: [''],
      requiredSpearsDoc: [''],
      spearsDoc: [''],
      requiredToolsDoc: [''],
      toolsDoc: [''],
      requiredConsumablesDoc: [''],
      consumableDoc: [''],
      toleranceDocument: [''],
      remarks: [''],
      inspCompleteStatus:[0],
      isActive: [true],

    })
  }
  onFileChanged(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      // this.labelImport.nativeElement.value = file.name;
      console.log(file);
      // this.BIODataGeneralInfoForm.controls["picture"].setValue(event.target.files[0]);
      this.MaintenanceScheduleForm.patchValue({ 
        doc: file,
      });
    }
  }
  onDepartmentNameSelectionChangeGetAirCraftName() {
    var departmentNameId = this.MaintenanceScheduleForm.value['departmentNameId'];
    this.MaintenanceScheduleService.getAirCraftNameByDepartmentNameId(departmentNameId).subscribe(res => {
      this.selectedAirCraftName = res
    });

    this.MaintenanceScheduleService.getMaintenanceTypeByDepartmentNameId(departmentNameId).subscribe((res) => {
      //this.onDepartmentNameSelectionChangeGetAirCraftName(departmentNameId)
      this.selectedMaintenanceType = res;
      console.log(this.selectedMaintenanceType);
    });

  }

  onMaintenanceTypeSelectionChange() {
    var departmentNameId = this.MaintenanceScheduleForm.value["departmentNameId"];
    var maintenanceTypeId = this.MaintenanceScheduleForm.value["maintenanceTypeId"];

    this.MaintenanceSubCategoryService.getMaintenanceCategoryByDepartmentAndType(departmentNameId,maintenanceTypeId).subscribe((res) => {
      this.selectedMaintenanceCategoryByDepartment = res;
      console.log(this.selectedMaintenanceCategoryByDepartment);
    });
  }


  onSubCategoryChangeGetInspDate(){
    this.deptId = this.MaintenanceScheduleForm.value["departmentNameId"];
    this.airCraftId = this.MaintenanceScheduleForm.value["airCraftNameId"];
    this.mntTypeId = this.MaintenanceScheduleForm.value["maintenanceTypeId"];
    this.mntCategoryId = this.MaintenanceScheduleForm.value["maintenanceCategoryId"];
    this.mntSubCategoryId = this.MaintenanceScheduleForm.value["maintenanceSubCategoryId"];

    this.isShown = true;
    console.log("Maintenence category id");
    console.log(this.mntCategoryId);
    // if(this.maintenanceCategoryId == 38){
    //   console.log("FH");
    // }
    // else if(this.maintenanceCategoryId == 37){
    //   console.log("OH");
    // }
    // else{
    //   console.log("CAL");
    // }
    
    this.MaintenanceScheduleService.getMaintenancePlanningByParams(this.deptId,this.airCraftId,this.mntTypeId,this.mntCategoryId,this.mntSubCategoryId).subscribe((res) => {
      // this.selectedSubCategory = res;
      console.log("res...........");
      console.log(res);

   //   else{
        this.lastInspDate = res[0].lastInspDate;
        var maintanencePlanningId = res[0].maintenancePlanningId;      
        this.MaintenanceScheduleForm.get('maintenancePlanningId').setValue(maintanencePlanningId);

        console.log("maintenence planning");
        console.log(maintanencePlanningId);
  
        this.MaintenancePlanningService.find(maintanencePlanningId).subscribe((res) =>{
          this.lastInspectionFH=res.lastInspectionFH;
          this.lastInspectionOH =res.lastInspectionOH;
          console.log("44444444");
          console.log(res);
          // this.extentionDays = res.allowedExtension;
          // this.MaintenanceScheduleService.getMaintenancePlanningListTableByDateRange(maintanencePlanningId,res.totalDaysCount).subscribe((res) =>{
          //   console.log(res);
          //   this.maintenanceScheduleListByRange=res;
          // });
        });

        this.MaintenanceSubCategoryService.find(this.mntSubCategoryId).subscribe((res) =>{
          console.log(res);
          this.extentionDays = res.allowedExtension;
          this.MaintenanceScheduleService.getMaintenancePlanningListTableByDateRange(maintanencePlanningId,res.totalDaysCount).subscribe((res) =>{
            console.log(res);
            this.maintenanceScheduleListByRange=res;
          });
  
        });
    //  }
      // this.nextDate.setDate( this.lastInspDate.getDate() + 30 );
      // console.log(this.lastInspDate , this.nextDate);

      
    });

    // for(var initial = 0; initial <=10; initial+2){
    //   // this.getCalculate = initial;
    //   console.log(initial);
    // }
    

  }

  onMaintenanceCategoryChangeGetSubCategory(){
    var departmentNameId = this.MaintenanceScheduleForm.value["departmentNameId"];
    var maintenanceCategoryId = this.MaintenanceScheduleForm.value["maintenanceCategoryId"];

    this.MaintenanceSubCategoryService.getMaintenanceSubCategoryByDepartmentAndCategory(departmentNameId,maintenanceCategoryId).subscribe((res) => {
      this.selectedSubCategory = res;
      console.log(this.selectedSubCategory);
    });
  }

  onDepartmentNameAndTypeSelectionChangeGetCategory(maintenanceTypeId) {
    this.MaintenanceScheduleService.getCategoryByDepartmentNameIdAndMaintenanceTypeId(maintenanceTypeId).subscribe(res => {
      this.selectedCategory = res
    });
  }
  getselectedSubCategory() {
    
    this.MaintenanceScheduleService.getselectedMaintenancePlanning().subscribe(res => {
      this.selectedSubCategory = res;
      //console.log(res)
    });
  }
  onSubCategorySelectionChangeGetExtension(maintenanceSubCategoryId) {
    this.MaintenanceScheduleService.getAllowedExtensionBySubCategoryId(maintenanceSubCategoryId).subscribe(res => {
      this.selectedExtensionValue = res
      this.getsubcategoryid = this.selectedExtensionValue[0].value,
        this.getextensionname = this.selectedExtensionValue[0].text
        
    });
  }
  onLastInsDateelectionChangeGetNestInspDate(maintenancePlanningId) {
    //var maintenanceSubCategoryId=this.MaintenanceScheduleForm.value['maintenanceSubCategoryId'];
    //this.MaintenanceScheduleForm.get('maintenanceSubCategoryId').setValue(this.maintenanceSubCategoryId);
    //console.log(this.maintenanceSubCategoryId)
    this.MaintenanceScheduleService.getAllowedNestInspDateByMaintenancePlanningId(maintenancePlanningId).subscribe(res => {
      this.selectedNestInsDateValue = res
      this.getmaintenanceplanningid = this.selectedNestInsDateValue[0].value,
        this.getnextdate = this.selectedNestInsDateValue[0].text

      // var departmentNameId=this.MaintenanceScheduleForm.value['departmentNameId'];
      // var maintenanceCategoryId=this.MaintenanceScheduleForm.value['maintenanceCategoryId'];
      // var maintenanceSubCategoryId=this.MaintenanceScheduleForm.value['maintenanceSubCategoryId'];

      // console.log(departmentNameId+"-"+maintenanceCategoryId+"-"+maintenanceSubCategoryId);

      // this.MaintenanceScheduleService.getselectedAllowedExtensionBySubCategoryIdDepartmentIdAndCategoryId(departmentNameId,maintenanceCategoryId,maintenanceSubCategoryId).subscribe(res=>{
      //   this.selectedMaintenanceTypes1=res
      //   console.log("eeeeeee")
      //   console.log(this.selectedMaintenanceTypes1);      
      // });

    });
  }
  //  getselectedAllowedExtensionBySubCategoryIdDepartmentIdAndCategoryId(departmentNameId:number,maintenanceCategoryId:number, maintenanceSubCategoryId:number){
  //   // var departmentNameId=this.MaintenanceScheduleForm.value['departmentNameId'];
  //   // var maintenanceCategoryId=this.MaintenanceScheduleForm.value['maintenanceCategoryId'];
  //   // var maintenanceSubCategoryId=this.MaintenanceScheduleForm.value['maintenanceSubCategoryId'];
  //   //var allowedExtension=this.MaintenanceScheduleForm.value['allowedExtension']
  //   this.MaintenanceScheduleService.getselectedAllowedExtensionBySubCategoryIdDepartmentIdAndCategoryId(departmentNameId,maintenanceCategoryId,maintenanceSubCategoryId).subscribe(res=>{
  //     this.selectedMaintenanceTypes1=res
  //     console.log("eeeeeee")
  //     console.log(this.selectedMaintenanceTypes1);      
  //   });

  // }
  onMaintenanceScheduleListSelectionChange(dropdown) {
    if (dropdown.isUserInput) {
      var departmentNameId = this.MaintenanceScheduleForm.value['departmentNameId'];
      this.MaintenanceScheduleService.maintenanceScheduleListByDepartmentAndAirCraftName(dropdown.source.value, departmentNameId).subscribe(res => {
        this.maintenanceScheduleList = res;
      });

    }
  }
  // getselectedMaintenanceTypes() {
  //   this.MaintenanceScheduleService.getselectedMaintenanceTypes().subscribe(res => {
  //     this.selectedMaintenanceTypes = res
  //   });
  // }
  // getselectedMaintenanceCategorys(){
  //   this.MaintenanceScheduleService.getselectedMaintenanceCategorys().subscribe(res=>{
  //     this.selectedCategorys=res
  //     console.log(this.selectedCategorys);      
  //   });
  // }
  // getselectedMaintenanceSubCategorys(){
  //   this.MaintenanceScheduleService.getselectedMaintenanceSubCategorys().subscribe(res=>{
  //     this.selectedSubCategorys=res
  //     console.log(this.selectedSubCategorys);      
  //   });
  // }
  getselectedplanningStatus() {
    this.MaintenanceScheduleService.getselectedplanningStatus().subscribe(res => {
      this.selectedStatus = res
    });
  }
  // getselectedDepartmentNames() {
  //   this.MaintenanceScheduleService.getselectedDepartmentNames().subscribe(res => {
  //     this.selectedDepartmentNames = res
  //   });
  // }
  GetDepartmentNameById(baseNameId){    
    this.MaintenanceScheduleService.getSelectedSchoolName(baseNameId).subscribe(res=>{
      this.selectedDepartmentNames=res
      console.log(res)
    }); 
  }

  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }
  onSubmit() {
    const id = this.MaintenanceScheduleForm.get('maintenanceScheduleId').value;
    const startInspVal = this.MaintenanceScheduleForm.get('startInspDate').value;
    const endInspVal = this.MaintenanceScheduleForm.get('endInspDate').value;
    this.MaintenanceScheduleForm.get('startInspDate').setValue(
      startInspVal ? new Date(startInspVal).toUTCString() : null
    );
    this.MaintenanceScheduleForm.get('endInspDate').setValue(
      endInspVal ? new Date(endInspVal).toUTCString() : null
    );
    console.log(this.MaintenanceScheduleForm.value)
    const formData = new FormData();
    for (const key of Object.keys(this.MaintenanceScheduleForm.value)) {
      const value = this.MaintenanceScheduleForm.value[key];
      formData.append(key, value == null ? '' : value);
    }


    if (id) {
      this.confirmService.confirm('Confirm Update message', 'Are You Sure Update This  Item?').subscribe(result => {

        if (result) {
          this.MaintenanceScheduleService.update(+id, formData).subscribe(response => {
            this.router.navigateByUrl('/maintenence-planning/maintenanceschedule-list');
            this.snackBar.open('Information Updated Successfully ', '', {
              duration: 2000,
              verticalPosition: 'bottom',
              horizontalPosition: 'right',
              panelClass: 'snackbar-success'
            });
          }, error => {
            this.validationErrors = error;
          })
        }
      })
    }
    else {
      this.MaintenanceScheduleService.submit(formData).subscribe(response => {
        this.router.navigateByUrl('/maintenence-planning/maintenanceschedule-list');
        // this.reloadCurrentRoute();
        this.snackBar.open('Information Inserted Successfully ', '', {
          duration: 2000,
          verticalPosition: 'bottom',
          horizontalPosition: 'right',
          panelClass: 'snackbar-success'
        });
      }, error => {
        this.validationErrors = error;
      })
    }

  }
  deleteItem(row) {
    const id = row.maintenanceScheduleId;
    this.confirmService.confirm('Confirm delete message', 'Are You Sure Delete This Item?').subscribe(result => {
      console.log(result);
      if (result) {
        this.MaintenanceScheduleService.delete(id).subscribe(() => {
          //this.getMaintenanceSchedules();
          this.reloadCurrentRoute();
          this.snackBar.open('Information Deleted Successfully ', '', {
            duration: 2000,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            panelClass: 'snackbar-danger'
          });
        })
      }
    })
  }

}
