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
    token: String!
  }

  type Context {
    users: [User!]!
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

  type Query {
    getUsers: [User!]!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(loginInput: LoginInput): User!
    logout(logoutInput: LogoutInput): String!
  }

  type Subscription {
    userLoged: User!
    getOnlineUserCount: Int!
  }
`;
