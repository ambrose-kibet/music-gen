import { OwnershipMeta } from './types';

export const OWNERSHIP_METADATA_KEY = 'ownership';

import { SetMetadata } from '@nestjs/common';

export const CheckOwnership = (meta: OwnershipMeta) =>
  SetMetadata(OWNERSHIP_METADATA_KEY, meta);
