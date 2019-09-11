import { Injectable } from '@angular/core';
import { JsonConvert, ValueCheckingMode, OperationMode } from 'json2typescript';
import { ConfigurationService } from './configuration.service';
import { ToasterService } from 'angular2-toaster';

@Injectable({ providedIn: 'root' })
export class JsonConverterService {

    private jsonConverterInstance: JsonConvert;

    constructor(
        protected _configService: ConfigurationService,
        protected _toasterService: ToasterService) {
        this.jsonConverterInstance = new JsonConvert(
            ((_configService.getEnvironment() &&  _configService.getEnvironment().jsonConverterConfig) ?
                _configService.getEnvironment().jsonConverterConfig.operationMode :
                OperationMode.ENABLE
            ),
            ValueCheckingMode.ALLOW_NULL,
            false
        );
    }

    getInstance(): JsonConvert {
        return this.jsonConverterInstance;
    }

    doCopy<T>(item: T, type:  { new(): T; }|any): T {
        return this.getInstance().deserialize(this.getInstance().serialize(item), type);
    }

}
