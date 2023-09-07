import Image from 'next/image';

interface AvatarProps {
  imageUrl?: string;
  name?: string;
  onClick?: () => void;
}

export default function Avatar({ imageUrl, name, onClick }: AvatarProps) {
  const shortName = (name ? name : 'guest').slice(0, 2);
  const dummyImageUrl = `https://avatars.dicebear.com/api/initials/${shortName}.svg`;
  const src = imageUrl ? imageUrl : dummyImageUrl;
  return (
    <button
      className="relative w-12 h-12 overflow-hidden rounded-full border-black hover:border-gray-300 dark:border-white dark:hover:border-gray-500 inline-flex items-center justify-center border-2 transition focus:outline-none"
      onClick={onClick}
    >
      <Image width={100} height={100} src={src} alt="avatar" />
    </button>
  );
}
