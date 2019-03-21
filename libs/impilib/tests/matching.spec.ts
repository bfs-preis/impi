import { expect, assert } from 'chai';

// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import 'mocha';
import { GeoDatabase } from '../src/match/GeoDatabase';
import { match, MatchingTypeEnum } from '../src/match/match';
import { IBankDataCsv } from '../src/types/IBankDataCsv';
import { IBuildingRecord } from '../src/types/IBuildingRecord';

describe('simple matching tests', () => {

    let geoDatabase = new GeoDatabase('/vagrant/Data/geodbv8.db', (error) => {
        console.log(error);
    });

    let testCases = [
        "Kanalstrasse;2a;4415;Lausen;0;Point Matching",
        "Dorfstrasse;12;8236;Büttenhardt;0;Point Matching (2 Objekte mit identischer PLZ aber unterschiedlicher Gemeinde).",
        "Dorfstrasse;12;8236;Thayngen;0;Point Matching (2 Objekte mit identischer PLZ aber unterschiedlicher Gemeinde)",
        "Bürenstrasse;45;3000;Bern;0;Point Matching (mit alternativer PLZ)", 
        "Mattenweg;6;3250;Lyss;1;Center Street Matching",
        "Hofwilstrasse;;3053;Münchenbuchsee;1;Center Street Matching",
        "Dorfstrasse;99;8236;Büttenhardt;1;Center Street Matching (2 Strassen mit identischem Namen und identischer PLZ aber unterschiedlicher Gemeinde).",
        "Dorfstrasse;99;8236;Thayngen;1;Center Street Matching (2 Strassen mit identischem Namen und identischer PLZ aber unterschiedlicher Gemeinde).",
        "Bürenstrasse;;3006;Bern;1;Center Street Matching (mit alternativer PLZ)",
        "Rue de la fantaisie;;3012;Bern;2;Center PLZ Matching",
        "Erfinderstrasse;123;3053;Diemerswil;2;Center PLZ Matching (2 Gemeinden mit identischer PLZ aber unterschiedlicher Gemeinde)",
        "Erfinderstrasse;123;3053;Münchenbuchsee;2;Center PLZ Matching (2 Gemeinden mit identischer PLZ aber unterschiedlicher Gemeinde)",
        "1. Gangstrasse;11;8717;Benken;0;Point Matching",
        "Alte Bernstrasse;9;4500;Solothurn;0;Point Matching",
        "Beribodenweg;4;7250;Klosters-Serneus;0;Point Matching",
        "Florastrasse;14.1;8570;Weinfelden;0;Point Matching",
        "Gehrenweidstrasse;683;9552;Wil (Sankt Gallen);0;Point Matching",
        "3-Eidgenossen;11z;8808;Freienbach;0;Point Matching",
        "Eggerdingen;1;3416;Affoltern im Emmental;0;Point Matching",
        "A la Bataille;;1042;Bioley-Orjulaz;0;Point Matching",
        "Boulevard de Pérolles;21a;1700;Fribourg;0;Point Matching",
        "Benzenrüti;10;9410;Heiden;0;Point Matching",
        "Apfelseestrasse;1;4202;Aesch;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ aber unterschiedlicher Gemeinde).",
        "Apfelseestrasse;1;4202;Duggingen;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ aber unterschiedlicher Gemeinde).",
        "Chemin Magnin;3;1188;Gimel;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ aber unterschiedlicher Gemeinde).",
        "Chemin Magnin;3;1188;Saint-George;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ aber unterschiedlicher Gemeinde).",
        "Dorf;11;3053;Deisswil bei Münchenbuchsee;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ aber unterschiedlicher Gemeinde).",
        "Dorf;11;3053;Wiggiswil;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ aber unterschiedlicher Gemeinde).",
        "Via Monte Ceneri;;6593;Cadenazzo;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ aber unterschiedlicher Gemeinde).",
        "Via Monte Ceneri;;6593;Gambarogno;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ aber unterschiedlicher Gemeinde).",
        "Route du Moulin;4;1782;Belfaux;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ aber unterschiedlicher Gemeinde).",
        "Route du Moulin;4;1782;La Sonnaz;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ aber unterschiedlicher Gemeinde).",
        "Chemin des Vernex;14;1865;Ormont-Dessus;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ&Gemeinde).",
        "Chemin du Vernex;14;1865;Ormont-Dessus;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ&Gemeinde).",
        "Am Baselweg;2;4147;Aesch;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ&Gemeinde).",
        "Baselweg;2;4147;Aesch;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ&Gemeinde).",
        "La Grande Motte;;2206;Val-de-Ruz;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ&Gemeinde).",
        "La Grande Motte;;2206;Val-de-Ruz;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ&Gemeinde).",
        "Am Gütsch;1;6130;Willisau;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ&Gemeinde).",
        "Gütsch;1;6130;Willisau;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ&Gemeinde).",
        "Am Gässli;3;8219;Trasadingen;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ&Gemeinde).",
        "Gässli;3;8219;Trasadingen;0;Point Matching (2 Objekte mit identischer Strasse&Nr&PLZ&Gemeinde).",
        "Landoltstrasse;19;3006;Bern;0;Point Matching (mit alternativer PLZ).",
        "Motorenstrasse;3;8620;Wetzikon;0;Point Matching (mit alternativer PLZ).",
        "Espace de l'Europe;10;2067;Neuchâtel;0;Point Matching (mit alternativer PLZ).",
        "Achilles-Bischoff-Strasse;10;4052;Basel;0;Point Matching (mit alternativer PLZ).",
        "Boulevard de la Cluse;51;1200;Genève;0;Point Matching (mit alternativer PLZ).",
        "Route de la Clochatte;6;1010;Lausanne;0;Point Matching (mit alternativer PLZ).",
        "La Grande Motte;;2043;Val-de-Ruz;0;Point Matching (mit alternativer PLZ).",
        "Zürcher Strasse;93;9008;St. Gallen;0;Point Matching (mit alternativer PLZ).",
        "Via Ceresio di Suvigliana;35;6932;Lugano;0;Point Matching (mit alternativer PLZ).",
        "Leopold-Ruzicka-Weg;1f;8049;Zürich;1;CenterStreet Matching",
        "Heinisolstrasse;;8194;Hüntwangen;1;CenterStreet Matching",
        "Zunzgerstrasse;154;4450;Sissach;1;CenterStreet Matching",
        "Route de Saint-Cergue;abc;1260;Nyon;1;CenterStreet Matching",
        "Route de Drize;24x;1227;Carouge;1;CenterStreet Matching",
        "Alte Zugerstrasse;;6403;Küssnacht (SZ);1;CenterStreet Matching",
        "Mattenweg;99;3250;Lyss;1;CenterStreet Matching",
        //"Oberdorf;;8460;Marthalen;1;CenterStreet Matching", //Fail --> PointMatch
        "Segantinistrasse;16m;9008;St. Gallen;1;CenterStreet Matching",
        "Farbgasse;;4900;Langenthal;1;CenterStreet Matching",
        //"Chemin du Viaduc;;1008;Prilly;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ aber unterschiedlicher Gemeinde).",
        //"Chemin du Viaduc;;1008;Renens (VD);1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ aber unterschiedlicher Gemeinde).",
        //"Apfelseestrasse;;4202;Aesch;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ aber unterschiedlicher Gemeinde).",
        //"Apfelseestrasse;;4202;Duggingen;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ aber unterschiedlicher Gemeinde).",
        "Chemin Magnin;333;1188;Gimel;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ aber unterschiedlicher Gemeinde).",
        "Chemin Magnin;333;1188;Saint-George;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ aber unterschiedlicher Gemeinde).",
        "Dorf;A11;3053;Deisswil bei Münchenbuchsee;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ aber unterschiedlicher Gemeinde).",
        "Dorf;A11;3053;Wiggiswil;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ aber unterschiedlicher Gemeinde).",
        "Route du Moulin;m;1782;Belfaux;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ aber unterschiedlicher Gemeinde).",
        "Route du Moulin;x;1782;La Sonnaz;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ aber unterschiedlicher Gemeinde).",
        "Adlenberg;;4418;Reigoldswil;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ&Gemeinde).",
        "Am Adlenberg;;4418;Reigoldswil;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ&Gemeinde).",
        "Au-Bühl;96z;9650;Nesslau;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ&Gemeinde).",
        "Bühl;49f;9650;Nesslau;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ&Gemeinde).",
        "La Grande Motte;ab;2206;Val-de-Ruz;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ&Gemeinde).",
        "La Grande-Motte;123;2206;Val-de-Ruz;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ&Gemeinde).",
        "Sankt Martin;987;7408;Cazis;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ&Gemeinde).",
        "St. Martin;678;7408;Cazis;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ&Gemeinde).",
        "Via Mulino;555;6825;Mendrisio;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ&Gemeinde).",
        "Via al Mulino;555;6825;Mendrisio;1;CenterStreet Matching (2 Fälle mit identischer Strasse&PLZ&Gemeinde).",
        "Leopold-Ruzicka-Weg;1f;8005;Zürich;1;CenterStreet (mit alternativer PLZ).",
        "Bürenstrasse;45A;3006;Bern;1;CenterStreet (mit alternativer PLZ).",
        "Rue des Côtes-de-Montbenon;30bf;1006;Lausanne;1;CenterStreet (mit alternativer PLZ).",
        //"Chemin de Beau-Rivage;B14;1003;Lausanne;1;CenterStreet (mit alternativer PLZ).",
        "Route de Drize;24x;1212;Carouge;1;CenterStreet (mit alternativer PLZ).",
        "Alte Zugerstrasse;;6402;Küssnacht (SZ);1;CenterStreet (mit alternativer PLZ).",
        "Mattenweg;99;3292;Lyss;1;CenterStreet (mit alternativer PLZ).",
        "Achilles-Bischoff-Strasse;1010;4052;Basel;1;CenterStreet (mit alternativer PLZ).",
        "Segantinistrasse;16m;9000;St. Gallen;1;CenterStreet (mit alternativer PLZ).",
        "Farbgasse;;4916;Langenthal;1;CenterStreet (mit alternativer PLZ).",
        "Boklerstrasse;28;8051;Zürich;2;CenterPLZ Matching",
        "Schorrenweg;6;4058;Basel;2;CenterPLZ Matching",
        "Kirchenlindachstrasse;4;3042;Meikirch;2;CenterPLZ Matching",
        "Via Primasaccc;32;6926;Collina d'Oro;2;CenterPLZ Matching",
        "Chemine de la Dôle;7;1261;Le Vaud;2;CenterPLZ Matching",
        "Grand-Ruelle;40;2900;Porrentruy;2;CenterPLZ Matching",
        "Laupstrasse;18;6430;Schwyz;2;CenterPLZ Matching",
        "Bahnenweg;28;2503;Biel/Bienne;2;CenterPLZ Matching",
        //"Hintere-Gasse;25;7324;Vilters-Wangs;2;CenterPLZ Matching",
        "Imstlerweg;18;8197;Rafz;2;CenterPLZ Matching",
        //"Manuelstrasse;10;3007;Bern;2;CenterPLZ Matching (2 Fälle mit identischer PLZ aber unterschiedlicher Gemeinde).",
        "Zufallsstrasse;28;3007;Köniz;2;CenterPLZ Matching (2 Fälle mit identischer PLZ aber unterschiedlicher Gemeinde).",
        "Chemin du Château;;1008;Prilly;2;CenterPLZ Matching (2 Fälle mit identischer PLZ aber unterschiedlicher Gemeinde).",
        "Avenue de la Rueyre;;1008;Jouxtens-Mézery;2;CenterPLZ Matching (2 Fälle mit identischer PLZ aber unterschiedlicher Gemeinde).",
        "Höfustrasse;20;3053;Rapperswil (BE);2;CenterPLZ Matching (2 Fälle mit identischer PLZ aber unterschiedlicher Gemeinde).",
        "Botenacker;23;3053;Diemerswil;2;CenterPLZ Matching (2 Fälle mit identischer PLZ aber unterschiedlicher Gemeinde).",
        "Erfinderweg;1;5054;Kirchleerau;2;CenterPLZ Matching (2 Fälle mit identischer PLZ aber unterschiedlicher Gemeinde).",
        "Neuerweg;123;5054;Moosleerau;2;CenterPLZ Matching (2 Fälle mit identischer PLZ aber unterschiedlicher Gemeinde).",
        "Jolie Rue;2;1042;Assens;2;CenterPLZ Matching (2 Fälle mit identischer PLZ aber unterschiedlicher Gemeinde).",
        "Jolie Rue;4;1042;Bettens;2;CenterPLZ Matching (2 Fälle mit identischer PLZ aber unterschiedlicher Gemeinde).",
        "Hofwilstrasse;20;30533;Münchenbuchsee;3;NoMatching",
        "Chemin Champ-du-Chêne;3;1039;Montanaire;3;NoMatching",
        "Chemin Sus-le-Crêt;2;1060;Jorat-Menthue;3;NoMatching",
        "Avenue Alexandre-Vinet;26b;1002;Lausanne;3;NoMatching",
        "Papiermühlestrasse;4a;9999;St. Gallen;3;NoMatching",
        "Bundesplatz;1;PLZ3000;Bern;3;NoMatching",
        "Chemin de Rovéréaz;59;1014;Lausanne;3;NoMatching",
        "L'Oeuchatte;7;2749;Petit-Val;3;NoMatching",
        "La Combe aux Borgnes;4;2711;Tavannes;3;NoMatching",
        "Obere Bühlen;3;3133;Riggisberg;3;NoMatching",
    ];

    testCases.forEach((testCase, index) => {
        let splited = testCase.split(";");
        let input: IBankDataCsv = {
            community: splited[3],
            street: splited[0],
            streetnumber: splited[1],
            zipcode: splited[2],
            standardofvolume:"",
            condominiumtype: "",
            constructionquality: "",
            landarea: "",
            netlivingarea: "",
            numberofbathrooms: "",
            numberofparkings: "",
            numberofrooms: "",
            objecttype: "",
            owneroccupiedorrented: "",
            price: "",
            primaryorsecondaryhome: "",
            propertycondition: "",
            singlefamilyhousetype: "",
            transactiondate: "",
            volumeofbuilding: "",
            yearofconstruction: "",
        };

        it('should have ' + MatchingTypeEnum[splited[4]] + " Case:" + index + " Desc:" + splited[5], (done) => {
            let i=index;
            const myPromise: Promise<{ record: IBuildingRecord | null, matchingType: MatchingTypeEnum }> = new Promise((resolve, reject) => {
                match(input, geoDatabase, (record, err, matchingType) => {
                    if (err)
                        return reject(err);
                    else
                        return resolve({ record: record, matchingType: matchingType });
                });
            });

            myPromise
                .then((result: { record: IBuildingRecord | null, matchingType: MatchingTypeEnum }) => {
                    try {
                        //expect(result.record).not.to.be.null;
                        expect(result.matchingType).to.equal(+(splited[4]));
                        done();
                    }
                    catch (e) {
                        return done(e);
                    }
                });
        });
    });
})
