const Employee = require("../models/Employee");

const resolvers = {
  Query: {
    employees: async () => Employee.find().sort({ createdAt: -1 }),
    employee: async (_, { id }) => Employee.findById(id),
  },
  Mutation: {
    createEmployee: async (_, { input }) => {
      const emp = await Employee.create(input);
      return emp;
    },
    updateEmployee: async (_, { id, input }) => {
      const emp = await Employee.findByIdAndUpdate(id, input, { new: true, runValidators: true });
      if (!emp) throw new Error("Employee not found");
      return emp;
    },
    deleteEmployee: async (_, { id }) => {
      const res = await Employee.findByIdAndDelete(id);
      return Boolean(res);
    },
  },
};

module.exports = resolvers;