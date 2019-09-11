import { JsonConverter, JsonCustomConvert } from 'json2typescript';
import * as moment from 'moment';

@JsonConverter
export class DateConverter implements JsonCustomConvert<Date> {
    serialize(date: Date): any {
        return (date) ? moment(date).format('YYYY-MM-DD') : undefined;
    }
    deserialize(date: any): Date {
        return date !== null ? new Date(date) : null;
    }
}

@JsonConverter
export class DateTimeConverter implements JsonCustomConvert<Date> {
    serialize(date: Date): any {
        return (date) ? date.getTime() : undefined;
    }
    deserialize(date: any): Date {
        return date !== null ? new Date(date) : null;
    }
}
