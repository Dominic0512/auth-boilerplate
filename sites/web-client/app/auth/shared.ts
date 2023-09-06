import zod from 'zod';

export const passwordRule = zod
  .string()
  .min(8)
  .regex(new RegExp('.*[A-Z].*'), 'At least one uppercase character')
  .regex(new RegExp('.*[a-z].*'), 'At least one lowercase character')
  .regex(
    new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
    'At least one special character',
  )
  .regex(new RegExp('.*\\d.*'), 'One number');
