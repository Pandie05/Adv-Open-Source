const typeDefs = `#graphql
  scalar Date

  type Employee {
    id: ID!
    firstName: String!
    lastName: String!
    department: String!
    startDate: Date!
    jobTitle: String!
    salary: Float!
  }

  input EmployeeInput {
    firstName: String!
    lastName: String!
    department: String!
    startDate: Date!
    jobTitle: String!
    salary: Float!
  }

  type Query {
    employees: [Employee!]!
    employee(id: ID!): Employee
  }

  type Mutation {
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;