import { getFromLocalStorage } from '@/localstorage';
import { useNavigate } from '@tanstack/react-router';
import { SocketProvider } from '../providers/socket-provider';
import Chat from './Chat';
import ChatMembers from './ChatMembers';

export const ChatLayout = () => {
  const navigate = useNavigate();

  const user = getFromLocalStorage<{ avatar: string; username: string }>('user');
  if (!user) {
    navigate({ to: '/' });
  }
  return (
    <SocketProvider>
      <div className="h-full">
        <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-stone-900 px-6 text-stone-50">
            <div className="flex h-16 shrink-0 items-center justify-between pt-4">
              <svg
                className="h-10 w-10 text-lime-600"
                fill="currentColor"
                aria-hidden="true"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                height="1em"
                viewBox="0 0 512 512">
                <path d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3 0 0 0 0 0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
              </svg>
            </div>
            <nav className="flex flex-1 flex-col">
              <ChatMembers />
            </nav>
          </div>
        </div>

        <main className="h-full py-10 pl-72">
          <Chat />
        </main>
      </div>
    </SocketProvider>
  );
};

export default ChatLayout;
