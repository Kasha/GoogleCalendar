// Enumoration of Language constants, for future UI localization
class LanguageEnum
{
 static get EN(){return "en"}  ;
 static get HE(){return "he"}  ;
}

//Enumoration of custom error codes with suitable message that can be returned from server,
//Can be used for future extension of Import Failure currently, just general success and failure, user freindly messages are displayed
class ServerImportError
{
 static get CUSTOM_ERR_MYSQL_GENERAL(){return -1}  ;
 static get CUSTOM_ERR_MYSQL_CONNECT_ERROR(){return -2}  ;
 static get CUSTOM_ERR_MYSQL_CHARSET_ERROR(){return -3}  ;
 static get CUSTOM_ERR_ADULT_ID_WASNT_SENT(){return -4}  ;
 static get CUSTOM_ERR_SENT_EVENTS_EMPTY(){return -5}  ;
 static get CUSTOM_ERR_SQL_QUERY_PROBLEM(){return -6}  ;
}

let g_oSettingsManager = null;

class Settings
{
    constructor(language) 
    {
         let _language = language;
        
        /**Private data member work around */
        this.setLanguage = function(language) 
        { 
            if( typeof(language) == "undefined" )/***Set 0 as default value*/
            {
                language = LanguageEnum.EN ;
            }
           
            _language = language; 
        }
        this.getLanguage = function() { return _language; }
        
        if(!g_oSettingsManager){
            g_oSettingsManager = this;
        }

        return g_oSettingsManager;
    }

    get Language() { return this.getLanguage(); }
    set Language (language) { this.setLanguage(language); }

       
    get object()
    {
        let oSettings = new Object() ;
        oSettings.language = this.Language ;
        return oSettings ;
    }

    get UID()
    {
        return 111 ;
    }
    
    setData(language)
    {
      this.Language = language ;
    }
}

g_oSettingsManager = new Settings() ;