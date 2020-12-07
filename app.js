const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
require("dotenv").config();

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

//1. have it clear terminal and 
//2. display my ascii image

// INITIATE APPLICATION
menu();

// VALIDATORS
const validateIsNumber = input => { if (!isNaN(input)) return true };

// VIEW QUERIES
function viewAllEmployees() {
  connection.query("SELECT e.id, first_name, last_name, title, salary, dept_name FROM employee AS e INNER JOIN employee_role AS er ON e.role_id = er.id INNER JOIN department AS d ON er.department_id = d.id ORDER BY dept_name ASC", function (err, res) {
    if (err) throw err;
    const allEmployees = res;
    const table = cTable.getTable(allEmployees);
    console.log(table);
    menu();
  });
}

function getAllDepts() {
  connection.query("SELECT dept_name FROM department", function (err, res) {
    if (err) throw err;
    let allDepts = res.map(dept => dept.dept_name);
    viewDept(allDepts);
  });
};

function viewDept(departments) {
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

// INSERTIONS
function add() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to add?",
        choices: [
          "Add a department",
          "Add a role",
          "Add an employee",
          "Return to main menu"
        ],
        name: "add"
      }
    ])
    .then((response) => {
      const { add } = response;
      switch (add) {
        case "Add a department":
          return addDept();
        case "Add a role":
          return addRoleFrom();
        case "Add an employee":
          return //insert emp query;
        case "Return to main menu":
          return menu();
      }
    });
}

function addDept() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Please enter the name of a department to add it to the database.",
        name: "addDept"
      }
    ])
    .then((response) => {
      const { addDept } = response;
      connection.query("INSERT INTO department SET ?", { dept_name: addDept }, function (err, res) {
        if (err) throw err;
        console.log(`You have successfully added a new department, ${addDept}, to your company database!`);
        getAllDepts();
      });
    });
}

function addRoleFrom() {
  connection.query("SELECT dept_name FROM department", function (err, res) {
    if (err) throw err;
    let allDepts = res.map(dept => dept.dept_name);
    addRole(allDepts);
  });
}

function addRole(departments) {
  inquirer
    .prompt([
      {
        type: "list",
        message: "You may only add roles to existing departments. Please select the department to which you would like to add a role first.",
        name: "roleDept",
        choices: departments
      },
      {
        type: "input",
        message: "Enter the role that you would like to add to this department.",
        name: "role"
      },
      {
        type: "input",
        message: "Enter the salary for that role.",
        name: "salary"
      }
    ]).then(response => {
      const { roleDept, role, salary } = response;
      connection.query("SELECT id FROM department WHERE dept_name=?", [roleDept], function (err, res) {
        if (err) throw err;
        let id = res[0].id;
        insert(role, salary, id, roleDept);
      });
    });
}

function insert(role, salary, id, roleDept) {
  let salaryInput = Number(salary);
  connection.query("INSERT INTO employee_role SET ?", [
    {
      title: role,
      salary: salaryInput,
      department_id: id
    },
  ], function (err, res) {
    if (err) throw err;
    console.log(`You have successfully added ${role} to the ${roleDept} department!`);
    console.log('');
    console.log(`${roleDept} Roles`)
    console.log('');
    connection.query("SELECT title, salary FROM employee_role AS er INNER JOIN department AS d ON er.department_id = d.id WHERE ?", [
      {
        department_id: id
      }
    ], function (err, res) {
      if (err) throw err;
      const allRoles = res;
      const table = cTable.getTable(allRoles);
      console.log(table);
      //TODO: Prompt them to add another role (general menu) or return to main menu
    });
  });
}


// MENU FUNCTIONS
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
          return add();
        case "View employees":
          return viewEmployees();
        case "Update employee roles":
          return; //function;
        case "Quit this menu":
          connection.end();
      }
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
          return getAllDepts();
        case "Return to main menu":
          menu();
      }
    });
}

connection.connect(function (err) {
  if (err) throw err;
});
