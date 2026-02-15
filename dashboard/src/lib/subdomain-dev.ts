/**
 * Local Development Subdomain Testing Guide
 *
 * To test subdomains locally:
 *
 * 1. Edit your /etc/hosts file (requires sudo):
 *    sudo nano /etc/hosts
 *
 * 2. Add entries for your test subdomains:
 *    127.0.0.1 tony-barber.localhost
 *    127.0.0.1 janes-salon.localhost
 *    127.0.0.1 test-business.localhost
 *
 * 3. Save and close the file
 *
 * 4. Make sure NEXT_PUBLIC_ROOT_DOMAIN is set in .env.local:
 *    NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
 *
 * 5. Access your subdomain at:
 *    http://tony-barber.localhost:3000
 *
 * Note: Some browsers (like Chrome) may have issues with .localhost domains.
 * If so, try Firefox or add the port to the hosts entry.
 *
 * For production:
 *    NEXT_PUBLIC_ROOT_DOMAIN=redpine.systems
 *
 * Production URLs will be:
 *    https://tony-barber.redpine.systems
 */

// Environment variable configuration:
//
// Development (.env.local):
//   NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
//
// Production (.env.production):
//   NEXT_PUBLIC_ROOT_DOMAIN=redpine.systems
//
// The extractSubdomain function in subdomain.ts uses this variable
// to correctly parse subdomains in both environments.

export const DEV_SETUP_COMPLETE = true;
