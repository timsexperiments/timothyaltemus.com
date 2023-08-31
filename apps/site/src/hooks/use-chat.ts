import { getFromLocalStorage } from '@/localstorage';
import { useSocket } from '@/providers/socket-provider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Chat,
  ClientEventType,
  ServerEventType,
  createMessage,
  createServerEvent,
  deserializeChat,
  deserializeChatMembers,
  deserializeClientEvent,
  serializeServerEvent,
} from 'chat-messages';
import { useEffect } from 'react';

export const useChat = () => {
  const queryKey = 'chat';
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const actingUser = getFromLocalStorage('user')!;

  const chatQuery = useQuery([queryKey], {
    queryFn: async () =>
      await fetch(`${import.meta.env.VITE_CHAT_API_URL}/messages`)
        .then((response) => response.text())
        .then((chat) => deserializeChat(chat)),
  });

  socket?.addEventListener('message', ({ data }) => {
    const event = deserializeClientEvent(data);
    if (event.type === ClientEventType.CHAT) {
      queryClient.invalidateQueries([queryKey]);
    }
  });

  const addMessageMutation = useMutation({
    mutationFn: (content: string) => {
      const message = createMessage({ author: actingUser, content, createdAt: new Date() });
      socket?.send(
        serializeServerEvent(
          createServerEvent({ type: ServerEventType.MESSAGE, actingUser, message }),
        ),
      );
      return new Promise((resolve) => {
        socket?.addEventListener('message', ({ data }) => {
          const event = deserializeClientEvent(data);
          if (event.type === ClientEventType.CHAT) {
            resolve(undefined);
          }
        });
      });
    },
    onMutate: (content) => {
      const previousResult = queryClient.getQueryData<Chat>([queryKey]);
      queryClient.setQueryData<Chat>([queryKey], (oldData) => {
        queryClient.cancelQueries([queryKey]);
        const newMessage = createMessage({ author: actingUser, content, createdAt: new Date() });
        return {
          ...oldData,
          messages: [...(oldData?.messages ?? []), newMessage],
        };
      });
      return {
        previousResult,
      };
    },
    onError: (_error, _content, ctx) => {
      return ctx?.previousResult;
    },
    onSettled: () => {
      queryClient.invalidateQueries([queryKey]);
    },
  });

  return { chat: chatQuery, addMessage: addMessageMutation };
};

export const useChatMembers = () => {
  const queryKey = 'members';
  const { socket, isConnected } = useSocket();
  const memberQuery = useQuery([queryKey], {
    queryFn: async () =>
      await fetch(`${import.meta.env.VITE_CHAT_API_URL}/members`)
        .then((response) => response.text())
        .then((chat) => deserializeChatMembers(chat)),
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries([queryKey]);
  }, [isConnected, queryClient]);

  useEffect(() => {
    socket?.addEventListener('message', ({ data }) => {
      const event = deserializeClientEvent(data);
      if (event.type === ClientEventType.MEMBERS) {
        queryClient.invalidateQueries([queryKey]);
      }
    });
  }, [socket, queryClient]);

  return memberQuery;
};
