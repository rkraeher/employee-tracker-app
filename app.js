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


// function getDepts() {
//   connection.query("SELECT dept_name FROM department", function (err, res) {
//     if (err) throw err;
//     let departments = res.map(dept => dept.dept_name);
//     return departments;
//   });
// }


const departments = ["Engineering", "Sales"];

//Put all these in a separate class file.
function viewAllEmployees() {
  connection.query("SELECT e.id, first_name, last_name, title, salary, dept_name FROM employee AS e INNER JOIN employee_role AS er ON e.role_id = er.id INNER JOIN department AS d ON er.department_id = d.id ORDER BY dept_name ASC", function (err, res) {
    //Add a ORDER BY dept_name 
    if (err) throw err;
    const allEmployees = res;
    const table = cTable.getTable(allEmployees);
    console.log(table);
    menu();
  });
}

function viewDept() {
  inquirer
  .prompt([
    {
      type: "list",
      message: "Which department would you like to see?",
      choices: departments,
      name: "viewDepartment",
    },
  ])
  .then(response => {
    const dept = response.viewDepartment;
    const query = "SELECT e.id, first_name, last_name, title, salary, dept_name FROM employee AS e INNER JOIN employee_role AS er ON e.role_id = er.id INNER JOIN department AS d ON er.department_id = d.id WHERE dept_name=? ORDER BY title ASC";
    connection.query(query, [dept], function (err, res) {
      if (err) throw err;
      const employeesByDept = res;
      const table = cTable.getTable(employeesByDept);
      console.log(table);
      menu();
    });
  }); 
}

function viewEmployees() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "How would you like to view personnel?",
        choices: [
          "View all employees",
          "View a department",
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
        case "View a department":
          return viewDept();
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
  //1. have it clear terminal and 
  //2. display my ascii image
  //3. functions (menu)
  menu();

  let departments = (function() {
    connection.query("SELECT dept_name FROM department", function (err, res) {
      if (err) throw err;
      let allDepts = res.map(dept => dept.dept_name);
      console.log(allDepts); //This consoles correctly
      return allDepts;
    });
  })();
  console.log("\n");
  console.log(departments); //But this consoles undefined...
  
});
