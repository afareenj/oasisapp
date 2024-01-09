DROP TABLE IF EXISTS Questions;

CREATE TABLE Logins {
 id VARCHAR(30) NOT NULL,
 name VARCHAR(30) NOT NULL,
 PRIMARY KEY (id, name)
};
LOAD DATA LOCAL INFILE ''
INTO TABLE Logins
FIELDS TERMINATED BY ',';

CREATE TABLE Questions (
 id INT(9) NOT NULL,
 surveyVersion INT(9),
 question VARCHAR(100) NOT NULL,
 answerForm VARCHAR(100) NOT NULL,
 answers VARCHAR(50),
 switch VARCHAR(30) NOT NULL,
 PRIMARY KEY (id, surveyVersion)
);
LOAD DATA LOCAL INFILE 'data.csv'
INTO TABLE Questions
FIELDS TERMINATED BY ','
IGNORE 1 ROWS;

CREATE TABLE CompletedSurveys
(
  id INT(9) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userID VARCHAR(30) NOT NULL,
  dateCompleted TIMESTAMP,
  surveyVersion INT(9),
  reportType VARCHAR(30) NOT NULL,
  question VARCHAR(100) NOT NULL,
  answerForm VARCHAR(100) NOT NULL,
  answers VARCHAR(50) NOT NULL,
  completed CHAR(1) NOT NULL
);


DROP PROCEDURE IF EXISTS GetQuestions

DELIMITER //
CREATE PROCEDURE GetQuestions()
BEGIN
  SELECT *
  FROM Questions
  HAVING surveyVersion = (SELECT MAX(surveyVersion) FROM Questions);
END //
DELIMITER ;


DROP PROCEDURE IF EXISTS GetCompletedSurvey

DELIMITER //
CREATE PROCEDURE GetCompletedSurvey(IN name VARCHAR(100))
BEGIN
  SELECT distinct dateCompleted
  FROM CompletedSurveys
  WHERE userID = name;
END //
DELIMITER ;


DROP PROCEDURE IF EXISTS PostSurvey

DELIMITER //
CREATE PROCEDURE PostSurvey(IN name VARCHAR(50), IN dateToday TIMESTAMP, IN version INT(9), IN question VARCHAR (100), IN answer VARCHAR(50), IN completed CHAR(1))
BEGIN
  INSERT INTO CompletedSurveys (userID, dateCompleted, surveyVersion, question, answers, completed)
  VALUES (name, dateToday, version, question, answer, completed);
END //
DELIMITER ;


DROP PROCEDURE IF EXISTS CheckLogins

DELIMITER //
CREATE PROCEDURE CheckLogins(IN username VARCHAR(100), IN password VARCHAR(100))
BEGIN
  SELECT COUNT(1)
  FROM Logins
  WHERE id = username AND name = password;
END //
DELIMITER ;
