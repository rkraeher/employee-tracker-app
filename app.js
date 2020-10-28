const mysql = require("mysql");
const inquirer = require("inquirer");
const dotenv = require("dotenv").config();
const cTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "costume88",
  database: "company_DB"
});

//Put all these in a separate class file.
function viewAllEmployees() {
  connection.query("SELECT e.id, first_name, last_name, title, salary, dept_name FROM employee AS e INNER JOIN employee_role AS er ON e.role_id = er.id INNER JOIN department AS d ON er.department_id = d.id", function (err, res) {
    if (err) throw err;
    const allEmployees = res;
    const table = cTable.getTable(allEmployees);
    console.log(table);
    menu();
  });
}

// function viewByDept() {
//   connection.query("SELECT id, first_name, last_name, FROM employee", function (err, res) {
//     if (err) throw err;

//   }
// }

function viewEmployees() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "How would you like to view personnel?",
        choices: [
          "View all employees",
          "View by employee department",
          "View by employee role",
          "Return to main menu",
        ],
        name: "viewEmployees",
      },
    ])
    .then((response) => {
      const { viewEmployees } = response;

      switch (viewEmployees) {
        case "View all employees":
          return viewAllEmployees();
        case "View by employee department":
          return //function
        case "View by employee role":
          return; //function;
        case "Return to main menu":
          menu();
      }
    });
}

function menu() {
  inquirer
    .prompt([
      {
        type: "list",
        message:
          "Welcome to the Employee Tracker menu. What would you like to do?",
        choices: [
          "Add a department, role, or employee",
          "View employees",
          "Update employee role",
          "Quit this menu",
        ],
        name: "menu",
      },
    ])
    .then((response) => {
      const { menu } = response;

      switch (menu) {
        case "Add a department, role, or employee":
          return; //function;
        case "View employees":
          return viewEmployees();
        case "Update employee roles":
          return; //function;
        case "Quit this menu":
          connection.end();
      }
    });
}

connection.connect(function (err) {
  if (err) throw err;
  menu();
});
