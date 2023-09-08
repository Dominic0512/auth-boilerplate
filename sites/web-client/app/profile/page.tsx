'use client';
import { useForm } from 'react-hook-form';
import zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMe, useUpdateMyname } from '@/hooks/react-query/auth';

interface FormData {
  name: string;
}

const formSchema = zod.object({
  name: zod.string(),
});

export default function ProfilePage() {
  const me = useMe();
  const myNameMutation = useUpdateMyname();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    values: me.data,
    resolver: zodResolver(formSchema),
  });

  const onSubmit = handleSubmit(
    (data) => {
      myNameMutation.mutate(data);
    },
    (error) => console.error(error),
  );

  return (
    <div className="mt-36">
      <form className="flex justify-center" onSubmit={onSubmit}>
        <div className="w-96 flex flex-col gap-4">
          <div className="flex flex-col justify-center gap-2">
            <label className="grow">Email</label>
            <input
              className="w-full h-10"
              type="email"
              disabled
              value={me?.data?.email}
            ></input>
          </div>
          <div className="flex flex-col justify-center gap-2">
            <label className="grow">Name</label>
            <input
              className="w-full h-10"
              type="email"
              {...register('name')}
            ></input>
            <p className="text-red-500">{errors.name?.message}</p>
          </div>
          <button
            className="border border-white py-2"
            type="button"
            onClick={onSubmit}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
