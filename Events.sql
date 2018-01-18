CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) DEFAULT NULL,
  `details` text,
  `eventDateTime` timestamp NULL DEFAULT NULL,
  `eventFinishTime` timestamp NULL DEFAULT NULL,
  `adultCreateId` int(11) DEFAULT NULL,
  `location` text,
  `status` int(11) NOT NULL DEFAULT '0',
  `eid` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;