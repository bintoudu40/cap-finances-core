import { registerAs } from '@nestjs/config';

export default registerAs('team', () => ({
  // Blank/unset = unlimited. Set per-client via `bchost seats <client> <n>`.
  maxSeats: process.env.MAX_TEAM_SEATS
    ? parseInt(process.env.MAX_TEAM_SEATS, 10)
    : null,
}));
