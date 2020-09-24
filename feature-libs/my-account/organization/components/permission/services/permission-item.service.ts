import { Injectable } from '@angular/core';
import { Permission, RoutingService } from '@spartacus/core';
import {
  Budget,
  PermissionService,
} from '@spartacus/my-account/organization/core';
import { Observable, of } from 'rxjs';
import { OrganizationItemService } from '../../shared/organization-item.service';
import { PermissionFormService } from '../form/permission-form.service';
import { CurrentPermissionService } from './current-permission.service';
import { LoadStatus } from '../../../core/model/budget.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionItemService extends OrganizationItemService<Permission> {
  constructor(
    protected currentItemService: CurrentPermissionService,
    protected routingService: RoutingService,
    protected formService: PermissionFormService,
    protected permissionService: PermissionService
  ) {
    super(currentItemService, routingService, formService);
  }

  load(code: string): Observable<Budget> {
    this.permissionService.loadPermission(code);
    return this.permissionService.get(code);
  }

  update(code, value: Budget): Observable<LoadStatus> {
    this.permissionService.update(code, value);
    return of(LoadStatus.ERROR);
  }

  protected create(value: Budget) {
    this.permissionService.create(value);
  }

  protected getDetailsRoute(): string {
    return 'permissionDetails';
  }
}
