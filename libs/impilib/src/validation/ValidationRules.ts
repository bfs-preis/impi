import * as moment from 'moment';
import { IBankDataCsv } from '../types/IBankDataCsv';
import { isNumeric } from 'rxjs/util/isNumeric';

export interface IValidationRule {
    Message: string;
    ValCode: (row: IBankDataCsv) => boolean;
    RedFlag: boolean;
    Id: number;
}

export class PeriodeDefinition {
    static PeriodFrom: Date;
    static PeriodTo: Date;
}

export const ValidationRules: IValidationRule[] = [
    {
        Id: 1, Message: "TransactionDate is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.transactiondate.length === 0);
        }, RedFlag: true
    },
    {
        Id: 2, Message: "TransactionDate Format ≠ Date", ValCode: (row: IBankDataCsv): boolean => {
            if (row.transactiondate.length === 0) return true;
            return moment(row.transactiondate, 'D.M.YYYY', true).isValid();
        }, RedFlag: true
    },
    {
        Id: 3, Message: "TransactionDate is not in the previous quarter", ValCode: (row: IBankDataCsv): boolean => {
            if (row.transactiondate.length === 0) return true;
            let transactionDate = moment(row.transactiondate, 'D.M.YYYY', true);
            if (!transactionDate.isValid()) return true;

            if (transactionDate.isBetween(moment(PeriodeDefinition.PeriodFrom), moment(PeriodeDefinition.PeriodTo), 'day', '[]')) return true;
            return false;
        }, RedFlag: true
    },
    {
        Id: 4, Message: "Price is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.price.length === 0);
        }, RedFlag: true
    },
    {
        Id: 5, Message: "Price ≤ zero", ValCode: (row: IBankDataCsv): boolean => {
            if (row.price.length === 0 || !isNumeric(row.price)) return true;
            return !(Number(row.price) <= 0);
        }, RedFlag: true
    },
    {
        Id: 6, Message: "Price Format ≠ Number", ValCode: (row: IBankDataCsv): boolean => {
            if (row.price.length === 0) return true;
            return !(!isNumeric(row.price));
        }, RedFlag: true
    },
    {
        Id: 7, Message: "Street is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.street.length === 0);
        }, RedFlag: true
    },
    {
        Id: 8, Message: "Street Format ≠ String(200)", ValCode: (row: IBankDataCsv): boolean => {
            if (row.street.length === 0) return true;
            return !(row.street.length > 200);
        }, RedFlag: true
    },
    {
        Id: 9, Message: "Streetnumber is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.streetnumber.length === 0);
        }, RedFlag: true
    },
    {
        Id: 10, Message: "StreetNumber Format ≠ String(10)", ValCode: (row: IBankDataCsv): boolean => {
            if (row.streetnumber.length === 0) return true;
            return !(row.streetnumber.length > 10);
        }, RedFlag: true
    },
    {
        Id: 11, Message: "ZipCode is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.zipcode.length === 0);
        }, RedFlag: true
    },
    {
        Id: 12, Message: "ZipCode Format ≠ Number(4)", ValCode: (row: IBankDataCsv): boolean => {
            if (row.zipcode.length === 0) return true;
            return !(!isNumeric(row.zipcode) || Number(row.zipcode) > 9999 || row.zipcode.length != 4);
        }, RedFlag: true
    },
    {
        Id: 13, Message: "Community is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.community.length === 0);
        }, RedFlag: true
    },
    {
        Id: 14, Message: "Community Format ≠ String(200)", ValCode: (row: IBankDataCsv): boolean => {
            if (row.community.length === 0) return true;
            return !(row.community.length > 200);
        }, RedFlag: true
    },
    {
        Id: 15, Message: "Objecttype is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.objecttype.length === 0);
        }, RedFlag: true
    },
    {
        Id: 16, Message: "Objecttype ≠ Einfamilienhaus or Eigentumswohnung", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0) return true;
            return !(!isNumeric(row.objecttype) || Number(row.objecttype) > 2 || Number(row.objecttype) < 1);
        }, RedFlag: true
    },
    {
        Id: 17, Message: "ObjectType = Einfamilienhaus and VolumeOfBuilding is missing", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype)) return true;
            return !(Number(row.objecttype) == 1 && (row.volumeofbuilding.length === 0));
        }, RedFlag: true
    },
    {
        Id: 18, Message: "ObjectType = Einfamilienhaus and VolumeOfBuilding ≤ zero", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype) || row.volumeofbuilding.length == 0 || !isNumeric(row.volumeofbuilding)) return true;
            return !(Number(row.objecttype) == 1 && (Number(row.volumeofbuilding) <= 0));
        }, RedFlag: true
    },
    {
        Id: 19, Message: "ObjectType = Einfamilienhaus and Format of VolumeOfBuilding ≠ Number(6)", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype) || row.volumeofbuilding.length == 0 || !isNumeric(row.volumeofbuilding)) return true;
            return !(Number(row.objecttype) == 1 && (Number(row.volumeofbuilding) > 999999));
        }, RedFlag: true
    },
    {
        Id: 20, Message: "ObjectType = Einfamilienhaus and LandArea is missing", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype)) return true;
            return !(Number(row.objecttype) == 1 && row.landarea.length === 0);
        }, RedFlag: true
    },
    {
        Id: 21, Message: "ObjectType = Einfamilienhaus and LandArea ≤ zero", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype) || row.landarea.length == 0 || !isNumeric(row.landarea)) return true;
            return !(Number(row.objecttype) == 1 && (Number(row.landarea) <= 0));
        }, RedFlag: true
    },
    {
        Id: 22, Message: "ObjectType = Einfamilienhaus and Format of LandArea ≠ Number(6)", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype) || row.landarea.length == 0) return true;
            return !(Number(row.objecttype) == 1 && (Number(row.landarea) > 999999 || !isNumeric(row.landarea)));
        }, RedFlag: true
    },
    {
        Id: 23, Message: "ObjectType = Einfamilienhaus and SingleFamilyHouseType is missing", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype)) return true;
            return !(Number(row.objecttype) == 1 && row.singlefamilyhousetype.length === 0);
        }, RedFlag: false
    },
    {
        Id: 24, Message: "ObjectType = Einfamilienhaus and SingleFamilyHouseType ≠ Freistehend, Doppelhaushälfte, Reiheneckhaus, Reihenmittelhaus, Terrassenhaus, Andere", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype) || row.singlefamilyhousetype.length == 0) return true;
            return !(Number(row.objecttype) == 1 && (!isNumeric(row.singlefamilyhousetype) || Number(row.singlefamilyhousetype) > 6 || Number(row.singlefamilyhousetype) < 1));
        }, RedFlag: false
    },
    {
        Id: 25, Message: "ObjectType = Eigentumswohnung and NetLivingArea is missing", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype)) return true;
            return !(Number(row.objecttype) == 2 && row.netlivingarea.length === 0);
        }, RedFlag: true
    },
    {
        Id: 26, Message: "ObjectType = Eigentumswohnung and NetLivingArea ≤ zero", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype) || row.netlivingarea.length == 0 || !isNumeric(row.netlivingarea)) return true;
            return !(Number(row.objecttype) == 2 && (Number(row.netlivingarea) <= 0));
        }, RedFlag: true
    },
    {
        Id: 27, Message: "ObjectType = Eigentumswohnung and Format of NetLivingArea ≠ Number(6)", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype) || row.netlivingarea.length == 0) return true;
            return !(Number(row.objecttype) == 2 && (Number(row.netlivingarea) > 999999 || !isNumeric(row.netlivingarea)));
        }, RedFlag: true
    },
    {
        Id: 28, Message: "ObjectType = Eigentumswohnung and CondominiumType is missing", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype)) return true;
            return !(Number(row.objecttype) == 2 && row.condominiumtype.length === 0);
        }, RedFlag: false
    },
    {
        Id: 29, Message: "ObjectType = Eigentumswohnung and CondominiumType ≠ Geschosswohnung, Attikawohnung, Gartenwohnung, Loft or Andere", ValCode: (row: IBankDataCsv): boolean => {
            if (row.objecttype.length === 0 || !isNumeric(row.objecttype) || row.condominiumtype.length == 0) return true;
            return !(Number(row.objecttype) == 2 && (Number(row.condominiumtype) > 5 || Number(row.condominiumtype) < 1 || !isNumeric(row.condominiumtype)));
        }, RedFlag: false
    },
    {
        Id: 30, Message: "YearOfConstruction is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.yearofconstruction.length === 0);
        }, RedFlag: true
    },
    {
        Id: 31, Message: "YearOfConstruction Format ≠ Number(4)", ValCode: (row: IBankDataCsv): boolean => {
            if (row.yearofconstruction.length === 0) return true;
            return !(!isNumeric(row.yearofconstruction) || Number(row.yearofconstruction) > 9999 || row.yearofconstruction.length != 4);
        }, RedFlag: true
    },
    {
        Id: 32, Message: "NumberOfRooms is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.numberofrooms.length === 0);
        }, RedFlag: false
    },
    {
        Id: 33, Message: "NumberOfRooms ≤ zero", ValCode: (row: IBankDataCsv): boolean => {
            if (row.numberofrooms.length === 0 || !isNumeric(row.numberofrooms)) return true;
            return !(Number(row.numberofrooms) <= 0);
        }, RedFlag: false
    },
    {
        Id: 34, Message: "NumberOfRooms Format ≠ Number(2,1)", ValCode: (row: IBankDataCsv): boolean => {
            if (row.numberofrooms.length === 0) return true;
            return !(!isNumeric(row.numberofrooms) || Number(row.numberofrooms) < 0 || Number(row.numberofrooms) > 99);
        }, RedFlag: false
    },
    {
        Id: 35, Message: "NumberOfBathrooms is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.numberofbathrooms.length === 0);
        }, RedFlag: false
    },
    {
        Id: 36, Message: "NumberOfBathrooms < zero", ValCode: (row: IBankDataCsv): boolean => {
            if (row.numberofbathrooms.length === 0 || !isNumeric(row.numberofbathrooms)) return true;
            return !(Number(row.numberofbathrooms) < 0);
        }, RedFlag: false
    },
    {
        Id: 37, Message: "NumberOfBathrooms Format ≠ Number(2)", ValCode: (row: IBankDataCsv): boolean => {
            if (row.numberofbathrooms.length === 0) return true;
            return !(!isNumeric(row.numberofbathrooms) || Number(row.numberofbathrooms) > 99);
        }, RedFlag: false
    },
    {
        Id: 38, Message: "NumberOfParkings is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.numberofparkings.length === 0);
        }, RedFlag: false
    },
    {
        Id: 39, Message: "NumberOfParkings < zero", ValCode: (row: IBankDataCsv): boolean => {
            if (row.numberofparkings.length === 0 || !isNumeric(row.numberofparkings)) return true;
            return !(Number(row.numberofparkings) < 0);
        }, RedFlag: false
    },
    {
        Id: 40, Message: "NumberOfParkings Format ≠ Number(2)", ValCode: (row: IBankDataCsv): boolean => {
            if (row.numberofparkings.length === 0) return true;
            return !(!isNumeric(row.numberofparkings) || Number(row.numberofparkings) > 99);
        }, RedFlag: false
    },
    {
        Id: 41, Message: "ConstructionQuality is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.constructionquality.length === 0);
        }, RedFlag: false
    },
    {
        Id: 42, Message: "ConstructionQuality ≠ schlecht, durchschnittlich, gut or sehr gut", ValCode: (row: IBankDataCsv): boolean => {
            if (row.constructionquality.length === 0) return true;
            return !(!isNumeric(row.constructionquality) || Number(row.constructionquality) > 4 || Number(row.constructionquality) < 1);
        }, RedFlag: false
    },
    {
        Id: 43, Message: "PropertyCondition is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.propertycondition.length === 0);
        }, RedFlag: false
    },
    {
        Id: 44, Message: "PropertyCondition ≠ schlecht, intakt, saniert or neuwertig", ValCode: (row: IBankDataCsv): boolean => {
            if (row.propertycondition.length === 0) return true;
            return !(!isNumeric(row.propertycondition) || Number(row.propertycondition) > 4 || Number(row.propertycondition) < 1);
        }, RedFlag: false
    },
    {
        Id: 45, Message: "PrimaryOrSecondaryHome is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.primaryorsecondaryhome.length === 0);
        }, RedFlag: false
    },
    {
        Id: 46, Message: "PrimaryOrSecondaryHome ≠ Erstwohnung or Zweitwohnung", ValCode: (row: IBankDataCsv): boolean => {
            if (row.primaryorsecondaryhome.length === 0) return true;
            return !(!isNumeric(row.primaryorsecondaryhome) || Number(row.primaryorsecondaryhome) < 1 || Number(row.primaryorsecondaryhome) > 2);
        }, RedFlag: false
    },
    {
        Id: 47, Message: "OwnerOccupiedOrRented is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.owneroccupiedorrented.length === 0);
        }, RedFlag: false
    },
    {
        Id: 48, Message: "OwnerOccupiedOrRented ≠ sebstgenutzt or vermietet", ValCode: (row: IBankDataCsv): boolean => {
            if (row.owneroccupiedorrented.length === 0) return true;
            return !(!isNumeric(row.owneroccupiedorrented) || Number(row.owneroccupiedorrented) < 1 || Number(row.owneroccupiedorrented) > 2);
        }, RedFlag: false
    },
    {
        Id: 49, Message: "StandardOfVolume is missing", ValCode: (row: IBankDataCsv): boolean => {
            return !(row.standardofvolume.length === 0);
        }, RedFlag: false
    },
    {
        Id: 50, Message: "StandardOfVolume ≠ GVA, SIA416 or SIA116", ValCode: (row: IBankDataCsv): boolean => {
            if (row.standardofvolume.length === 0) return true;
            return !(!isNumeric(row.standardofvolume) || Number(row.standardofvolume) > 3 || Number(row.standardofvolume) < 1);
        }, RedFlag: false
    },


];