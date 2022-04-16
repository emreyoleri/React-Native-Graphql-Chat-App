const { gql } = require("apollo-server");

module.exports = gql`
  type Message {
    text: String
    createdByName: String
    createdByID: ID
    receiverID: ID
    timestamps: ID
  }

  type User {
    _id: String
    name: String
    email: String
    password: String
    timestamps: ID
  }

  input RegisterInput {
    name: String
    email: String
    password: String
  }

  type Query {
    getUsers: [User!]!
  }

  type Mutation {
    register(registerInput: RegisterInput): User
  }
`;
