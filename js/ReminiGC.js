let g_oReminiEventsManager = null;

//Google Calendar Events manager, collecr and import
class ReminiEventsManager{  
    constructor() {
        this.primaryCalendarId = "" ;// Primary Calendar ID 
        this.oEvents = new Array() ;// Selected Calendar Event List, index = event id
        if(!g_oReminiEventsManager){
            g_oReminiEventsManager = this;
        }

        return g_oReminiEventsManager;
      }

      reset()
      {
        $('.list-group.checked-list-box').html('')  ;// Delete events list 
        $('#idCalendarDiv').html('') ; // Delete Calendar select list  
      }

      signout()
      {
        //alert("Signout") ;
        g_oReminiEventsManager.reset() ;
      }

      signin()
      {
        g_oReminiEventsManager.drawCalendarEvents(gapi) ;
      }
     
  
  // Retrieve  Events from a chosen Calendar (default Primary, when loading)
  // From now untill 365 days a head
   drawEvents(gapi, calenderIDIn)
   {
        if( typeof(calenderIDIn) == "undefined" )// Set default primary calendar value/
        {
            calenderIDIn = 'primary' ;
        }
        
      $('.list-group.checked-list-box').html('')  ;//*Delete events list
      g_oReminiEventsManager.oEvents = null ;
      g_oReminiEventsManager.oEvents = new Array() ;

      var now = new Date();
      var timeMax = new Date(now);
      timeMax.setDate(now.getDate() + 365);

      gapi.client.calendar.events.list({
      'calendarId': calenderIDIn,
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'timeMax': timeMax.toISOString(),
      'orderBy': 'startTime'
    }).then(function(response) {
      var events = response.result.items;
      // Set Primary Calendar ID, retrived results contains primary events for primary calendar.
      g_oReminiEventsManager.primaryCalendarId = response.result.summary ;
      if (events.length > 0) {
        for (let i = 0; i < events.length; i++) {
          var oEvent = events[i];
          g_oReminiEventsManager.addEventItem(oEvent) ;
        }
         //Create Widget, when finishing creating events list 
         g_oReminiEventsManager.createListWidget() ;
         // If calenderIDIn = 'primary', primary calendar events is showed, create calendar list select control
         // I'm getting primary calendar from events (response.result.summary), so Calendar list is created after Events were retrieved
          
         if( calenderIDIn == "primary" )
         {
            g_oReminiEventsManager.drawCalendarList(gapi, calenderIDIn) ;
         }
      } else {
         g_oReminiEventsManager.addEventItem('No upcoming events found.');
      }
    });
  }

  // Display a Detailed Event when clicking on Event summary 
  drawEvent(oEvent)
  {
    let sBodyMessage = "" ;
    sBodyMessage += "<p>Start:"+Date(oEvent.start.dateTime).toString()+"</p>"  ;

    if( typeof(oEvent.location) != "undefined" )
    {
        sBodyMessage += "<p>Location:"+oEvent.location+"</p>"  ;
    }

    if( typeof(oEvent.description) != "undefined" )
    {
        if( oEvent.description.length > 3 )
        {
            sBodyMessage += "<p>Description:"+oEvent.description+"</p>"  ;
        }
    }
    
    sBodyMessage += "<p>End:"+Date(oEvent.end.dateTime).toString()+"</p>"  ;

    $('#display-event-json').html('<div class="alert alert-warning"><strong>'+oEvent.summary+'</strong> '+sBodyMessage+'</div>') ;
  }

   drawCalendarList(gapi, calenderIDIn)
   {
        return gapi.client.calendar.calendarList.list().then(response => {
           let calendars = response.result.items;
           if (calendars === undefined) return [];
            
           $('#idCalendarDiv').html('') ; 
        
           let sCalendar = '<select id="idSelectCalendar" class="selectpicker show-tick form-control" onchange="onSelectCalendar()">' ;
          
           for( let i = 0 ; i < calendars.length ; i++ )
           {
               let sCalendarID = calendars[i].id ;
               let sSelected = "" ;
               if( typeof(calenderIDIn) == "undefined" || calenderIDIn == 'primary')
               {// Set Primary Calendar as default
                if(  g_oReminiEventsManager.primaryCalendarId == sCalendarID )
                {
                    sSelected += 'selected="selected"' ;
                }
               }
               else if( calenderIDIn == sCalendarID )
               {
                sSelected += 'selected="selected"' ;
               }
               
               sCalendar += '<option '+sSelected+'>'+sCalendarID+'</option>' ;
           }
           sCalendar += '</select>' ;
           $("#idCalendarDiv").html(sCalendar) ;
        });
   }

   drawCalendarEvents(gapi, calenderID)
   {
    g_oReminiEventsManager.reset() ;
    g_oReminiEventsManager.drawEvents(gapi, calenderID) ;
   }

   // Create selected events list and normalize their attributes to fit Events Table.
   importEvents()
   {
    let oRes = new Object() ;
    var checkedItems = [], counter = 0;
    
    $(".glyphicon-check").parent().each(function() {
        /**Create and normalizes to fit Remini Events Table.*/
       let oEvent = new Object() ;
        checkedItems[counter] = oEvent ;
       
        let oEventMsg = g_oReminiEventsManager.oEvents[$(this).attr("eid")] ;

        if( typeof(oEventMsg.description) == "undefined" )
        {
            oEvent.details = " ";//Fix, it can come from Google api empty or even with 1 character 
        }
        else
        {
            oEvent.details = oEventMsg.description;
        }

        if( typeof(oEventMsg.location) == "undefined" )
        {
            oEvent.location = " ";//Fix, it can come from Google api empty or even with 1 character
        }
        else
        {
            oEvent.location = oEventMsg.location;
        }

        oEvent.title = oEventMsg.summary;
        oEvent.eventDateTime = oEventMsg.start.dateTime ;
        oEvent.eventFinishTime = oEventMsg.end.dateTime ; 
        oEvent.eid = oEventMsg.id;

        counter++;
    });
    
    if( counter > 0 )//If any item was checked  send to server.
    {
        oRes.uid = g_oSettingsManager.UID ;
        oRes.events = checkedItems ;
        g_oReminiEventsManager.sendEvents(oRes) ;
    }

    return oRes ;
   }

   // Enable Import button when there is one or more selection else disable it
   enableImportButton()
   {
        let oImportBtn = $('#import-button') ;
        let bBtnEnabled = oImportBtn.hasClass('active') ;
        let nCheckedCount = $(".glyphicon-check").parent().length ;

        // Update the button's color
        if (nCheckedCount > 0 && bBtnEnabled == 0) 
        {
            oImportBtn.removeClass('disabled');
            oImportBtn.addClass('active');
        } 
        else if (nCheckedCount == 0 && bBtnEnabled == 1) 
        {
            oImportBtn.removeClass('active');
            oImportBtn.addClass('disabled');
        }   
   }

   sendEvents(oReq)
   {
        oReq.uid = g_oSettingsManager.UID ;
        //$('#display-json').html('<p>'+JSON.stringify(oReq, null, '\t')+'</p>');
        let sPath = location.protocol+"//"+location.host+location.pathname+"Events.php" ;
        sPath = sPath.replace("index.html", "") ;
    $.ajax({
        url: sPath,
        type: "post",
        data: oReq,
        // Display a general success or failure user freindly message
        // If oRes.error > 0 then display a general error message
        success: function(oRes) {
            //$('#display-json').html('<p>'+JSON.stringify(oRes, null, '\t')+'</p>');
            //return ;
            if( oRes.error.length == 0 )
            {
                if( oReq.events.length == 1 )
                {
                    $('#display-json').html('<div class="alert alert-success"><strong>Success!</strong> Your Event was imported</div>') ;
                }
                else
                {
                    $('#display-json').html('<div class="alert alert-success"><strong>Success!</strong> Your Events were imported</div>') ;
                }
            }
            else
            {
                if( oReq.events.length == 1 )
                {
                    $('#display-json').html('<div class="alert alert-danger"><strong>Failed to import your event!</strong> Please try again or contact Admin</div>') ;
                }
                else
                {
                    $('#display-json').html('<div class="alert alert-danger"><strong>Failed to import your events!</strong> Please try again or contact Admin</div>') ;
                }
               
            }
           
             //$('#display-json').html('<p>'+JSON.stringify(d, null, '\t')+'</p>');
        },
        error: function(err) {
           //$('#display-json').html('ERROR:<p>'+JSON.stringify(err, null, '\t')+'</p>');
            //return ;
            if( oReq.events.length == 1 )
            {
                $('#display-json').html('<div class="alert alert-danger"><strong>Failed to import your event!</strong> Please try again or contact Admin</div>') ;
            }
            else
            {
                $('#display-json').html('<div class="alert alert-danger"><strong>Failed to import your events!</strong> Please try again or contact Admin</div>') ;
            }
         }
    });

   }
    

    // Create Event Summary <li> Item and Event to g_oReminiEventsManager.oEvents[oEvent.id] event id (eid) as index key
   addEventItem(oEvent)
   {
    if( typeof(oEvent) == "string" )/***If oEvent == string it's a message and not an Event, display no events message*/
    {
         $(".eventsList").append('<li class="list-group-item">'+oEvent+'</li>') ; 
    }
    else
    {
        let when = oEvent.start.dateTime;
        
        if (!when) {
          when = oEvent.start.date;
          oEvent.start.dateTime = when ;
        }
         
        if (!oEvent.end.dateTime) {
          oEvent.end.dateTime = oEvent.end.date ;
        }
        // Convert Google calendar to iso format for display. Server side gets start and end date as is from Google Calendar.
        var iso = new Date(when).toISOString().match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/)
        let message = oEvent.summary + "  |  " + iso[2] + " " + iso[1] ;
        g_oReminiEventsManager.oEvents[oEvent.id] = oEvent ;

        $(".eventsList").append('<li eid="'+oEvent.id+'" class="list-group-item">'+message+'</li>') ;  
    }
    
   }
   
   createListWidget()
   {
    OnCreateListWidget() ;
   }
}

g_oReminiEventsManager = new ReminiEventsManager() ;

// Change Calendar and display related Events if any
function onSelectCalendar()
{
   let sCalendarID = $('#idSelectCalendar option:selected').text() ;
   g_oReminiEventsManager.drawEvents(gapi, sCalendarID) ;

}


// Multiple List Widget 
//Widget for Events Display and multiple selections
function OnCreateListWidget()
{
    $(function () {
        $('.list-group.checked-list-box .list-group-item').each(function () {
            // Settings
            var $widget = $(this),
                $checkbox = $('<input type="checkbox" class="hidden" />'),
                color = ($widget.data('color') ? $widget.data('color') : "primary"),
                style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-"),
                settings = {
                    on: {
                        icon: 'glyphicon glyphicon-check'
                    },
                    off: {
                        icon: 'glyphicon glyphicon-unchecked'
                    }
                };
                
            $widget.css('cursor', 'pointer')
            $widget.append($checkbox);

            // Event Handlers
            $widget.on('click', function () {
                $checkbox.prop('checked', !$checkbox.is(':checked'));
                $checkbox.triggerHandler('change');
                updateDisplay();
            });
            $checkbox.on('change', function () {
                updateDisplay();
            });
            

            // Actions
            function updateDisplay() {
                var isChecked = $checkbox.is(':checked');

                // Set the button's state
                $widget.data('state', (isChecked) ? "on" : "off");

                // Set the button's icon
                $widget.find('.state-icon')
                    .removeClass()
                    .addClass('state-icon ' + settings[$widget.data('state')].icon);

                // Update the button's color
                if (isChecked) {
                    $widget.addClass(style + color + ' active');
                } else {
                    $widget.removeClass(style + color + ' active');
                }

                if( typeof(event) != 'undefined' )
                {
                    let oElement = $(typeof(event.srcElement) != 'undefined' ? event.srcElement : event.target) ;
                    let oEvent = g_oReminiEventsManager.oEvents[oElement.attr("eid")];
                    g_oReminiEventsManager.drawEvent(oEvent) ;        
                }
                g_oReminiEventsManager.enableImportButton() ;
            }

            // Initialization
            function init() {
                
                if ($widget.data('checked') == true) {
                    $checkbox.prop('checked', !$checkbox.is(':checked'));
                }
                
                updateDisplay();

                // Inject the icon if applicable
                if ($widget.find('.state-icon').length == 0) {
                    $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
                }
            }
            init();
        });
    });
}