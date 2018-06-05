export interface IBankDataCsv {
    transactiondate: string;
    price: string;
    street: string;
    streetnumber: string;
    zipcode: string;
    community: string;
    objecttype: string;
    singlefamilyhousetype: string;
    condominiumtype: string;
    primaryorsecondaryhome: string;
    owneroccupiedorrented: string;
    yearofconstruction: string;
    landarea: string;
    volumeofbuilding: string;
    netlivingarea: string;
    numberofrooms: string;
    numberofbathrooms: string;
    numberofparkings: string;
    constructionquality: string;
    propertycondition: string;
}

export class BankDataCsv implements IBankDataCsv{
    transactiondate: string ="";
    price: string="";
    street: string="";
    streetnumber: string="";
    zipcode: string="";
    community: string="";
    objecttype: string="";
    singlefamilyhousetype: string="";
    condominiumtype: string="";
    primaryorsecondaryhome: string="";
    owneroccupiedorrented: string="";
    yearofconstruction: string="";
    landarea: string="";
    volumeofbuilding: string="";
    netlivingarea: string="";
    numberofrooms: string="";
    numberofbathrooms: string="";
    numberofparkings: string="";
    constructionquality: string="";
    propertycondition: string="";
}
