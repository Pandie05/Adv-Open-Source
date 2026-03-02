const gql = async (query, variables = {}) => {
  const res = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
};

const els = {
  deleteMsg: document.getElementById("deleteMsg"),
  formTitle: document.getElementById("formTitle"),
  empForm: document.getElementById("empForm"),
  empId: document.getElementById("empId"),
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  department: document.getElementById("department"),
  startDate: document.getElementById("startDate"),
  jobTitle: document.getElementById("jobTitle"),
  salary: document.getElementById("salary"),
  cancelBtn: document.getElementById("cancelBtn"),
  empTbody: document.getElementById("empTbody"),
};

function clearForm() {
  els.empId.value = "";
  els.empForm.reset();
  els.formTitle.textContent = "Add Employee";
}

function fillForm(emp) {
  els.empId.value = emp.id;
  els.firstName.value = emp.firstName;
  els.lastName.value = emp.lastName;
  els.department.value = emp.department;

  // startDate comes back as ISO string; keep YYYY-MM-DD
  const d = new Date(emp.startDate);
  els.startDate.value = d.toISOString().slice(0, 10);

  els.jobTitle.value = emp.jobTitle;
  els.salary.value = emp.salary;
  els.formTitle.textContent = "Edit Employee";
}

async function loadEmployees() {
  const data = await gql(`
    query {
      employees {
        id
        firstName
        lastName
        department
        startDate
        jobTitle
        salary
      }
    }
  `);

  els.empTbody.innerHTML = "";
  for (const emp of data.employees) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${emp.firstName} ${emp.lastName}</td>
      <td>${emp.department}</td>
      <td>${new Date(emp.startDate).toISOString().slice(0, 10)}</td>
      <td>${emp.jobTitle}</td>
      <td>$${Number(emp.salary).toFixed(2)}</td>
      <td>
        <button data-edit="${emp.id}">Edit</button>
        <button data-del="${emp.id}">Delete</button>
      </td>
    `;

    els.empTbody.appendChild(tr);
  }
}

els.empTbody.addEventListener("click", async (e) => {
  const editId = e.target.getAttribute("data-edit");
  const delId = e.target.getAttribute("data-del");

  if (editId) {
    const data = await gql(
      `query($id: ID!) { employee(id: $id) {
        id firstName lastName department startDate jobTitle salary
      } }`,
      { id: editId }
    );
    if (data.employee) fillForm(data.employee);
  }

  if (delId) {
    const ok = confirm("Delete this employee?");
    if (!ok) return;

    const data = await gql(
      `mutation($id: ID!) { deleteEmployee(id: $id) }`,
      { id: delId }
    );

    if (data.deleteEmployee) {
      els.deleteMsg.textContent = "Employee deleted successfully.";
      clearForm();
      await loadEmployees();
    }
  }
});

els.empForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  els.deleteMsg.textContent = "";

  const input = {
    firstName: els.firstName.value.trim(),
    lastName: els.lastName.value.trim(),
    department: els.department.value,
    startDate: els.startDate.value, // GraphQL Date scalar uses ISO; Apollo will accept this string
    jobTitle: els.jobTitle.value.trim(),
    salary: Number(els.salary.value),
  };

  const id = els.empId.value;

  if (!id) {
    await gql(
      `mutation($input: EmployeeInput!) { createEmployee(input: $input) { id } }`,
      { input }
    );
  } else {
    await gql(
      `mutation($id: ID!, $input: EmployeeInput!) {
        updateEmployee(id: $id, input: $input) { id }
      }`,
      { id, input }
    );
  }

  clearForm();
  await loadEmployees();
});

els.cancelBtn.addEventListener("click", () => {
  els.deleteMsg.textContent = "";
  clearForm();
});

loadEmployees().catch((e) => alert(e.message));