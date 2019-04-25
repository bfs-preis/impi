/// <reference path="./chaiExtension.ts" />

import { checkValidationRules, ICheckValidationRuleResult } from '../src/validation/checkValidationRules';
import { PeriodeDefinition } from '../src/validation/ValidationRules';
import { IBankDataCsv } from '../src/types/IBankDataCsv';
import { expect, use } from 'chai';

import * as bigInt from 'big-integer';
import * as moment from 'moment';

// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import 'mocha';

//Helpers
use((_chai) => {
  let assertion = _chai.Assertion;
  assertion.addMethod('equalBigInt', function (big: bigInt.BigInteger) {
    let one: bigInt.BigInteger = this._obj as bigInt.BigInteger;
    let exp = one.toJSNumber();
    let act = big.toJSNumber();
    this.assert(
      one.equals(big)
      , 'expected #{exp} to be a equal #{act}'
      , 'expected #{exp} to not be equal #{act}',
      exp,
      act
    );
  });
});

function getBigInt(id: number) {
  return bigInt(2).pow(id);
}

///

describe('check single validation errors', () => {

  //Set Period
  PeriodeDefinition.PeriodFrom = new Date(2017, 0, 1);
  PeriodeDefinition.PeriodTo = new Date(2017, 2, 31);

  //Default Row
  const Row: IBankDataCsv = {
    community: "Test",
    condominiumtype: "1",
    constructionquality: "1",
    landarea: "1",
    netlivingarea: "1",
    numberofbathrooms: "1",
    numberofparkings: "1",
    numberofrooms: "1",
    objecttype: "1",
    owneroccupiedorrented: "1",
    price: "1",
    primaryorsecondaryhome: "1",
    propertycondition: "1",
    singlefamilyhousetype: "1",
    street: "strasse",
    streetnumber: "1",
    transactiondate: "02.02.2017",
    volumeofbuilding: "1",
    yearofconstruction: "1999",
    zipcode: "3000",
    standardofvolume:""
  };

  it('should have no validation error', () => {
    const result = checkValidationRules(Row);
    expect(result.ViolatedRules.length).to.equal(0);
    expect(result.Flags).to.be.equalBigInt(bigInt(0));

  });

  it('should have transaction date missing', () => {

    const row = Object.assign({}, Row);

    row.transactiondate = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.be.equalBigInt(getBigInt(1));

  });

  it('should have transaction Format ≠ Date', () => {

    const row = Object.assign({}, Row);

    row.transactiondate = "no date";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(2));

  });

  it('should have transaction not in period', () => {

    const row = Object.assign({}, Row);

    row.transactiondate = "02.01.2018";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(3));

  });


  it('should have transaction in period [start]', () => {

    const row = Object.assign({}, Row);

    row.transactiondate = "01.01.2017";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(0);
    expect(result.Flags).to.equalBigInt(bigInt(0));

  });

  it('should have transaction in period [end]', () => {

    const row = Object.assign({}, Row);

    row.transactiondate = "31.3.2017";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(0);
    expect(result.Flags).to.equalBigInt(bigInt(0));

  });

  it('should have price missing', () => {

    const row = Object.assign({}, Row);

    row.price = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(4));

  });

  it('should have price ≤ zero', () => {

    const row = Object.assign({}, Row);

    row.price = "0";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(5));

  });

  it('should have price Format ≠ Number', () => {

    const row = Object.assign({}, Row);

    row.price = "1'000";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(6));

  });

  it('should have Street is missing', () => {

    const row = Object.assign({}, Row);

    row.street = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(7));

  });

  it('should have street Format ≠ String(200)', () => {

    const row = Object.assign({}, Row);

    row.street = "0".repeat(201);

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(8));

  });

  it('should have Streetnumber is missing', () => {

    const row = Object.assign({}, Row);

    row.streetnumber = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(9));

  });

  it('should have Streetnumber Format ≠ String(10)', () => {

    const row = Object.assign({}, Row);

    row.streetnumber = "0".repeat(11);

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(10));

  });

  it('should have ZipCode is missing', () => {

    const row = Object.assign({}, Row);

    row.zipcode = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(11));

  });

  it('should have ZipCode Format ≠ Number(4)', () => {

    const row = Object.assign({}, Row);

    row.zipcode = "1".repeat(5);

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(12));

  });

  it('should have Community is missing', () => {

    const row = Object.assign({}, Row);

    row.community = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(13));

  });

  it('should have Community Format ≠ String(200)', () => {

    const row = Object.assign({}, Row);

    row.community = "0".repeat(201);

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(14));

  });

  it('should have ObjectType is missing', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(15));

  });

  it('should have Objecttype ≠ Einfamilienhaus or Eigentumswohnung', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "3";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(16));

  });

  it('should have ObjectType = Einfamilienhaus and VolumeOfBuilding is missing', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "1";
    row.volumeofbuilding = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(17));

  });

  it('should have ObjectType = Einfamilienhaus and VolumeOfBuilding ≤ zero', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "1";
    row.volumeofbuilding = "0";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(18));

  });

  it('should have ObjectType = Einfamilienhaus and Format of VolumeOfBuilding ≠ Number(6)', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "1";
    row.volumeofbuilding = "1".repeat(7);

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(19));

  });

  it('should have ObjectType = Einfamilienhaus and LandArea is missing', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "1";
    row.landarea = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(20));

  });

  it('should have ObjectType = Einfamilienhaus and LandArea ≤ zero', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "1";
    row.landarea = "0";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(21));

  });

  it('should have ObjectType = Einfamilienhaus and Format of LandArea ≠ Number(6)', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "1";
    row.landarea = "1".repeat(7);

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(22));

  });

  it('should have ObjectType = Einfamilienhaus and SingleFamilyHouseType is missing', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "1";
    row.singlefamilyhousetype = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(23));

  });

  it('should have ObjectType = Einfamilienhaus and SingleFamilyHouseType ≠ [Types]', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "1";
    row.singlefamilyhousetype = "7";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(24));

  });


  it('should have ObjectType = Eigentumswohnung and NetLivingArea is missing', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "2";
    row.netlivingarea = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(25));

  });

  it('should have ObjectType = Eigentumswohnung and NetLivingArea ≤ zero', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "2";
    row.netlivingarea = "0";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(26));

  });

  it('should have ObjectType = Eigentumswohnung and Format of NetLivingArea ≠ Number(6)', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "2";
    row.netlivingarea = "1".repeat(7);

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(27));

  });

  it('should have ObjectType = Eigentumswohnung and CondominiumType is missing', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "2";
    row.condominiumtype = "";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(28));

  });

  it('should have ObjectType = Eigentumswohnung and CondominiumType ≠ [Types]', () => {

    const row = Object.assign({}, Row);

    row.objecttype = "2";
    row.condominiumtype = "6";

    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(29));

  });

  it('should have YearOfConstruction is missing', () => {

    const row = Object.assign({}, Row);

    row.yearofconstruction = "";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(30));

  });

   it('should have YearOfConstruction ≤ zero', () => {

    const row = Object.assign({}, Row);

    row.yearofconstruction = "0";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(31));

  });

  it('should have YearOfConstruction Format ≠ Number(4)', () => {

    const row = Object.assign({}, Row);

    row.yearofconstruction = "2".repeat(5);
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(31));

  });

  it('should have NumberOfRooms is missing', () => {

    const row = Object.assign({}, Row);

    row.numberofrooms = "";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(32));

  });

  it('should have NumberOfRooms ≤ zero', () => {

    const row = Object.assign({}, Row);

    row.numberofrooms = "0";
  
    const result = checkValidationRules(row);
    console.log(result);
    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(33));

  });

  it('should have NumberOfRooms Format ≠ Number(2,1)', () => {

    const row = Object.assign({}, Row);

    row.numberofrooms = "1".repeat(3);
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(34));

  });

  it('should have NumberOfBathrooms is missing', () => {

    const row = Object.assign({}, Row);

    row.numberofbathrooms = "";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(35));

  });

  it('should have NumberOfBathrooms < zero', () => {

    const row = Object.assign({}, Row);

    row.numberofbathrooms = "-1";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(36));

  });

  it('should have NumberOfBathrooms Format ≠ Number(2)', () => {

    const row = Object.assign({}, Row);

    row.numberofbathrooms = "1".repeat(3);
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(37));

  });

  it('should have NumberOfParkings is missing', () => {

    const row = Object.assign({}, Row);

    row.numberofparkings = "";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(38));

  });

  it('should have NumberOfParkings < zero', () => {

    const row = Object.assign({}, Row);

    row.numberofparkings = "-1";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(39));

  });

  it('should have NumberOfParkings Format ≠ Number(2)', () => {

    const row = Object.assign({}, Row);

    row.numberofparkings = "1".repeat(3);
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(40));

  });

  it('should have ConstructionQuality is missing', () => {

    const row = Object.assign({}, Row);

    row.constructionquality = "";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(41));

  });

  it('should have ConstructionQuality ≠ schlecht, durchschnittlich, gut or sehr gut', () => {

    const row = Object.assign({}, Row);

    row.constructionquality = "5";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(42));

  });

  it('should have PropertyCondition is missing', () => {

    const row = Object.assign({}, Row);

    row.propertycondition = "";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(43));

  });

  it('should have PropertyCondition ≠ schlecht, intakt, saniert or neuwertig', () => {

    const row = Object.assign({}, Row);

    row.propertycondition = "5";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(44));

  });

  it('should have PrimaryOrSecondaryHome is missing', () => {

    const row = Object.assign({}, Row);

    row.primaryorsecondaryhome = "";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(45));

  });

  it('should have PrimaryOrSecondaryHome ≠ Erstwohnung or Zweitwohnung', () => {

    const row = Object.assign({}, Row);

    row.primaryorsecondaryhome = "3";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(46));

  });

   it('should have OwnerOccupiedOrRented is missing', () => {

    const row = Object.assign({}, Row);

    row.owneroccupiedorrented = "";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(47));

  });

   it('should have OwnerOccupiedOrRented ≠ sebstgenutzt or vermietet', () => {

    const row = Object.assign({}, Row);

    row.owneroccupiedorrented = "3";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(48));

  });

  //Special

  it('should have ObjectType = Einfamilienhaus and Format of VolumeOfBuilding ≠ Number(6)', () => {

    const row = Object.assign({}, Row);
    row.objecttype="1";
    row.volumeofbuilding = "aaa";
  
    const result = checkValidationRules(row);
    console.log(result);
    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(19));

  });

  it('should have ObjectType = Eigentumswohnung and Format of NetLivingArea ≠ Number(6)', () => {

    const row = Object.assign({}, Row);
    row.objecttype="2";
    row.netlivingarea = "-98";
  
    const result = checkValidationRules(row);

    expect(result.ViolatedRules.length).to.equal(1);
    expect(result.Flags).to.equalBigInt(getBigInt(26));

  });


});



