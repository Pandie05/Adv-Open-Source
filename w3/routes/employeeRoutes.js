import express from "express";
import {
  showCreateForm,
  createEmployee,
  listEmployees,
  showEditForm,
  updateEmployee,
  deleteEmployee
} from "../controllers/employeeController.js";

const router = express.Router();

router.get("/", showCreateForm);
router.post("/employees", createEmployee);

router.get("/employees", listEmployees);

router.get("/employees/:id/edit", showEditForm);
router.put("/employees/:id", updateEmployee);

router.delete("/employees/:id", deleteEmployee);

export default router;
