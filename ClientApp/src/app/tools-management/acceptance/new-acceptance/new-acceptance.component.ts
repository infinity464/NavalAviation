import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { AcceptanceService } from "../../service/Acceptance.service";
import { ProcurementService } from "../../service/Procurement.service";
import { DemandService } from "../../service/Demand.service";
import { ConfirmService } from "../../../core/service/confirm.service";
import { SelectedModel } from "src/app/core/models/selectedModel";
import { Procurement } from "../../models/Procurement";
import { MasterData } from "src/assets/data/master-data";
import { Demand } from "../../models/Demand";
import { MatTableDataSource } from "@angular/material/table";
import { Acceptance } from "../../models/Acceptance";
import { Role } from "src/app/core/models/role";
import { AuthService } from "src/app/core/service/auth.service";

@Component({
  selector: "app-new-acceptance",
  templateUrl: "./new-acceptance.component.html",
  styleUrls: ["./new-acceptance.component.sass"],
})
export class NewAcceptanceComponent implements OnInit {
  pageTitle: string;
  destination: string;
  masterData = MasterData;
  btnText: string;
  demandId: number;
  itemDetailId: number;
  demandTypeId:number;
  sparesCategoryId: number;
  demandAuthorityId: number;
  AcceptanceForm: FormGroup;
  groupArrays: { departmentName: string; datas: any }[];
  validationErrors: string[] = [];
  selectedItemDetails: SelectedModel[];
  selectedSourceOfSupplys: SelectedModel[];
  selectedManufactures: SelectedModel[];
  selectedPrincipalNames: SelectedModel[];
  selectedPlaceOfDeliverys: SelectedModel[];
  selectedConditionOfItem: SelectedModel[];
  selectedItemInspections: SelectedModel[];
  selectedProcurementStatuses: SelectedModel[];
  selectedDepartmentNames: SelectedModel[];
  selectedPartNo: SelectedModel[];
  isShown: boolean = false;
  itemCategoryId: number;
  procurementData: Procurement[];
  isLoading = false;
  searchText = "";
  showHideDiv = false;
  demandData: Demand[];

  userRole = Role;
  itemCount: any = 0;

  traineeId: any;
  role: any;
  branchId: any;

  paging = {
    pageIndex: this.masterData.paging.pageIndex,
    pageSize: this.masterData.paging.pageSize,
    length: 1,
  };

  displayedColumns: string[] = [
    "ser",
    "itemDetail",
    "itemName",
    "itemSerNo",
    "sftQty",
    "warrantyTo",
    "actions",
  ];
  dataSource: MatTableDataSource<Acceptance> = new MatTableDataSource();
  demandColumns: string[] = [
    "sl",
    "demandAuthority",
    "deno",
    "demandQty",
    "demandDate",
    "fiscalYear",
  ];
  procurementColumns: string[] = [
    "sl",
    "itemDetail",
    "itemName",
    "qty",
    "remarks",
  ];

  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private ProcurementService: ProcurementService,
    private DemandService: DemandService,
    private confirmService: ConfirmService,
    private AcceptanceService: AcceptanceService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("acceptanceId");

    this.role = this.authService.currentUserValue.role.trim();
    this.traineeId = this.authService.currentUserValue.traineeId.trim();
    this.branchId = this.authService.currentUserValue.branchId.trim();
    console.log(this.role, this.traineeId, this.branchId);

    if (id) {
      this.pageTitle = "Acceptance";
      this.destination = "Edit";
      this.btnText = "Update";
      this.AcceptanceService.find(+id).subscribe((res) => {
        this.AcceptanceForm.patchValue({
          acceptanceId: res.acceptanceId,
          procurementId: res.procurementId,
          demandId: res.demandId,
          demandTypeId:res.demandTypeId,
          itemDetailId: res.itemDetailId,
          itemCategoryId: res.itemCategoryId,
          departmentNameId: res.departmentNameId,
          procurementStatusId: res.procurementStatusId,
          sourceOfSupplyId: res.sourceOfSupplyId,
          sparesCategoryId: res.sparesCategoryId,
          manufactureId: res.manufactureId,
          principalNameId: res.principalNameId,
          placeOfDeliveryId: res.placeOfDeliveryId,
          demandAuthorityId: res.demandAuthorityId,
          conditionOfItemId: res.conditionOfItemId,
          itemInspectionId: res.itemInspectionId,
          sftDate: res.sftDate,
          sftLetterNo: res.sftLetterNo,
          workOrderNo: res.workOrderNo,
          workOrderDate: res.workOrderDate,
          sftQty: res.sftQty,
          qty: res.qty,
          //procurementQty:res.procurementQty,
          itemSerNo: res.itemSerNo,
          model: res.model,
          brand: res.brand,
          warranty: res.warranty,
          warrantyFrom: res.warrantyFrom,
          warrantyTo: res.warrantyTo,
          deliveryDate: res.deliveryDate,
          inspectionDate: res.inspectionDate,
          purchasePrice: res.purchasePrice,
          dateOfManufacture: res.dateOfManufacture,
          acDocument: res.acDocument,
          arcDocument: res.arcDocument,
          cofcDocument: res.cofcDocument,
          othersDocument: res.othersDocument,
          sftRegPage: res.sftRegPage,
          acceptanceDocument: res.acceptanceDocument,
          docVerification: res.docVerification,
          sftStatus: res.sftStatus,
          remarks: res.remarks,
        });
        this.getselectedProcurementsOnUpdate(res.departmentNameId);
        this.getProcurementData();
      });
    } else {
      this.pageTitle = "Acceptance";
      this.destination = "Add";
      this.btnText = "Save";
    }
    this.intitializeForm();
    if (
      this.role != this.userRole.SuperAdmin &&
      this.role != this.userRole.CO
    ) {
      this.AcceptanceForm.get("departmentNameId").setValue(this.branchId);
      this.getselectedProcurements();
    }
    if (this.role == this.userRole.CO) {
      this.isShown = true;
      this.getAcceptancesList(0);
    }
    this.getselectedItemDetails();
    this.getselectedSourceOfSupplys();
    this.getselectedManufactures();
    this.getselectedPrincipalNames();
    this.getselectedPlaceOfDeliverys();
    this.getselectedConditionOfItem();
    this.getselectedItemInspections();
    this.getselectedProcurementStatuses();
    this.GetDepartmentNameById(this.masterData.schoolDept.navalAviation);
    // this.getselectedDemandAuthority();
  }
  intitializeForm() {
    this.AcceptanceForm = this.fb.group({
      acceptanceId: [0],
      procurementId: [],
      demandId: [],
      demandTypeId:[],
      doc: [""],
      itemDetailId: [],
      //itemCategoryId:[],
      departmentNameId: [],
      procurementStatusId: [],
      //sourceOfSupplyId: [],
      sparesCategoryId: [],
      //manufactureId: [],
      //principalNameId: [],
      //placeOfDeliveryId: [],
      //demandAuthorityId: [],
      conditionOfItemId: [""],
      //itemInspectionId: [],
      sftDate: [],
      sftLetterNo: [""],
      workOrderNo: [""],
      //workOrderDate: [''],
      sftQty: [""],
      // qty: [],
      storeQtyStatus: [0],
      storeQty: [0],
      ProcurementQty: [],
      itemSerNo: [""],
      model: [""],
      brand: [""],
      warranty: [""],
      warrantyFrom: [],
      warrantyTo: [],
      deliveryDate: [],
      //inspectionDate: [''],
      purchasePrice: [""],
      //dateOfManufacture: [''],
      acDocument: [""],
      arcDocument: [""],
      cofcDocument: [""],
      othersDocument: [""],
      sftRegPage: [""],
      acceptanceDocument: [""],
      docVerification: [""],
      sftStatus: [0],
      remarks: [""],
      isActive: [true],
    });
  }
  getPartNoPassItemCategoryIdInAcceptance(itemDetailId: number) {
    this.AcceptanceService.getPartNoPassItemCategoryIdInAcceptance(
      itemDetailId
    ).subscribe((res) => {
      this.selectedPartNo = res;
      //console.log(this.filteredOptions);
    });
  }
  inActiveItem(row){
    const id = row.acceptanceId; 
          this.confirmService.confirm('Confirm Approved message', 'Are You Sure Approved This Item').subscribe(result => {
            if (result) {
              console.log(result)
          this.AcceptanceService.approvedAcceptance(id).subscribe(() => {
            //this.getselectedPresentStocks(this.departmentId);
            this.getAcceptancesList(row.departmentNameId);
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
  getProcurementData() {
    var procurementId = this.AcceptanceForm.value["procurementId"];
    this.ProcurementService.GetselectedProcurementById(procurementId).subscribe(
      (res) => {
        this.procurementData = res;
        console.log(this.procurementData);
        var procurementId = this.AcceptanceForm.value["procurementId"];
        this.getPartNoPassItemCategoryIdInAcceptance(procurementId);
        console.log(procurementId);
        console.log("res");
        console.log(res);
      }
    );
    this.ProcurementService.find(procurementId).subscribe((res) => {
      this.demandId = res.demandId;
      this.demandTypeId=res.demandTypeId;
      this.itemDetailId = res.itemDetailId;
      this.sparesCategoryId = res.sparesCategoryId;
      var procurementQty = res.qty;
      var workOrderNo = res.workOrder;
      console.log("procurement qty" + procurementQty);
      this.AcceptanceForm.get("sparesCategoryId").setValue(this.sparesCategoryId);
      this.AcceptanceForm.get("workOrderNo").setValue(workOrderNo);
      this.AcceptanceForm.get("demandTypeId").setValue(this.demandTypeId);
      this.AcceptanceForm.get("demandId").setValue(this.demandId);
      this.AcceptanceForm.get("itemDetailId").setValue(this.itemDetailId);
      this.AcceptanceForm.get("ProcurementQty").setValue(procurementQty);
      //this.AcceptanceForm.get('itemCategoryId').setValue(res.itemCategoryId);
      this.DemandService.GetselectedDemandById(this.demandId).subscribe(
        (res) => {
          this.demandData = res;

          console.log("demand result " + this.demandData);
        }
      );
      this.DemandService.find(this.demandId).subscribe((res) => {
        this.demandAuthorityId = res.demandAuthorityId;
        //this.AcceptanceForm.get('demandAuthorityId').setValue(this.demandAuthorityId);

        this.isShown = true;
      });
    });
  }

  onDocChanged(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      // this.labelImport.nativeElement.value = file.name;
      console.log("acceptance doc");
      console.log(file);
      // this.BIODataGeneralInfoForm.controls["picture"].setValue(event.target.files[0]);
      this.AcceptanceForm.patchValue({
        doc: file,
      });
    }
  }

  getselectedProcurementsOnUpdate(id) {
    this.AcceptanceService.getselectedProcurementsOnUpdate(
      id,
      this.masterData.sparescategory.tools
    ).subscribe((res) => {
      this.selectedPartNo = res;
      console.log(this.selectedPartNo);
    });
  }
  getselectedProcurements() {
    this.isShown = true;
    var departmentNameId = this.AcceptanceForm.value["departmentNameId"];
    console.log("yyy");
    console.log(departmentNameId);
    this.AcceptanceService.getselectedProcurements(
      departmentNameId,
      this.masterData.sparescategory.tools
    ).subscribe((res) => {
      this.selectedPartNo = res;
    });
    this.getAcceptancesList(departmentNameId);
  }
  getselectedItemDetails() {
    this.AcceptanceService.getselectedItemDetails().subscribe((res) => {
      this.selectedItemDetails = res;
      console.log(this.selectedItemDetails);
    });
  }
  // getselectedDepartmentNames() {
  //   this.AcceptanceService.getselectedDepartmentNames().subscribe(res => {
  //     this.selectedDepartmentNames = res
  //     console.log(this.selectedDepartmentNames);
  //   });
  // }
  GetDepartmentNameById(baseNameId) {
    this.AcceptanceService.getSelectedSchoolName(baseNameId).subscribe(
      (res) => {
        this.selectedDepartmentNames = res;
        console.log(res);
      }
    );
  }
  getselectedSourceOfSupplys() {
    this.AcceptanceService.getselectedSourceOfSupplys().subscribe((res) => {
      this.selectedSourceOfSupplys = res;
      console.log(this.selectedSourceOfSupplys);
    });
  }
  getselectedManufactures() {
    this.AcceptanceService.getselectedManufactures().subscribe((res) => {
      this.selectedManufactures = res;
      console.log(this.selectedManufactures);
    });
  }
  getselectedPrincipalNames() {
    this.AcceptanceService.getselectedPrincipalNames().subscribe((res) => {
      this.selectedPrincipalNames = res;
      console.log(this.selectedPrincipalNames);
    });
  }
  getselectedPlaceOfDeliverys() {
    this.AcceptanceService.getselectedPlaceOfDeliverys().subscribe((res) => {
      this.selectedPlaceOfDeliverys = res;
      console.log(this.selectedPlaceOfDeliverys);
    });
  }
  // getselectedDemandAuthority(){
  //   this.AcceptanceService.getselectedDemandAuthority().subscribe(res=>{
  //     this.selectedDemandAuthority=res
  //     console.log(this.selectedDemandAuthority);
  //   });
  // }
  getselectedConditionOfItem() {
    this.AcceptanceService.getselectedConditionOfItem().subscribe((res) => {
      this.selectedConditionOfItem = res;
      console.log(this.selectedConditionOfItem);
    });
  }
  //   pageChanged(event: PageEvent) {
  //     this.paging.pageIndex = event.pageIndex
  //     this.paging.pageSize = event.pageSize
  //     this.paging.pageIndex = this.paging.pageIndex + 1
  //     this.getDemands();
  //   }
  getselectedItemInspections() {
    this.AcceptanceService.getselectedItemInspections().subscribe((res) => {
      this.selectedItemInspections = res;
      console.log(this.selectedItemInspections);
    });
  }
  getselectedProcurementStatuses() {
    this.AcceptanceService.getselectedProcurementStatuses().subscribe((res) => {
      this.selectedProcurementStatuses = res;
      console.log(this.selectedProcurementStatuses);
    });
  }

  getAcceptancesList(departmentId) {
    this.isLoading = true;
    this.AcceptanceService.getAcceptanceListByDepartmentNameId(
      this.paging.pageIndex,
      100000,
      this.searchText,
      this.masterData.sparescategory.tools,
      departmentId
    ).subscribe((response) => {
      this.dataSource.data = response.items;
      //console.log("dddddd");
      this.itemCount = response.items.length;
      console.log(this.dataSource.data);
      this.paging.length = response.totalItemsCount;
      this.isLoading = false;

      // this gives an object with dates as keys
      const groups = this.dataSource.data.reduce((groups, datas) => {
        const departmentName = datas.departmentName;
        if (!groups[departmentName]) {
          groups[departmentName] = [];
        }
        groups[departmentName].push(datas);
        return groups;
      }, {});

      // Edit: to add it in the array format instead
      this.groupArrays = Object.keys(groups).map((departmentName) => {
        return {
          departmentName,
          datas: groups[departmentName],
        };
      });

      console.log(this.groupArrays);
    });
  }

  applyFilter(searchText: any) {
    this.searchText = searchText;
    var departmentId = this.AcceptanceForm.get("departmentNameId").value;
    console.log(departmentId);
    this.getAcceptancesList(departmentId);
  }

  applyDropdown(searchText: any, departmentNameId: any) {
    this.searchText = searchText;
    //var departmentId = departmentNameId;
    //var departmentId = this.DemandForm.get("departmentNameId").value;
    console.log(searchText, departmentNameId);
    this.getAcceptancesList(departmentNameId);
    //this.getDemandsList(departmentId);
  }

  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }
  toggle() {
    this.showHideDiv = !this.showHideDiv;
  }
  printSingle() {
    this.showHideDiv = false;
    this.print();
  }
  print() {
    let printContents, popupWin;
    printContents = document.getElementById("print-routine").innerHTML;
    popupWin = window.open("", "_blank", "top=0,left=0,height=100%,width=auto");
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <style>
          body{  width: 99%;}
            label { font-weight: 400;
                    font-size: 13px;
                    padding: 2px;
                    margin-bottom: 5px;
                  }
            table, td, th {
                  border: 1px solid silver;
                    }
                    table td {
                  font-size: 13px;
                    }
                    .table.table.tbl-by-group.db-li-s-in tr .cl-action{
                      display: none;
                    }
        
                    .table.table.tbl-by-group.db-li-s-in tr td{
                      text-align:center;
                      padding: 0px 5px;
                    }
                    
                    .table.table.tbl-by-group.db-li-s-in tr .fa-file-pdf tbl-pdf {
                    display:none;
                  }
                  .table.table.tbl-by-group.db-li-s-in tr .btn-tbl-delete {
                    display:none;
                  }
                  .table.table.tbl-by-group.db-li-s-in tr .btn-tbl-edit {
                    display:none;
                  }
                    
                    table th {
                  font-size: 13px;
                    }
              table {
                    border-collapse: collapse;
                    width: 98%;
                    }
                th {
                    height: 26px;
                    }
                .header-text{
                  text-align:center;
                }
                .header-text h3{
                  margin:0;
                }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="header-text">
          <h3>SFT List</h3>
          
          </div>
          <br>
          <hr>
          ${printContents}
          
        </body>
      </html>`);
    popupWin.document.close();
  }
  onSubmit() {
    const id = this.AcceptanceForm.get("acceptanceId").value;

    const sftDateVal = this.AcceptanceForm.get("sftDate").value;
    const warrantyFromVal = this.AcceptanceForm.get("warrantyFrom").value;
    const warrantyToVal = this.AcceptanceForm.get("warrantyTo").value;
    const deliveryDateVal = this.AcceptanceForm.get("deliveryDate").value;
    this.AcceptanceForm.get("sftDate").setValue(
      sftDateVal ? new Date(sftDateVal).toUTCString() : null
    );
    this.AcceptanceForm.get("warrantyFrom").setValue(
      warrantyFromVal ? new Date(warrantyFromVal).toUTCString() : null
    );
    this.AcceptanceForm.get("warrantyTo").setValue(
      warrantyToVal ? new Date(warrantyToVal).toUTCString() : null
    );
    this.AcceptanceForm.get("deliveryDate").setValue(
      deliveryDateVal ? new Date(deliveryDateVal).toUTCString() : null
    );

    console.log(this.AcceptanceForm.value);

    const formData = new FormData();
    for (const key of Object.keys(this.AcceptanceForm.value)) {
      const value = this.AcceptanceForm.value[key];
      formData.append(key, value == null ? "" : value);
    }

    console.log(this.AcceptanceForm.value);
    if (id) {
      this.confirmService
        .confirm("Confirm Update message", "Are You Sure Update This  Item?")
        .subscribe((result) => {
          if (result) {
            this.AcceptanceService.update(+id, formData).subscribe(
              (response) => {
                this.router.navigateByUrl("/tools-management/add-acceptance");
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
      this.AcceptanceService.submit(formData).subscribe(
        (response) => {
          //this.router.navigateByUrl('/tools-management/acceptance-list');
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
  deleteItem(row) {
    const id = row.acceptanceId;
    this.confirmService
      .confirm("Confirm delete message", "Are You Sure Delete This Item?")
      .subscribe((result) => {
        console.log(result);
        if (result) {
          this.AcceptanceService.delete(id).subscribe(() => {
            //this.getAcceptances();
            this.reloadCurrentRoute();
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
}


// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { ActivatedRoute, Router } from '@angular/router';
// //import { AcceptanceService } from '../../../spares-management/service/Acceptance.service';
// import { AcceptanceService } from '../../../tools-management/service/Acceptance.service';
// import { ProcurementService } from '../../../spares-management/service/Procurement.service';
// import { DemandService } from '../../../spares-management/service/Demand.service';
// import { ConfirmService } from '../../../core/service/confirm.service';
// import { SelectedModel } from 'src/app/core/models/selectedModel';
// import { Procurement } from '../../models/Procurement';
// import { MasterData } from 'src/assets/data/master-data';
// import { Demand } from '../../models/Demand';
// import { MatTableDataSource } from '@angular/material/table';
// import { Acceptance } from '../../models/Acceptance';
// import { Role } from 'src/app/core/models/role';
// import { AuthService } from 'src/app/core/service/auth.service';

// @Component({
//   selector: 'app-new-acceptance',
//   templateUrl: './new-acceptance.component.html',
//   styleUrls: ['./new-acceptance.component.sass']
// })
// export class NewAcceptanceComponent implements OnInit {
//   pageTitle: string;
//   destination:string;
//   masterData = MasterData;
//   btnText:string;
//   demandId:number;
//   itemDetailId:number;
//   sparesCategoryId:number;
//   demandAuthorityId: number;
//   AcceptanceForm: FormGroup;
//   validationErrors: string[] = [];
//   selectedItemDetails:SelectedModel[]; 
//   selectedSourceOfSupplys:SelectedModel[]; 
//   selectedManufactures:SelectedModel[]; 
//   selectedPrincipalNames:SelectedModel[]; 
//   selectedPlaceOfDeliverys:SelectedModel[]; 
//   selectedConditionOfItem:SelectedModel[]; 
//   selectedItemInspections:SelectedModel[]; 
//   selectedDepartmentNames:SelectedModel[]; 
//   selectedPartNo:SelectedModel[];
//   isShown: boolean = false ;
//   procurementData: Procurement[];
//   isLoading = false;
//   searchText = "";

//   demandData: Demand[];

//   userRole = Role;
  
//   traineeId:any;
//   role:any;
//   branchId:any;

//   paging = {
//     pageIndex: this.masterData.paging.pageIndex,
//     pageSize: this.masterData.paging.pageSize,
//     length: 1
//   }

//   displayedColumns: string[] = ['ser', 'itemDetail', 'itemName', 'itemSerNo', 'sftQty', 'warrantyTo',  'actions'];
//   dataSource: MatTableDataSource<Acceptance> = new MatTableDataSource();
//   demandColumns: string[] = ['sl','demandAuthority','deno', 'demandQty', 'demandDate', 'fiscalYear'];
//   procurementColumns: string[] = ['sl','itemDetail', 'itemName', 'qty','remarks'];

//   constructor(private snackBar: MatSnackBar,private authService: AuthService,private ProcurementService: ProcurementService, private DemandService: DemandService,private confirmService: ConfirmService,private AcceptanceService: AcceptanceService,private fb: FormBuilder, private router: Router,  private route: ActivatedRoute) { }

//   ngOnInit(): void {
//     const id = this.route.snapshot.paramMap.get('acceptanceId'); 
    
//     this.role = this.authService.currentUserValue.role.trim();
//     this.traineeId =  this.authService.currentUserValue.traineeId.trim();
//     this.branchId =  this.authService.currentUserValue.branchId.trim();
//     console.log(this.role, this.traineeId,  this.branchId)

//     if (id) {
//       this.pageTitle = 'Edit SFT';
//       this.destination = "Edit";
//       this.btnText = 'Update';
//       this.AcceptanceService.find(+id).subscribe(
//         res => {
//           this.AcceptanceForm.patchValue({          

//             acceptanceId: res.acceptanceId,
//             procurementId: res.procurementId,
//             demandId: res.demandId,
//             itemDetailId: res.itemDetailId,
//             departmentNameId:res.departmentNameId,
//             //procurementStatusId:res.procurementStatusId,
//             sourceOfSupplyId: res.sourceOfSupplyId,
//             sparesCategoryId: res.sparesCategoryId,
//             manufactureId: res.manufactureId,
//             principalNameId: res.principalNameId,
//             placeOfDeliveryId: res.placeOfDeliveryId,
//             demandAuthorityId: res.demandAuthorityId,
//             conditionOfItemId: res.conditionOfItemId,
//             itemInspectionId:res.itemInspectionId,
//             sftDate: res.sftDate,
//             sftLetterNo: res.sftLetterNo,
//             workOrderNo: res.workOrderNo,
//             workOrderDate: res.workOrderDate,
//             sftQty: res.sftQty,
//             itemSerNo: res.itemSerNo,
//             model: res.model,
//             brand: res.brand,
//             warranty: res.warranty,
//             warrantyFrom:res.warrantyFrom,
//             warrantyTo:res.warrantyTo,
//             deliveryDate: res.deliveryDate,
//             inspectionDate: res.inspectionDate,
//             purchasePrice: res.purchasePrice,
//             dateOfManufacture: res.dateOfManufacture,
//             acDocument: res.acDocument,
//             arcDocument: res.arcDocument,
//             cofcDocument: res.cofcDocument,
//             othersDocument: res.othersDocument,
//             sftRegPage: res.sftRegPage,
//             acceptanceDocument: res.acceptanceDocument,
//             docVerification: res.docVerification,
//             sftStatus:res.sftStatus,
          
//           });  
//           this.getselectedProcurementsOnUpdate(res.departmentNameId);  
//           this.getProcurementData();      
//         }
//       );
//     } else {
//       this.pageTitle = 'Create SFT';
//       this.destination = "Add";
//       this.btnText = 'Save';
//     }
//     this.intitializeForm();
//     if(this.role != this.userRole.SuperAdmin){
//       this.AcceptanceForm.get('departmentNameId').setValue(this.branchId);
//       this.getselectedProcurements();
//     }
//     this.getselectedItemDetails();
//     this.getselectedSourceOfSupplys();
//     this.getselectedManufactures();
//     this.getselectedPrincipalNames();
//     this.getselectedPlaceOfDeliverys();
//     this.getselectedConditionOfItem();
//     this.getselectedItemInspections();
//     this.GetDepartmentNameById(this.masterData.schoolDept.navalAviation);
//    // this.getselectedDemandAuthority();
//   }
//   intitializeForm() {
//     this.AcceptanceForm = this.fb.group({
//       acceptanceId: [0],
//       procurementId: [],
//       demandId: [],
//       doc:[''],
//       itemDetailId: [],
//       departmentNameId:[],
//      // procurementStatusId:[''],
//       //sourceOfSupplyId: [],
//       sparesCategoryId: [],
//       //manufactureId:[],
//       //principalNameId:[],
//       //placeOfDeliveryId: [],
//       //demandAuthorityId: [],
//       conditionOfItemId: [''],
//       //itemInspectionId:[],
//       sftDate: [''],
//       sftLetterNo: [''],
//       workOrderNo: [''],
//       //workOrderDate: [''],
//       sftQty: [''],
//       itemSerNo:[''],
//       model: [''],
//       brand: [''],
//       warranty: [''],
//       warrantyFrom:[],
//       warrantyTo:[],
//       deliveryDate: [''],
//       //inspectionDate: [''],
//       purchasePrice: [''],
//       //dateOfManufacture: [''],
//       acDocument: [''],
//       arcDocument: [''],
//       cofcDocument: [''],
//       othersDocument: [''],
//       sftRegPage: [''],
//       acceptanceDocument: [''],
//       docVerification: [''],
//       sftStatus:[0],
//       isActive: [true],
    
//     })
//   }


//   onDocChanged(event){
//     if (event.target.files.length > 0) {
//       const file = event.target.files[0];
//       // this.labelImport.nativeElement.value = file.name;
//       console.log('acceptance doc');
//      console.log(file);
//     // this.BIODataGeneralInfoForm.controls["picture"].setValue(event.target.files[0]);
//       this.AcceptanceForm.patchValue({
//         doc: file,
//       });
//     }
//   }
//   // getPartNoPassItemCategoryIdInAcceptance(itemDetailId: number) {
//   //   this.AcceptanceService.getPartNoPassItemCategoryIdInAcceptance(itemDetailId).subscribe(res => {
//   //     this.selectedPartNo = res;
//   //     //console.log(this.filteredOptions);
//   //   });
//   // }
//   getProcurementData(){
//     var procurementId = this.AcceptanceForm.value['procurementId'];
//     this.ProcurementService.GetselectedProcurementById(procurementId).subscribe(res=>{
//       this.procurementData=res;
//       //var procurementId = this.AcceptanceForm.value['procurementId'];
//       //this.getPartNoPassItemCategoryIdInAcceptance(procurementId)
      
//     });

//     this.ProcurementService.find(procurementId).subscribe(res=>{
//       this.demandId = res.demandId;
//       this.itemDetailId=res.itemDetailId;
//       this.sparesCategoryId=res.sparesCategoryId;
//       this.AcceptanceForm.get('sparesCategoryId').setValue(this.sparesCategoryId);
//       this.AcceptanceForm.get('demandId').setValue(this.demandId);
//       this.AcceptanceForm.get('itemDetailId').setValue(this.itemDetailId);
//       this.DemandService.GetselectedDemandById(this.demandId).subscribe(res=>{
//         this.demandData=res;
        
//         console.log("demand result "+this.demandData)
//       });
//       this.DemandService.find(this.demandId).subscribe(res=>{
//         this.demandAuthorityId=res.demandAuthorityId;
//         this.AcceptanceForm.get('demandAuthorityId').setValue(this.demandAuthorityId);
//         this.isShown=true;
//       });
//     });


    

//   }

//   getselectedProcurementsOnUpdate(id){
//     this.AcceptanceService.getselectedProcurementsOnUpdate(id, this.masterData.sparescategory.tools).subscribe(res=>{
//       this.selectedPartNo=res;
//       console.log(this.selectedPartNo)
//     });
//   }
//   getselectedProcurements(){
//     this.isShown=true;
//     var departmentNameId = this.AcceptanceForm.value['departmentNameId'];
//     this.getAcceptancesList(departmentNameId);
//     console.log(departmentNameId);
//     this.AcceptanceService.getselectedProcurements(departmentNameId, this.masterData.sparescategory.tools).subscribe(res=>{
//       this.selectedPartNo=res;
//     });
//   }
//   getselectedItemDetails(){
//     this.AcceptanceService.getselectedItemDetails().subscribe(res=>{
//       this.selectedItemDetails=res
//       console.log(this.selectedItemDetails);      
//     });
//   }
//   // getselectedDepartmentNames(){
//   //   this.AcceptanceService.getselectedDepartmentNames().subscribe(res=>{
//   //     this.selectedDepartmentNames=res
//   //     console.log(this.selectedDepartmentNames);      
//   //   });
//   // }
//   GetDepartmentNameById(baseNameId){    
//     this.AcceptanceService.getSelectedSchoolName(baseNameId).subscribe(res=>{
//       this.selectedDepartmentNames=res
//       console.log(res)
//     }); 
//   }
//   getselectedSourceOfSupplys(){
//     this.AcceptanceService.getselectedSourceOfSupplys().subscribe(res=>{
//       this.selectedSourceOfSupplys=res
//       console.log(this.selectedSourceOfSupplys);      
//     });
//   }
//   getselectedManufactures(){
//     this.AcceptanceService.getselectedManufactures().subscribe(res=>{
//       this.selectedManufactures=res
//       console.log(this.selectedManufactures);      
//     });
//   }
//   getselectedPrincipalNames(){
//     this.AcceptanceService.getselectedPrincipalNames().subscribe(res=>{
//       this.selectedPrincipalNames=res
//       console.log(this.selectedPrincipalNames);      
//     });
//   }
//   getselectedPlaceOfDeliverys(){
//     this.AcceptanceService.getselectedPlaceOfDeliverys().subscribe(res=>{
//       this.selectedPlaceOfDeliverys=res
//       console.log(this.selectedPlaceOfDeliverys);      
//     });
//   }
//   // getselectedDemandAuthority(){
//   //   this.AcceptanceService.getselectedDemandAuthority().subscribe(res=>{
//   //     this.selectedDemandAuthority=res
//   //     console.log(this.selectedDemandAuthority);      
//   //   });
//   // }
//   getselectedConditionOfItem(){
//     this.AcceptanceService.getselectedConditionOfItem().subscribe(res=>{
//       this.selectedConditionOfItem=res
//       console.log(this.selectedConditionOfItem);      
//     });
//   }
//   getselectedItemInspections(){
//     this.AcceptanceService.getselectedItemInspections().subscribe(res=>{
//       this.selectedItemInspections=res
//       console.log(this.selectedItemInspections);      
//     });
//   }
  
//   getAcceptancesList(departmentId) {
//     this.isLoading = true;
//     this.AcceptanceService.getAcceptanceListByDepartmentNameId(this.paging.pageIndex, this.paging.pageSize, this.searchText, this.masterData.sparescategory.spares, departmentId).subscribe(response => {

//       this.dataSource.data = response.items;
//       //console.log("dddddd");
//       console.log(this.dataSource.data)
//       this.paging.length = response.totalItemsCount
//       this.isLoading = false;
//     })
//   }

//   applyFilter(searchText: any) {
//     this.searchText = searchText;
//     var departmentId = this.AcceptanceForm.get('departmentNameId').value;
//     console.log(departmentId);
//     this.getAcceptancesList(departmentId);
//   }

//   reloadCurrentRoute() {
//     let currentUrl = this.router.url;
//     this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
//       this.router.navigate([currentUrl]);
//     });
//   }

//   onSubmit() {
//     const id = this.AcceptanceForm.get('acceptanceId').value; 

//     this.AcceptanceForm.get('sftDate').setValue((new Date(this.AcceptanceForm.get('sftDate').value)).toUTCString()) ;
//     this.AcceptanceForm.get('warrantyFrom').setValue((new Date(this.AcceptanceForm.get('warrantyFrom').value)).toUTCString()) ;
//     this.AcceptanceForm.get('warrantyTo').setValue((new Date(this.AcceptanceForm.get('warrantyTo').value)).toUTCString()) ;
//     this.AcceptanceForm.get('deliveryDate').setValue((new Date(this.AcceptanceForm.get('deliveryDate').value)).toUTCString()) ;
//     //this.AcceptanceForm.get('dateOfManufacture').setValue((new Date(this.AcceptanceForm.get('dateOfManufacture').value)).toUTCString()) ;

//     const formData = new FormData();
//     for (const key of Object.keys(this.AcceptanceForm.value)) {
//       const value = this.AcceptanceForm.value[key];
//       formData.append(key, value);
//     }

//     console.log(this.AcceptanceForm.value)  
//     if (id) {
//       this.confirmService.confirm('Confirm Update message', 'Are You Sure Update This  Item?').subscribe(result => {
        
//         if (result) {
//           this.AcceptanceService.update(+id,formData).subscribe(response => {
//             this.router.navigateByUrl('/tools-management/add-acceptance');
//             this.snackBar.open('Information Updated Successfully ', '', {
//               duration: 2000,
//               verticalPosition: 'bottom',
//               horizontalPosition: 'right',
//               panelClass: 'snackbar-success'
//             });
//           }, error => {
//             this.validationErrors = error;
//           })
//         }
//       })
//     } else {
//       this.AcceptanceService.submit(formData).subscribe(response => {
//         //this.router.navigateByUrl('/tools-management/acceptance-list');
//         this.reloadCurrentRoute();
//         this.snackBar.open('Information Inserted Successfully ', '', {
//           duration: 2000,
//           verticalPosition: 'bottom',
//           horizontalPosition: 'right',
//           panelClass: 'snackbar-success'
//         });
//       }, error => {
//         this.validationErrors = error;
//       })
//     }
 
//   }
//   deleteItem(row) {
//     const id = row.acceptanceId; 
//     this.confirmService.confirm('Confirm delete message', 'Are You Sure Delete This Item?').subscribe(result => {
//       console.log(result);
//       if (result) {
//         this.AcceptanceService.delete(id).subscribe(() => {
//           //this.getAcceptances();
//           this.reloadCurrentRoute();
//           this.snackBar.open('Information Deleted Successfully ', '', {
//             duration: 2000,
//             verticalPosition: 'bottom',
//             horizontalPosition: 'right',
//             panelClass: 'snackbar-danger'
//           });
//         })
//       }
//     })
//   }

// }
