// =====================================================================
// Roles Decorator - Custom decorator for role-based access
// =====================================================================

import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
