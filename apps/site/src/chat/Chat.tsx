import Profile from '@/components/profile';
import { Separator } from '@/components/ui/separator';
import { useChat } from '@/hooks/use-chat';
import { formatDate } from '@/lib/date';
import { getFromLocalStorage } from '@/localstorage';
import { useSocket } from '@/providers/socket-provider';
import { Message, User, toDate } from 'chat-messages';
import { MessageBox } from './MessageBox';

export const Chat = () => {
  const { isConnected } = useSocket();
  const {
    chat: { data: chat, isInitialLoading: isChatLoading, isError: isChatError },
    addMessage: { mutate: sendMessage },
  } = useChat();

  return (
    <div className="flex h-full flex-col-reverse justify-end px-8 sm:px-6">
      <MessageBox onSendMessage={sendMessage} />
      <Separator className="my-2" />
      <div className="relative flex-1">
        <Messages messages={chat?.messages ?? []} isLoading={isChatLoading} isError={isChatError} />
      </div>
      <Separator className="my-2" />
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
              <span>Online</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-red-700"></span>
              <span>Offline</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

type MessagesProps = {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
};

export const Messages = ({ messages, isLoading, isError }: MessagesProps) => {
  const { username } = getFromLocalStorage<User>('user') ?? {};
  if (isLoading) {
    return (
      <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
        <div
          className="inline-block h-24 w-24 animate-spin rounded-full border-[8px] border-solid border-current border-lime-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>There was an error fetching the messages.</div>;
  }

  if (!messages.length) {
    return <p>There are no messages.</p>;
  }

  return messages.map(({ content, author, createdAt, editedAt, id }) => {
    const isCurrentUser = username === author?.username;
    return (
      <div
        key={id}
        className={['flex p-2', isCurrentUser ? 'justify-end' : 'justify-start'].join(' ')}>
        <div
          className={[
            'flex max-w-md flex-col gap-2 rounded-md border p-2',
            isCurrentUser
              ? 'border border-slate-600 bg-slate-500 text-white'
              : 'border-stone-500 bg-stone-300',
          ].join(' ')}>
          <div className="flex w-full items-start justify-between gap-x-8">
            <Profile username={author!.username!} avatar={author!.avatar!} size="xs" />
            <span className="text-xs">
              {editedAt
                ? 'Edited - ' + formatDate(toDate(editedAt))
                : formatDate(toDate(createdAt!))}
            </span>
          </div>
          <p className="w-full whitespace-break-spaces">{content}</p>
        </div>
      </div>
    );
  });
};

export default Chat;
