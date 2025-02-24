-- MySQL dump 10.13  Distrib 5.7.24, for osx10.9 (x86_64)
--
-- Host: localhost    Database: choose
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `all_schools`
--

DROP TABLE IF EXISTS `all_schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `all_schools` (
  `school_name` varchar(50) DEFAULT NULL,
  `url_address` varchar(50) DEFAULT NULL,
  `address` varchar(50) DEFAULT NULL,
  `postal_code` int DEFAULT NULL,
  `mrt_desc` varchar(128) DEFAULT NULL,
  `bus_desc` varchar(256) DEFAULT NULL,
  `dgp_code` varchar(50) DEFAULT NULL,
  `zone_code` varchar(50) DEFAULT NULL,
  `type_code` varchar(50) DEFAULT NULL,
  `nature_code` varchar(50) DEFAULT NULL,
  `session_code` varchar(50) DEFAULT NULL,
  `mainlevel_code` varchar(50) DEFAULT NULL,
  `sap_ind` varchar(50) DEFAULT NULL,
  `autonomous_ind` varchar(50) DEFAULT NULL,
  `gifted_ind` varchar(50) DEFAULT NULL,
  `ip_ind` varchar(50) DEFAULT NULL,
  `mothertongue1_code` varchar(50) DEFAULT NULL,
  `mothertongue2_code` varchar(50) DEFAULT NULL,
  `mothertongue3_code` varchar(50) DEFAULT NULL,
  `ccas_offered` varchar(512) DEFAULT NULL,
  `subjects_offered` varchar(2048) DEFAULT NULL,
  `moe_programmes` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `all_schools`
--

LOCK TABLES `all_schools` WRITE;
/*!40000 ALTER TABLE `all_schools` DISABLE KEYS */;
/*!40000 ALTER TABLE `all_schools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `junior_colleges`
--

DROP TABLE IF EXISTS `junior_colleges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `junior_colleges` (
  `school_name` varchar(50) DEFAULT NULL,
  `url_address` varchar(50) DEFAULT NULL,
  `address` varchar(50) DEFAULT NULL,
  `postal_code` int DEFAULT NULL,
  `telephone_no` varchar(50) DEFAULT NULL,
  `telephone_no_2` varchar(50) DEFAULT NULL,
  `fax_no` varchar(50) DEFAULT NULL,
  `fax_no_2` varchar(50) DEFAULT NULL,
  `email_address` varchar(50) DEFAULT NULL,
  `mrt_desc` varchar(128) DEFAULT NULL,
  `bus_desc` varchar(256) DEFAULT NULL,
  `principal_name` varchar(50) DEFAULT NULL,
  `first_vp_name` varchar(50) DEFAULT NULL,
  `second_vp_name` varchar(50) DEFAULT NULL,
  `third_vp_name` varchar(50) DEFAULT NULL,
  `fourth_vp_name` varchar(50) DEFAULT NULL,
  `fifth_vp_name` varchar(50) DEFAULT NULL,
  `sixth_vp_name` varchar(50) DEFAULT NULL,
  `dgp_code` varchar(50) DEFAULT NULL,
  `zone_code` varchar(50) DEFAULT NULL,
  `type_code` varchar(50) DEFAULT NULL,
  `nature_code` varchar(50) DEFAULT NULL,
  `session_code` varchar(50) DEFAULT NULL,
  `mainlevel_code` varchar(50) DEFAULT NULL,
  `sap_ind` varchar(50) DEFAULT NULL,
  `autonomous_ind` varchar(50) DEFAULT NULL,
  `gifted_ind` varchar(50) DEFAULT NULL,
  `ip_ind` varchar(50) DEFAULT NULL,
  `mothertongue1_code` varchar(50) DEFAULT NULL,
  `mothertongue2_code` varchar(50) DEFAULT NULL,
  `mothertongue3_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `junior_colleges`
--

LOCK TABLES `junior_colleges` WRITE;
/*!40000 ALTER TABLE `junior_colleges` DISABLE KEYS */;
INSERT INTO `junior_colleges` VALUES ('ANDERSON SERANGOON JUNIOR COLLEGE','www.asrjc.moe.edu.sg','4500 ANG MO KIO AVENUE 6',569843,'64596822','na','64598734','na','asrjc@moe.edu.sg','Yio Chu Kang MRT Station','13, 45, 86, 162, 269, 825, 851, 852, 853, 860','Mr Heng Yew Seng ','Mdm Tey Li Shun','Mr Gurusharan Singh S/O M Singh','Mdm Sharon Lim Chwee Hong','NA','NA','NA','ANG MO KIO','NORTH','GOVERNMENT SCHOOL','CO-ED SCHOOL','FULL DAY','JUNIOR COLLEGE','No','No','No','No','Chinese','Malay','Tamil'),('ANGLO-CHINESE JUNIOR COLLEGE','https://acjc.moe.edu.sg','25   DOVER CLOSE EAST',139745,'67750511','na','67775479','na','acjc@acjc.edu.sg','Buona Vista','74,95,100,105,106,111,145,147,191,196,198,602','Dr Chee Yan Hoon Shirleen','Mr Ang Yuan Peng','Ms Lim Mei Lin, Audrey','Mdm Callista Lim Sing Thoe','NA','NA','NA','QUEENSTOWN','WEST','GOVERNMENT-AIDED SCH','CO-ED SCHOOL','FULL DAY','JUNIOR COLLEGE','No','No','No','No','Chinese','Malay','Tamil'),('CATHOLIC JUNIOR COLLEGE','https://cjc.moe.edu.sg/','129  WHITLEY ROAD',297822,'62524083','na','62537267','na','catholic_jc@moe.edu.sg','Toa Payoh (NS Line),  Novena (NS Line),  Stevens (DT Line),  Caldecott (CC Line,TE Line)','105, 132, 151, 153, 154, 156, 186, 966, 985','Mdm Koh Soo Min','Mr Tan Jek Suan','Mdm Kam Wai Chin            ','Mr Philip Alvar s/o Batholomew','NA','NA','NA','NOVENA','SOUTH','GOVERNMENT-AIDED SCH','CO-ED SCHOOL','FULL DAY','JUNIOR COLLEGE','No','No','No','No','Chinese','Malay','Tamil'),('EUNOIA JUNIOR COLLEGE','http://www.eunoiajc.moe.edu.sg','2    Sin Ming Place',573838,'63518388','na','63518399','na','eunoiajc@moe.edu.sg','Bishan MRT Station, Marymount MRT Station, Ang Mo Kio MRT Station','13, 52, 74, 88, 130, 410G, 410W, 851, 852','Mr Tan Eng Hian Andrew','Mdm Phua Kia Ling','Mdm New Yi Cheen','Mr Mohamad Amran Shah Bin Abdul Rahim','NA','NA','NA','BISHAN','NORTH','GOVERNMENT SCHOOL','CO-ED SCHOOL','FULL DAY','JUNIOR COLLEGE','No','No','No','Yes','Chinese','Malay','Tamil'),('JURONG PIONEER JUNIOR COLLEGE','http://jpjc.moe.edu.sg','21   Teck Whye Walk',688258,'+65 6564 6878','na','+65 6765 1861','na','jpjc@moe.edu.sg','Choa Chu Kang / Bt Panjang / Phoenix Station (LRT)','975, 190, 985','Mr Kevin Ang Keng Jin','Mr Nah Hong Leong','Mdm Ng Bee Cheow','Mr Phua Yong Swee','NA','NA','NA','CHOA CHU KANG','WEST','GOVERNMENT SCHOOL','CO-ED SCHOOL','FULL DAY','JUNIOR COLLEGE','No','No','No','No','Chinese','Malay','Tamil'),('NANYANG JUNIOR COLLEGE','http://www.nanyangjc.moe.edu.sg/','128  SERANGOON AVENUE 3',556111,'62842281','na','62855147','na','nyjc@moe.edu.sg','2-minute walk from the Lorong Chuan MRT Station (Circle Line)','22, 24, 53, 73, 133, 105, 135, 136, 156, 853','Mr Pang Choon How','Ms Jasmine Ong Peishan','Ms Yow Sihua Ken','Ms Tan Sor Leng','NA','NA','NA','SERANGOON','SOUTH','GOVERNMENT-AIDED SCH','CO-ED SCHOOL','FULL DAY','JUNIOR COLLEGE','No','No','No','No','Chinese','Malay','Tamil'),('NATIONAL JUNIOR COLLEGE','http://www.nationaljc.moe.edu.sg','37   HILLCREST ROAD',288913,'64661144','na','64684535','na','NJC@MOE.EDU.SG','BOTANIC GARDENS MRT, TAN KAH KEE MRT, SIXTH AVENUE MRT','66, 67, 74, 151, 154, 156, 157, 170, 174, 852, 961, 972','Mdm Tay Sui Leng Lucy (Mrs Lucy Toh)','Mr Haresh S/O Sivaram','Ms Sim Soo Leng Aileen','Mr Tan Yong Liang Alfred','NA','NA','NA','BUKIT TIMAH','SOUTH','GOVERNMENT SCHOOL','CO-ED SCHOOL','FULL DAY','MIXED LEVELS','No','No','No','Yes','Chinese','Malay','Tamil'),('ST. ANDREW\'S JUNIOR COLLEGE','http://www.standrewsjc.moe.edu.sg/','5    Sorby Adams Drive',357691,'62857008','62852007','62850037','na','sajc@moe.edu.sg','Potong Pasir NE10','SBSTransit: 8, 26, 31, 90, 142 ,151, 154 (Diocese of Singapore) SMRT Buses:  857, 966, 985 (Diocese of Singapore),  853 (Upper Serangoon Road)','Mr Tham Kine Thong','Mr Ang Kheng San Cecil','Ms Tee Ai Lee','Mr Chan Kwang How Bernard','NA','NA','NA','TOA PAYOH','SOUTH','GOVERNMENT-AIDED SCH','CO-ED SCHOOL','FULL DAY','JUNIOR COLLEGE','No','No','No','No','Chinese','Malay','Tamil'),('TAMPINES MERIDIAN JUNIOR COLLEGE','http://www.tmjc.moe.edu.sg','21   Pasir Ris Street 71',518799,'63493660','na','63493667','na','tmjc@moe.edu.sg','Pasir Ris MRT Station','3, 39, 53, 81, 89, 109, 358, 518','Mr Sin Kim Ho','Mdm Toh Lay Har ','Mr Ang Yeou Peng ','Mdm Yasmine d/o Kamaludheen','NA','NA','NA','PASIR RIS','EAST','GOVERNMENT SCHOOL','CO-ED SCHOOL','FULL DAY','JUNIOR COLLEGE','No','No','No','No','Chinese','Malay','Tamil'),('TEMASEK JUNIOR COLLEGE','http://www.temasekjc.moe.edu.sg','22   BEDOK SOUTH ROAD',469278,'64428066','na','64428762','na','TEMASEK_JC@MOE.EDU.SG','BEDOK MRT','12, 12E, 16, 31, 38, 47, 137, 155, 196, 196A, 197, 229','Mr Liu Earnler','Mdm Tan Kia Huan','Mdm Pang Sok Fung Wendy (Mrs Wendy Goh)','Mr Chan Kok Yew Mark','NA','NA','NA','BEDOK','EAST','GOVERNMENT SCHOOL','CO-ED SCHOOL','FULL DAY','MIXED LEVELS','No','No','No','Yes','Chinese','Malay','Tamil'),('VICTORIA JUNIOR COLLEGE','https://www.victoriajc.moe.edu.sg/','20   MARINE VISTA',449035,'64485011','na','64438337','na','victoria_jc@moe.edu.sg','Nearest MRT Stations:  Kembangan, Eunos','13, 16, 31, 36, 43, 48, 55, 135, 196, 196e, 197','Mr Low Swee Heng Jeffrey','Ms Lee Yun Yun Grace','Mr Koh Weining','Mr Kyle Lim Kwee Hong','NA','NA','NA','BEDOK','EAST','GOVERNMENT SCHOOL','CO-ED SCHOOL','FULL DAY','JUNIOR COLLEGE','No','No','No','Yes','Chinese','Malay','Tamil'),('YISHUN INNOVA JUNIOR COLLEGE','https://yijc.moe.edu.sg/','3    YISHUN RING ROAD',768675,'62579873','na','62574373','na','yijc@moe.edu.sg','Yishun, Khatib','167, 169, 171, 800, 812,','Mr Michael Nelson De Silva','Mr Loi Guang You','Ms Lee Hui Xin','Mr Long Tien Ho','NA','NA','NA','YISHUN','NORTH','GOVERNMENT SCHOOL','CO-ED SCHOOL','FULL DAY','JUNIOR COLLEGE','No','No','No','No','Chinese','Malay','Tamil'),('HWA CHONG INSTITUTION','http://www.hwachong.edu.sg','661  BUKIT TIMAH ROAD',269734,'64683955','64683956 / 64665912','67695857','na','admin@hci.edu.sg','TAN KAH KEE MRT','66, 67, 74, 151, 154, 156, 157, 170, 170A, 174, 852, 961, 961M','Mr Lee Peck Ping','Ms Ho Ping Ping','NA','NA','NA','NA','NA','BUKIT TIMAH','WEST','INDEPENDENT SCHOOL','CO-ED SCHOOL','SINGLE SESSION','MIXED LEVELS','Yes','No','No','Yes','Chinese','na','na'),('RAFFLES INSTITUTION','http://www.ri.edu.sg','1    RAFFLES INSTITUTION LANE',575954,'64199242','na','64199238','na','comms@ri.edu.sg','BISHAN MRT, MARYMOUNT MRT','410,13,50,52,53,54,55,56,57,58,59,71,74,88,93,128,130,132,156,157,162,163,165,166,167,851,852,855,980','Mr Loh Hong Oon, Aaron','','NA','NA','NA','NA','NA','BISHAN','SOUTH','INDEPENDENT SCHOOL','CO-ED SCHOOL','SINGLE SESSION','MIXED LEVELS','No','No','Yes','Yes','Chinese','Malay','Tamil'),('ST. JOSEPH\'S INSTITUTION','http://www.sji.edu.sg','38   MALCOLM ROAD',308274,'62500022','na','62533640','na','contact@sji.edu.sg','STEVENS MRT','105, 132, 151, 153, 154, 156, 186, 190, 960, 972','Mr Justin Arul Pierre','Mr Tsao Wen Jie Nicholas','NA','NA','NA','NA','NA','NOVENA','SOUTH','INDEPENDENT SCHOOL','CO-ED SCHOOL','SINGLE SESSION','MIXED LEVELS','No','No','No','Yes','Chinese','Malay','Tamil');
/*!40000 ALTER TABLE `junior_colleges` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-21 14:54:17
