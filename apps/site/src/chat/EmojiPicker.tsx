import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import emojiData from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

type EmojiPickerProps = {
  disabled?: boolean;
  onChange: (value: string) => void;
};

export const EmojiPicker = ({ onChange, disabled }: EmojiPickerProps) => {
  return (
    <Popover>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="mb-20 border-none bg-transparent shadow-none drop-shadow-none">
        <Picker
          theme="light"
          data={emojiData}
          onEmojiSelect={({ native }: { native: string }) => onChange(native)}
        />
      </PopoverContent>
      <PopoverTrigger
        className="px-2 text-stone-500 disabled:cursor-not-allowed disabled:text-stone-500/60"
        disabled={disabled}>
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </PopoverTrigger>
    </Popover>
  );
};

export default EmojiPicker;
