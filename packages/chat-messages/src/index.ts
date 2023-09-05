import { chat, google } from './generated/chat';

const { Chat, ChatMembers, ClientEvent, Message, ServerEvent, TypingMetadata, User } = chat;
export type Chat = chat.IChat;
export type ChatMembers = chat.IChatMembers;
export type ClientEvent = chat.IClientEvent;
export type Message = chat.IMessage;
export type ServerEvent = chat.IServerEvent;
export type TypingMetadata = chat.ITypingMetadata;
export type User = chat.IUser;
const ClientEventType = ClientEvent.Type;
const ServerEventType = ServerEvent.Type;
export {
  Chat as ChatProto,
  ClientEvent as ClientEventProto,
  ClientEventType,
  Message as MessageProto,
  ServerEvent as ServerEventProto,
  ServerEventType,
  TypingMetadata as TypingMetadataProto,
  User as UserProto,
};

/** Creates a chat proto. */
export const createChat = Chat.create;

/** Creates a chat members proto. */
export const createChatMembers = ChatMembers.create;

/** Creates a server event proto to send to the client. */
export const createClientEvent = ClientEvent.create;

/** Creates a client event proto to send to the server. */
export const createServerEvent = ({ metadata = {}, ...event }: Partial<ServerEvent> = {}) =>
  ServerEvent.create({ ...event, metadata });

/** Creates a message proto. */
export const createMessage = ({
  editedAt,
  createdAt,
  ...message
}: Omit<Partial<Message>, 'createdAt' | 'editedAt'> & { createdAt: Date; editedAt?: Date }) => {
  let protoEditedAt: google.protobuf.ITimestamp | undefined;
  if (editedAt) {
    protoEditedAt = toProtoTimestamp(editedAt);
  }
  return Message.create({
    ...message,
    createdAt: toProtoTimestamp(createdAt),
    editedAt: protoEditedAt,
  });
};

/** Creates a typing metadata proto. */
export const createTypingMetadata = TypingMetadata.create;

/** Creates a user proto. */
export const createUser = User.create;

/** Serializes a Chat proto into a string. */
export const serializeChat = (chat: Chat) => {
  return String.fromCharCode(...Chat.encode(chat).finish());
};

/** Serializes a ChatMembers proto into a string. */
export const serializeChatMembers = (chatMembers: ChatMembers) => {
  return String.fromCharCode(...ChatMembers.encode(chatMembers).finish());
};

/** Serializes a Client Event proto into a string. */
export const serializeClientEvent = (event: ClientEvent) => {
  return String.fromCharCode(...ClientEvent.encode(event).finish());
};

/** Serializes a Message proto into a string. */
export const serializeMessage = (message: Message) => {
  return String.fromCharCode(...Message.encode(message).finish());
};

/** Serializes a ServerEvent proto into a string. */
export const serializeServerEvent = (event: ServerEvent) => {
  return String.fromCharCode(...ServerEvent.encode(event).finish());
};

/** Serializes a User proto into a string. */
export const serializeTypingMetadata = (typingMetadata: TypingMetadata) => {
  return String.fromCharCode(...TypingMetadata.encode(typingMetadata).finish());
};

/** Serializes a User proto into a string. */
export const serializeUser = (user: User) => {
  return String.fromCharCode(...User.encode(user).finish());
};

/**
 * Deserializes a serialized string into a Chat proto.
 *
 * The serialized message must represent a Chat proto.
 */
export const deserializeChat = (serialized: string): Chat => {
  return Chat.decode(Uint8Array.from(serializedStringToUInt8(serialized))).toJSON();
};

/**
 * Deserializes a serialized string into a ChatMembers proto.
 *
 * The serialized message must represent a ChatMembers proto.
 */
export const deserializeChatMembers = (serialized: string): ChatMembers => {
  return ChatMembers.decode(Uint8Array.from(serializedStringToUInt8(serialized))).toJSON();
};

/**
 * Deserializes a serialized string into an Event proto.
 *
 * The serialized message must represent an Event proto.
 */
export function deserializeServerEvent(serialized: string): ServerEvent {
  return ServerEvent.decode(Uint8Array.from(serializedStringToUInt8(serialized))).toJSON();
}

/**
 * Deserializes a serialized string into a ClientEvent proto.
 *
 * The serialized message must represent an Event proto.
 */
export function deserializeClientEvent(serialized: string): ClientEvent {
  return ClientEvent.decode(Uint8Array.from(serializedStringToUInt8(serialized))).toJSON();
}

/**
 * Deserializes a serialized string into a Message proto.
 *
 * The serialized message must represent a Message proto.
 */
export function deserializeMessage(serialized: string): Message {
  return Message.decode(Uint8Array.from(serializedStringToUInt8(serialized))).toJSON();
}

/**
 * Deserializes a serialized string into a User proto.
 *
 * The serialized message must represent a User proto.
 */
export function deserializeTypingMetadata(serialized: string): TypingMetadata {
  return TypingMetadata.decode(Uint8Array.from(serializedStringToUInt8(serialized))).toJSON();
}

/**
 * Deserializes a serialized string into a User proto.
 *
 * The serialized message must represent a User proto.
 */
export function deserializeUser(serialized: string): User {
  return User.decode(Uint8Array.from(serializedStringToUInt8(serialized))).toJSON();
}

/** Converts a string to the UInt8 array. */
export function serializedStringToUInt8(serialized: string) {
  const uint8 = new Uint8Array(serialized.length);
  for (let i = 0; i < serialized.length; i++) {
    uint8[i] = serialized.charCodeAt(i);
  }
  return uint8;
}

/** Converts a date to a google.protobuf.Timestamp. */
export function toProtoTimestamp(date: Date): google.protobuf.ITimestamp {
  return google.protobuf.Timestamp.create({
    seconds: date.getTime() / 1000,
    nanos: (date.getTime() % 1000) * 1e6,
  });
}

/** Converts a google.protobuf.Timestamp to a JavaScript date. */
export function toDate(timestamp: google.protobuf.ITimestamp): Date {
  return new Date(
    parseInt(timestamp?.seconds?.toString() ?? '0') * 1000 + (timestamp?.nanos ?? 0) / 1e6,
  );
}
