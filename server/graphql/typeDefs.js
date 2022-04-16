const { gql } = require("apollo-server");

module.exports = gql`
  type Message {
    uid: String
    text: String
    createdByName: String
    createdByID: ID
    receiverID: ID
    timestamps: Number || String //// Number or String
  }

  type User {
    uid: String
    name: String
    email: String
    password:String
    timestamps: Number || String  //// Number or String
  }

    input GetMessageInput {
      senderID: ID
      receiverID: ID
    }

    input SendMessageInput {
        createdByName: String
        text: String
        senderID: ID
        receiverID: ID
    }

  input LoginInput {
      name: String
      email: String
    }

  input RegisterInput {
      name: String
      email: String
    }

  type Query {
    getUsers: [User!]!
    getMessage(messageInput: GetMessageInput!): Message
  }

  type Mutation {
      sendMessage(messageInput: SendMessageInput!): Message!
      login(loginInput: LoginInput): User!
      register(registerInput: RegisterInput): User!
  }

 type Subscription {
    messageSended(messageInput:SendMessageInput!): Message
  }
`;
