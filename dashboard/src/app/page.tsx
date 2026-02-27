import { redirect } from 'next/navigation';

// Root route serves the landing page via middleware rewrite.
// This is a fallback in case the rewrite doesn't trigger.
export default function Home() {
  redirect('/landing.html');
}
