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
      className="relative w-full h-full rounded-full btn-outline border-2 overflow-hidden"
      onClick={onClick}
    >
      <Image width={100} height={100} src={src} alt="avatar" />
    </button>
  );
}
