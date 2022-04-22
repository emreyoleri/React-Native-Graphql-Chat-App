const { gql } = require("apollo-server");

module.exports = gql`
  type Message {
    _id: String!
    text: String!
    contextID: ID!
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

  type UserTwoPersonContext {
    _id: String!
    userID: String!
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
    twoPersonContext: [UserTwoPersonContext]
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
    createdAt: ID!
    createdBy: String!
  }

  type TwoPersonContextReturnUsers {
    name: String!
    email: String!
    _id: String!
  }

  type TwoPersonContext {
    _id: String!
    users: [TwoPersonContextReturnUsers!]
    messages: [Message]
  }
  type MyContexts {
    contexts: [Context]
    twoPersonContexts: [TwoPersonContext]
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

  input AddUserToContextInput {
    contextID: String!
    userID: String!
  }

  input KickUserOutContextInput {
    contextID: String!
    userID: String!
  }

  input MakeAnAdminInput {
    contextID: String!
    userID: String!
  }

  input QuitAdminInput {
    contextID: String!
    userID: String!
  }

  input SendMessageInput {
    contextID: String!
    text: String!
  }

  type Query {
    getUsers: [User!]!
    getMyContexts: MyContexts!
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(loginInput: LoginInput): User!
    otoLogin: User!
    logout(logoutInput: LogoutInput): String!

    createContext(contextInput: ContextInput): Context!
    createTwoPersonContext(userId: ID!): TwoPersonContext!
    deleteContext(deleteContextInput: DeleteContextInput): String!
    leaveContext(leaveContextInput: LeaveContextInput): String!
    addUserToContext(addUserToContextInput: AddUserToContextInput): String!
    kickUserOutContext(
      kickUserOutContextInput: KickUserOutContextInput
    ): String!
    makeAnAdmin(makeAnAdminInput: MakeAnAdminInput): String!
    quitAdmin(quitAdminInput: QuitAdminInput): String!

    sendMessage(sendMessageInput: SendMessageInput): Message!
  }

  type Subscription {
    userLoged: UserBasicInfo!
    getOnlineUserCount: Int!
  }
`;
