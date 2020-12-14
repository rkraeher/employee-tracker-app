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

//2. display my ascii image

// INITIATE APPLICATION
menu();

// VALIDATORS
const validateIsNumber = input => {
  if (!isNaN(input)) {
    return true;
  } else {
    console.log('\n', "Error: please enter a valid number for salary."); //TODO: Add chalk
  }
};

// VIEW QUERIES
function viewAllEmployees() {
  connection.query("SELECT e.id, first_name, last_name, title, salary, dept_name FROM employee AS e INNER JOIN employee_role AS er ON e.role_id = er.id INNER JOIN department AS d ON er.department_id = d.id ORDER BY dept_name ASC", function (err, res) {
    if (err) throw err;
    const allEmployees = res;
    const table = cTable.getTable(allEmployees);
    console.log('\n', table);
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
          return addEmpFrom();
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

// Initiate add employee procedure
function addEmpFrom() {
  connection.query("SELECT dept_name FROM department", function (err, res) {
    if (err) throw err;
    let allDepts = res.map(dept => dept.dept_name);
    addEmpTo(allDepts);
  });
}

function addEmpTo(departments) {
  inquirer
    .prompt([
      {
        type: "list",
        message: "To which department would you like to add an employee?",
        name: "newEmpDept",
        choices: departments
      },
    ])
    .then(response => {
      const { newEmpDept } = response;
      connection.query("SELECT title FROM employee_role AS er INNER JOIN department AS d ON d.dept_name = ? WHERE er.department_id = d.id", [newEmpDept], function (err, res) {
        if (err) throw err;
        let deptRoles = res.map(role => role.title);
        inquirer
          .prompt([
            {
              type: "list",
              message: "In what role are you adding this new employee?",
              name: "role",
              choices: deptRoles
            }
          ])
          .then(data => {
            const { role } = data;
            connection.query("SELECT id FROM employee_role WHERE title = ?", [role], function (err, res) {
              if (err) throw err;
              const id = res[0].id;
              addNewEmployee(id, role, newEmpDept);
            });
          });
      });
    });
}

function addNewEmployee(id, role, dept) {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Enter the new employee's LAST name.",
        name: "last_name"
      },
      {
        type: "input",
        message: "Enter the new employee's FIRST name.",
        name: "first_name"
      }
    ])
    .then(names => {
      const { last_name, first_name } = names;
      connection.query("INSERT INTO employee SET ?", [
        {
          first_name: first_name,
          last_name: last_name,
          role_id: id
        },
      ], function (err, res) {
        if (err) throw err;
        console.log('\n', `You have successfully added ${first_name} ${last_name} as a ${role} to the ${dept} department.`, '\n');
        viewAllEmployees();
      });
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
        name: "salary",
        validate: validateIsNumber
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
    console.log('\n', `You have successfully added ${role} to the ${roleDept} department!`);
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
      console.log("======================", '\n');
      inquirer
        .prompt([
          {
            type: "confirm",
            message: "Would you like to add another role?",
            name: "addAnother"
          },
        ])
        .then(answer => {
          if (answer === true) {
            addRoleFrom();
          } else {
            menu();
          }
        });
    });
  });
}

// UPDATE AN EMPLOYEE ROLE
function update() {
  connection.query("SELECT last_name, first_name FROM employee ORDER BY last_name ASC", function (err, res) {
    if (err) throw err;
    let allEmployees = res.map(({ last_name, first_name }) => (
      {
        name: last_name + " " + first_name,
        value: { last_name, first_name },
        short: first_name + " " + last_name
      }
    ));
    inquirer
      .prompt([
        {
          type: "list",
          message: "Which employee would you like to update?",
          name: "employee",
          choices: allEmployees
        }
      ])
      .then(response => {
        const { employee } = response;
        getRole(employee);
      })
  });
}

function getRole(employee) {
  connection.query("SELECT e.id, title, salary, dept_name FROM employee AS e INNER JOIN employee_role AS er ON e.role_id = er.id INNER JOIN department AS d ON er.department_id = d.id WHERE ? AND ?", [
    {
      last_name: employee.last_name,
    },
    {
      first_name: employee.first_name
    }
  ], function (err, res) {
    if (err) throw err;
    let employeeId = res[0].id;
    let currentRole = res[0].title;
    let dept = res[0].dept_name;
    allRoles(dept, currentRole, employee, employeeId);
  });
}

function allRoles(dept, role, employee, eId) {
  connection.query("SELECT er.id, title, salary FROM employee_role AS er INNER JOIN department AS d ON er.department_id = d.id WHERE d.dept_name = ?", [dept], function (err, res) {
    if (err) throw err;
    const currentRole = role;
    const employeeId = eId;
    const department = dept;
    const { title, salary, id } = res;
    const { first_name, last_name } = employee;
    const fullName = `${first_name} ${last_name}`;
    let allDeptRoles = res.map(({ title, salary, id }) => (
      {
        name: title,
        value: { title, salary, id },
        short: title
      }
    ));
    updateEmployee(currentRole, fullName, employeeId, allDeptRoles, department);
  });
}

function updateEmployee(role, name, id, allRoles, dept) {
  const department = dept;
  inquirer
    .prompt([
      {
        type: "list",
        message: `To what role are you reassigning ${role} ${name}?`,
        choices: allRoles,
        name: "newRole"
      }
    ])
    .then(response => {
      const { newRole } = response;
      connection.query("UPDATE employee AS e SET ? WHERE e.id = ?", [
        {
          role_id: newRole.id,
        },
        id
      ], function (err, res) {
        if (err) throw err;
        console.log(`You have updated employee ${name} to their new role, ${newRole.title}.`, '\n');
        const query = "SELECT e.id, first_name, last_name, title, salary, dept_name FROM employee AS e INNER JOIN employee_role AS er ON e.role_id = er.id INNER JOIN department AS d ON er.department_id = d.id WHERE dept_name=? ORDER BY title ASC";
        connection.query(query, [department], function (err, res) {
          if (err) throw err;
          const employeesByDept = res;
          const table = cTable.getTable(employeesByDept);
          console.log(table);
          menu();
        });
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
        case "Update employee role":
          return update();
        case "Quit this menu":
          console.log('\n', "Logging off Employee Tracker App.");
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
