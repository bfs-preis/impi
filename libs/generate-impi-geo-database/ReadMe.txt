    Mit diesem Tool kann eine IMPI Sqlite3 Geodatenbank erzeugt werden.
    Dazu braucht es 4 Csv Files, in folgendem Format:

    CenterStreet:
        ZipCode;Community;Street;EGID
    CenterCommunities:
        ZipCode;Community;EGID
    Buildings:
        EGID;Street;StreetNumber;ZipCode;Community;Canton;MajorStatisticalRegion;CommunityType;SecondAppartementQuota;TaxBurden;TravelTimeToCenters;PublicTransportQuality;NoiseExposure;Slope;Exposure;LakeView;MountainView;DistanceToLakes;DistanceToRivers;DistanceToHighVoltagePowerLines;YearOfConstruction
    AdditionalPLZ:
        Orginal;Alternativ
 
    Encoding der Csv Files : Utf8

    Commandzeilen Argumente:

    Usage: generate-impi-db-cli [options]                                                            
                                                                                                 
    Options:                                                                                         
                                                                                                    
    -V, --version                          output the version number                               
    -g, --geodb <file>                     Database filename                                       
    -q, --dbversion <version>              Database Version                                        
    -f, --from <date>                      Database Period From [dd.MM.YYYY]                       
    -t, --to <date>                        Database Period To [dd.MM.YYYY]                         
    -s, --streetCsv <file>                 CSV Filename to Street InputFile                        
    -c, --communitiesCsv <file>            CSV Filename to Communities InputFile                   
    -b, --buildingsCsv <file>              CSV Filename to Buildings InputFile                     
    -a, --additionalCommunitiesCsv <file>  CSV Filename to the additional Communities InputFile    
    -C, --config [file]                    JSON Config File                                        
    -l, --LogLevel <level>                 LogLevel (default: info)                                
    -h, --help                             output usage information                                
                                                                                                 
    Anstelle der Argumente kann auch eine JSON Datei angegeben werden (option -C) in welcher alle Optionen definiert werden.

    Folgendes Format:

    {
        "csv": {
            "street": "/media/sf_impitest/Data/_20180430_CENTER_STREET.csv",
            "communities": "/media/sf_impitest/Data/_20180430_CENTER_PLZ.csv",
            "buildings": "/media/sf_impitest/Data/_20180424_BUILDINGS.csv",
            "additional": "/media/sf_impitest/Data/_20180424_ALTERNATIVE_ZIPCODES.csv"
        },
        "db": {
            "version": "1.0.0",
            "from": "01.01.2000",
            "to": "01.01.2020"
        },
        "output": "./geodbv6.db"
    }

  