
import bigInt from 'big-integer';
import { IBankDataCsv } from '../types/IBankDataCsv.js';
import { IValidationRule, ValidationRules } from './ValidationRules.js';

export interface ICheckValidationRuleResult {
    Flags: bigInt.BigInteger;
    ViolatedRules: IValidationRule[];
}

export function checkValidationRules(row: IBankDataCsv): ICheckValidationRuleResult {

    let flags = bigInt(0);
    const violatedRules: IValidationRule[] = [];

    for (const s of ValidationRules) {
        try {
            if (!s.ValCode(row)) {
                violatedRules.push(s);
                flags = flags.or(bigInt(2).pow(s.Id));
            }
        }catch (e) {
            throw e;
        }
    }

    return { Flags: flags, ViolatedRules: violatedRules } as ICheckValidationRuleResult;
}