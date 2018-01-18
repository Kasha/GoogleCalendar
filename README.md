# GoogleCalendar
Google Calendar gapi, view calendar list and related events, import events to MySQL DB via PHP
Import Events from Google Calendar
Using Google API (gapi.client.calendar.events)
UX:
- Summary events list
- Multiple selections of events
- Display div for detailed selected event (last one that was selected)
- Import button, to send events to Remini Events Table
- If Event exists it is updated if not new row is added
- Location and Details might be empty
- On Sucess, General success message is displayed inside grren div
- On failure (1 or more errors in oRes) a general failure message is displayed inside red div.

Structure:
ReminiEventsManager class to mange event selectio, draw and import
Multiple List Widget 
GoogleCalendar.js contains gapi.client.calendar.events methods for retrieving Calendar and Events
Settings.js for user id and future Localization
Events.php for Inserting or updating events in Remini DB Events table

!!! eid should be added to Remini DB Events table, dont make it a unique since code is dealing with this and it prevents multiple my sql errors
!!! Error should be returned just in a case of DB connection error
