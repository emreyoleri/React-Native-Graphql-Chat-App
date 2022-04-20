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

  type UserContext {
    name: String!
    _id: String!
  }

  type User {
    _id: String!
    name: String!
    email: String!
    password: String!
    timestamps: ID!
    isOnline: Boolean!
    token: String!
    contexts: [UserContext]
  }

  type UserBasicInfo {
    _id: String!
    name: String!
    email: String!
    isOnline: Boolean!
  }

  type ContextReturnUsers {
    name: String!
    email: String!
    _id: String!
    isAdmin: Boolean!
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

  input DeleteContextInput {
    _id: String!
  }

  input LeaveContextInput {
    _id: String!
  }

  input KickUserOutContextInput {
    contextID: String!
    userID: String!
  }

  type Query {
    getUsers: [User!]!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(loginInput: LoginInput): User!
    otoLogin: User!
    logout(logoutInput: LogoutInput): String!
    createContext(contextInput: ContextInput): Context!
    deleteContext(deleteContextInput: DeleteContextInput): String!
    leaveContext(leaveContextInput: LeaveContextInput): String!
    kickUserOutContext(
      kickUserOutContextInput: KickUserOutContextInput
    ): String!
  }

  type Subscription {
    userLoged: UserBasicInfo!
    getOnlineUserCount: Int!
  }
`;
