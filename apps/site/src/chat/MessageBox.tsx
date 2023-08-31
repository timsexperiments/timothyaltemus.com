import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSocket } from '@/providers/socket-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import EmojiPicker from './EmojiPicker';

const messageFormSchema = z.object({
  message: z.string().nonempty(),
});
type MessageFormData = z.infer<typeof messageFormSchema>;

type MessageBoxProps = {
  onSendMessage: (content: string) => void;
};

export const MessageBox = ({ onSendMessage: sendMessage }: MessageBoxProps) => {
  const { isConnected } = useSocket();
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      message: '',
    },
  });
  const disabled = !isConnected;
  return (
    <Form {...form}>
      <form
        className="flex w-full gap-2"
        onSubmit={form.handleSubmit(({ message }) => {
          if (!isConnected) {
            return;
          }
          sendMessage(message);
          form.reset();
        })}>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex-1">
              <div className="flex rounded-md border border-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2">
                <FormControl>
                  <Input
                    className="border-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Message #everyone"
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <EmojiPicker onChange={(emoji) => console.log(emoji)} disabled={disabled} />
              </div>
            </FormItem>
          )}
        />
        <Button
          className="bg-lime-600 text-stone-50 hover:bg-lime-600/90 dark:bg-stone-50 dark:text-stone-600 dark:hover:bg-lime-50/90"
          disabled={disabled}>
          <svg
            className="-mt-px h-4 w-4 rotate-45 transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </Button>
      </form>
    </Form>
  );
};
