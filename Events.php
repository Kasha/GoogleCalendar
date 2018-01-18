<?php
    header('Access-Control-Allow-Origin: http://remini.dev');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json');
		 
		define("EVENTS_TABLE", "remini.events") ;
		
		//MySQL connect parameters
		//$link = mysqli_connect("reminidb1.c5n9tbejvvyt.eu-west-1.rds.amazonaws.com", "root", "Ydg^W5]L6Ks'",'reminidb');
		//$link = mysqli_connect("reminiauroradb-cluster.cluster-c5n9tbejvvyt.eu-west-1.rds.amazonaws.com", "root", "Ydg^W5]L6Ks'",'reminidb');
		//$link = mysqli_connect('localhost', 'root', 'Omer151206!','remini');
		define("DB_CONNECTION_HOST", "localhost") ;
		define("DB_CONNECTION_USER", "root") ;
		define("DB_CONNECTION_PASSWORD", "Omer151206!") ;
		define("DB_CONNECTION_DB_NAME", "remini") ;

		//Defines for custom Error code with suitable message that can be returned
		define("CUSTOM_ERR_MYSQL_GENERAL", -1) ;
		define("CUSTOM_ERR_MYSQL_CONNECT_ERROR", -2) ;
		define("CUSTOM_ERR_MYSQL_CHARSET_ERROR", -3) ;
		define("CUSTOM_ERR_ADULT_ID_WASNT_SENT", -4) ;
		define("CUSTOM_ERR_SENT_EVENTS_EMPTY", -5) ;
		define("CUSTOM_ERR_SQL_QUERY_PROBLEM", -6) ;

		//Response Object, contains user id and error objects as ajax client response
		class Response
		{
			var $uid = 0 ;
			var $error = array() ;
		} ;

		//Detailed Error Message object for ajax client response
		class ErrorMsg
		{
			var $message = "" ;
			var $code = 0 ;
			function __construct($msg, $code)
			{
				$this->message = $msg ;
				$this->code = $code ;
			}
		} ;
	
	function connectToDB(&$oRes)
	{
			$link = mysqli_connect(DB_CONNECTION_HOST, DB_CONNECTION_USER, DB_CONNECTION_PASSWORD, DB_CONNECTION_DB_NAME);
			/* check connection */
			if (mysqli_connect_errno()) {
				$oRes->error[] = new ErrorMsg(mysqli_connect_error(), CUSTOM_ERR_MYSQL_CONNECT_ERROR);
				echo json_encode($oRes) ;
				exit(0);
			}

			if (!mysqli_set_charset($link, 'utf8')){
				$oRes->error[] = new ErrorMsg("Set charset failed",CUSTOM_ERR_MYSQL_CHARSET_ERROR);
				echo json_encode($oRes) ;
				exit(0);
			}

			return $link ;
		}
		
		function closeDBConnection($link)
		{
			try
			{
				mysqli_close($link);
			}
			catch(Exception  $e)
			{

			}
		}
		
		//Check for event id (eid) if exists in db//////////////////////////////////
		function checkForEventID($link, $eid, &$oRes) 
		{
			$sql = "SELECT id from ".EVENTS_TABLE." where eid ='$eid'" ;
			if ($result = mysqli_query($link, $sql)) {
				
						/* fetch associative array */
						$row = mysqli_fetch_assoc($result) ;
						$sRowID = $row["id"] ;
						/* free result set */
						mysqli_free_result($result);
						return $sRowID ;
				}
			return null ;
		}
		
		function addEvents($adultCreateId, $oEventnts)
		{
			$oRes = new Response() ;
			$link = connectToDB($oRes);
			$oRes->uid = $adultCreateId ;

			if( empty($adultCreateId) )
			{
				$oRes->error[] = new ErrorMsg("Adult ID isn't defined", CUSTOM_ERR_ADULT_ID_WASNT_SENT);
				return $oRes ;
			}

			if( empty($oEventnts) )
			{
				$oRes->error[] = new ErrorMsg("No Events to import", CUSTOM_ERR_SENT_EVENTS_EMPTY);
				return $oRes ;
			}
			
			for ( $i = 0 ; $i < count($oEventnts) ; $i++ )
			{
				$oEvent = $oEventnts[$i] ;
			
				$title = $oEvent["title"] ;
				$details = $oEvent["details"] ;
				$eventDateTime = date('Y-m-d H:i:s', strtotime($oEvent["eventDateTime"])) ; 
				$eventFinishTime = date('Y-m-d H:i:s', strtotime($oEvent["eventFinishTime"])) ;
			
				$details = $oEvent["details"] ;
				$location = mysqli_escape_string($link, $oEvent["location"]) ;
				$eid = $oEvent["eid"] ;

				//Check if Event exists, if it is, use insert, else use update
				$sRowID = checkForEventID($link, $eid, $oRes) ;

				if( $sRowID === null )
				{
					$sql = "INSERT INTO ".EVENTS_TABLE." (title, details, eventDateTime, eventFinishTime, adultCreateId, location, status, eid) VALUES ('$title', '$details', '$eventDateTime', '$eventFinishTime', $adultCreateId, '$location', 0, '$eid')" ;
				}
				else//Update Event with Post data
				{
					$sql = "UPDATE ".EVENTS_TABLE." SET title='$title', details='$details', eventDateTime='$eventDateTime', eventFinishTime='$eventFinishTime', adultCreateId=$adultCreateId, location='$location', eid='$eid' WHERE id=$sRowID" ;
				}
				
				$stmt = mysqli_prepare($link,$sql);

				// execute prepared statement
				try
				{
					$result= mysqli_stmt_execute($stmt);
				}
				catch(Exception  $e)
				{
					//$oError = new ErrorMsg() ;
					$oRes->error[] = new ErrorMsg($e->getMessage(), $e->getCode());
				}
				
				if ($result == false )
				{
						$mysqli_error=  mysqli_stmt_error($stmt);
						$oRes->error[] = new ErrorMsg($mysqli_error, CUSTOM_ERR_MYSQL_GENERAL);
				}

				
				/* close statement */
				mysqli_stmt_close($stmt);
				//$result = mysqli_stmt_get_result($stmt);
			}

			closeDBConnection($link) ;

			return $oRes ;
		}
		
		$adultCreateId = $_POST["uid"] ;
		$oEventnts = $_POST["events"] ;

		echo json_encode(addEvents($adultCreateId, $oEventnts)) ;
    ?>