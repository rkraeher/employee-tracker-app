DROP DATABASE IF EXISTS company_DB;
CREATE DATABASE company_DB;
USE company_DB;
CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT,
  PRIMARY KEY (id)
);

CREATE TABLE employee_role (
	id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    PRIMARY KEY (id)
);

CREATE TABLE department (
	id INT NOT NULL AUTO_INCREMENT,
    dept_name VARCHAR(30), 
    PRIMARY KEY (id)
);

SELECT JSON_ARRAY (dept_name) as allDepartments;

INSERT INTO department (dept_name)
VALUES ("Engineering"), ("Sales");

INSERT INTO employee_role (title, salary, department_id)
VALUES ("Software Engineer", 90000, 1), ("Salesperson", 60000, 2), ("Project Manager", 120000, 1), ("Account Manager", 85000, 2);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Rudi", "Kraeher", 1), ("Bob", "Ross", 2), ("Bernard", "Lowe", 3), ("Jerry", "Maguire", 4);