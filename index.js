const mysql = require("mysql");
const inquirer = require("inquirer");

// Import and require mysql2
const mysql = require("mysql2");

// Connect to database
const db = mysql.createConnection(
  {
    host: "127.0.0.1",
    // MySQL username,
    user: "root",
    // TODO: Add MySQL password here
    password: "$777Flatland999$",
    database: "company_db",
  }
);


// function which prompts the user for what action they should take
function firstPrompt() {

  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "Which query would you like to run",
      choices: [
        "See Employees",
        "Display Employees by Department",
        "Add An Employee",
        "Remove Employees",
        "Update Employee Role",
        "Add Role",
        
        ]
    })
    .then(function ({ task }) {
      switch (task) {
        case "See Employees":
          displayEmployee();
          break;
        case "Display Employees by Department":
          EmployeeByDepartment();
          break;

        case "Add An Employee":
          addEmployee();
          break;
        case "Remove Employees":
          removeEmployees();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "Add Role":
          addRole();
          break;
      }
    });
}



function displayEmployee() {
  console.log("The Current Employees");

  var query =
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  LEFT JOIN employee m
	ON m.id = e.manager_id`

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("seen");

    firstPrompt();
  });
 
}




function EmployeeByDepartment() {
  console.log("Employees in Departments");

  var query =
    `SELECT d.id, d.name, r.salary AS budget
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  GROUP BY d.id, d.name`

  connection.query(query, function (err, res) {
    if (err) throw err;

   

    const departmentChoices = res.map(data => ({
      value: data.id, name: data.name
    }));

    console.table(res);
    console.log("seen");

    promptDepartment(departmentChoices);
  });

}



function promptDepartment(departmentChoices) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Which department would you choose?",
        choices: departmentChoices
      }
    ])
    .then(function (answer) {
      console.log("answer ", answer.departmentId);

      var query =
        `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department 
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  WHERE d.id = ?`

      connection.query(query, answer.departmentId, function (err, res) {
        if (err) throw err;

        console.table("response ", res);
        console.log(res.affectedRows + "seen");

        firstPrompt();
      });
    });
}





function addEmployee() {
  console.log("added employee")

  var query =
    `SELECT r.id, r.title, r.salary 
      FROM role r`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const selection = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`
    }));

    console.table(res);
   //creation of the http request from the add employee query

    promptInsert(selection);
  });
}

function promptInsert(roleChoices) {

  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?"
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?"
      },
      {
        type: "list",
        name: "roleId",
        message: "What is the employee's role?",
        choices: roleChoices
      },
    
    ])
    .then(function (answer) {
      console.log(answer);

      var query = `INSERT INTO employee SET ?`
    
      connection.query(query,
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.roleId,
          manager_id: answer.managerId,
        },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.insertedRows + "success!");

          firstPrompt();
        });
      
    });
}


function removeEmployees() {
  console.log("Employee removed");

  var query =
    `SELECT e.id, e.first_name, e.last_name
      FROM employee e`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const deleteEmployeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${id} ${first_name} ${last_name}`
    }));

    console.table(res);


    promptDelete(deleteEmployeeChoices);
  });
}


function promptDelete(deleteEmployeeChoices) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to remove?",
        choices: deleteEmployeeChoices
      }
    ])
    .then(function (answer) {

      var query = `DELETE FROM employee WHERE ?`;
   
      connection.query(query, { id: answer.employeeId }, function (err, res) {
        if (err) throw err;

        console.table(res);
        console.log(res.affectedRows + "Deleted!\n");

        firstPrompt();
      });

    });
}



function updateEmployeeRole() { 
  employeeArray();

}

function employeeArray() {
  console.log("Employee updated.");

  var query =
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  JOIN employee m
	ON m.id = e.manager_id`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${first_name} ${last_name}`      
    }));

    console.table(res);
  

    roleList(employeeChoices);
  });
}

function roleList(employeeChoices) {
  console.log("role updated");

  var query =
    `SELECT r.id, r.title, r.salary 
  FROM role r`
  let roleChoices;

  connection.query(query, function (err, res) {
    if (err) throw err;

    roleChoices = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`      
    }));

    console.table(res);
   

    promptEmployeeRole(employeeChoices, roleChoices);
  });
}

function promptEmployeeRole(employeeChoices, roleChoices) {

  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee do you want to set with the role?",
        choices: employeeChoices
      },
      {
        type: "list",
        name: "roleId",
        message: "Which role do you want to update?",
        choices: roleChoices
      },
    ])
    .then(function (answer) {

      var query = `UPDATE employee SET role_id = ? WHERE id = ?`
   
      connection.query(query,
        [ answer.roleId,  
          answer.employeeId
        ],
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log(res.affectedRows + "success!");

          firstPrompt();
        });
      
    });
}





function addRole() {

  var query =
    `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    JOIN role r
    ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    GROUP BY d.id, d.name`

  connection.query(query, function (err, res) {
    if (err) throw err;

   
    const departmentChoices = res.map(({ id, name }) => ({
      value: id, name: `${id} ${name}`
    }));

    console.table(res);
    console.log("Department array!");

    promptAddRole(departmentChoices);
  });
}

function promptAddRole(departmentChoices) {

  inquirer
    .prompt([
      {
        type: "input",
        name: "roleTitle",
        message: "Role title?"
      },
      {
        type: "input",
        name: "roleSalary",
        message: "Role Salary"
      },
      {
        type: "list",
        name: "departmentId",
        message: "Department?",
        choices: departmentChoices
      },
    ])
    .then(function (answer) {

      var query = `INSERT INTO role SET ?`

      connection.query(query, {
        title: answer.title,
        salary: answer.salary,
        department_id: answer.departmentId
      },
        function (err, res) {
          if (err) throw err;

          console.table(res);
          console.log("Insertion!");

          firstPrompt();
        });

    });
}

``
module.exports = db