import { Component, inject } from '@angular/core';
import {MatInputModule} from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button';
import { EmailValidator, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../http.service';
import { IEmployee } from '../../iterfaces/employee';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [MatInputModule,MatButtonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css'
})
export class EmployeeFormComponent {
  formBuilder=inject(FormBuilder);
  httpService = inject(HttpService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  toaster = inject(ToastrService);
  employeeForm=this.formBuilder.group({
    name:['',[Validators.required]],
    email:['',[Validators.required,Validators.email]],
    age:[0,[Validators.required,Validators.min(18)]],
    phone:['',[Validators.minLength(10),Validators.maxLength(10)]],
    salary:[0,[Validators.required]]
  });
employeeId!:number;
isEdit=false;
  ngOnInit(){
    this.employeeId = this.route.snapshot.params['id'];
    if(this.employeeId){
      this.isEdit = true;
      this.httpService.getEmployee(this.employeeId).subscribe(result=>{
        console.log(result);
        this.employeeForm.patchValue(result);
        this.employeeForm.controls.email.disable();
      })
    }
  }

  save(){
    console.log(this.employeeForm.value);
    const employee :IEmployee={
      name:this.employeeForm.value.name!,
      age:this.employeeForm.value.age!,
      email:this.employeeForm.value.email!,
      phone:this.employeeForm.value.phone!,
      salary:this.employeeForm.value.salary!
    };
    if(this.isEdit){
      this.httpService.updateEmployee(this.employeeId,employee).subscribe(()=> {
          console.log('Success');
          this.toaster.success("Record updated sucessfully",'',{
            closeButton: true
          });
          this.router.navigateByUrl('/employee-list');
      });
    }
    else{
    this.httpService.createEmployee(employee).subscribe(()=>{
      console.log("Success");
      this.toaster.success("Record added sucessfully",'',{
        closeButton: true
      });
      this.router.navigateByUrl("/employee-list");
    });
    }
  }
}

