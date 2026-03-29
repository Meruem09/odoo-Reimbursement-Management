/**
 * Backend auth guard for Route Handlers — verify JWT (cookie or Bearer).
 */
export {
  getAuthUserId,
  requireUserId,
} from "../api-auth";
