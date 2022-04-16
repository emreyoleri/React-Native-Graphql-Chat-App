const { gql } = require("apollo-server");

module.exports = gql`
  type Message {
    _id: String!
    text: String!
    createdByName: String!
    createdByID: ID!
    receiverID: ID!
    timestamps: ID!
  }

  type User {
    _id: String!
    name: String!
    email: String!
    password: String!
    timestamps: ID!
    isOnline: Boolean!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  type Query {
    getUsers: [User!]!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(loginInput: LoginInput): User!
  }

  type Subscription {
    userLoged: User!
    getOnlineUserCount: Int!
  }
`;
