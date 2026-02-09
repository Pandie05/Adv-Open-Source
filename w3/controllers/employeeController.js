import Employee from "../models/Employee.js";

const DEPARTMENTS = ["Engineering", "HR", "Finance"]; // dropdown (3 minimum)

export function showCreateForm(req, res) {
  res.render("index", { title: "Create", departments: DEPARTMENTS });
}

export async function createEmployee(req, res) {
  try {
    const { firstName, lastName, department, startDate, jobTitle, salary } = req.body;

    await Employee.create({
      firstName,
      lastName,
      department,
      startDate,
      jobTitle,
      salary: Number(salary)
    });

    res.redirect("/employees");
  } catch (err) {
    res.status(400).render("index", {
      title: "Create",
      departments: DEPARTMENTS,
      error: "could not create employee",
      form: req.body
    });
  }
}

export async function listEmployees(req, res) {
  const employees = await Employee.find().sort({ createdAt: -1 }).lean();
  res.render("employees", { title: "Employees", employees });
}

export async function showEditForm(req, res) {
  const employee = await Employee.findById(req.params.id).lean();
  if (!employee) return res.status(404).send("employee not found");

  const startDateISO = employee.startDate
    ? new Date(employee.startDate).toISOString().slice(0, 10)
    : "";

  res.render("edit", {
    title: "Update",
    employee: { ...employee, startDateISO },
    departments: DEPARTMENTS
  });
}

export async function updateEmployee(req, res) {
  try {
    const { firstName, lastName, department, startDate, jobTitle, salary } = req.body;

    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        department,
        startDate,
        jobTitle,
        salary: Number(salary)
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).send("employee not found");

    res.redirect("/employees");
  } catch (err) {
    res.status(400).send("update failed");
  }
}

export async function deleteEmployee(req, res) {
  const deleted = await Employee.findByIdAndDelete(req.params.id).lean();
  if (!deleted) return res.status(404).send("employee not found");

  res.render("deleted", {
    title: "Deleted",
    message: `deleted ${deleted.firstName} ${deleted.lastName}`
  });
}
