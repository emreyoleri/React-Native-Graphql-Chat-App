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

  input userInput {
    _id: String!
    email: String!
  }

  type User {
    _id: String!
    name: String!
    email: String!
    password: String!
    timestamps: ID!
    isOnline: Boolean!
    token: String!
  }

  type ContextReturnUsers {
    name: String!
    email: String!
    _id: String!
  }

  type Context {
    _id: String!
    name: String!
    users: [ContextReturnUsers!]
    messages: [Message]
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input LogoutInput {
    email: String!
    password: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input ContextInput {
    name: String!
    users: [userInput]
  }

  type Query {
    getUsers: [User!]!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(loginInput: LoginInput): User!
    logout(logoutInput: LogoutInput): String!
    createContext(contextInput: ContextInput): Context!
  }

  type Subscription {
    userLoged: User!
    getOnlineUserCount: Int!
  }
`;
