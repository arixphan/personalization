import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS } from '@personalization/shared';

export const PERMISSION_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
