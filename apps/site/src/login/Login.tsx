import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { getFromLocalStorage, setToLocalStorage } from '../localstorage';

const loginFormSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters long.'),
  avatar: z.enum(['astronaut', 'secret', 'tie', 'nurse', 'basic', 'ninja', 'poo', 'doctor']),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      avatar: 'basic',
      username: '',
    },
  });

  function onSubmit({ username, avatar }: LoginFormData) {
    setToLocalStorage('user', { username, avatar });
    navigate({ to: '/chat' });
  }

  const savedUsername = getFromLocalStorage<{ username: string }>('user')?.username;

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Join the chat server
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      className="focus-visible:ring-lime-600"
                      type="text"
                      required
                      placeholder="username"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>This is your public display name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <Input
                      className="focus-visible:ring-lime-600"
                      type="text"
                      required
                      placeholder="avatar"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>This is your display for your profile.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Button
                type="submit"
                className="flex w-full justify-center rounded-md bg-lime-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-lime-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600">
                Sign in
              </Button>
            </div>
          </form>
        </Form>

        {savedUsername && (
          <p className="mt-10 text-center text-sm text-gray-500">
            Are you {savedUsername}?&nbsp;
            <Link to="/chat" className="font-semibold leading-6 text-lime-600 hover:text-lime-500">
              Go to the chat!
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
