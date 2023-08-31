import AvatarIcon from './avatar-icon';

export type ProfileProps = {
  avatar: string;
  username: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

export const Profile = ({ username, avatar, size = 'md' }: ProfileProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-stone-700 p-2 text-stone-100">
        <AvatarIcon avatar={avatar} size={size} />
      </span>
      <span>{username}</span>
    </div>
  );
};

export default Profile;
