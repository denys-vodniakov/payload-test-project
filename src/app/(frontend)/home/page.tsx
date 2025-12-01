import { redirect } from 'next/navigation'

// Redirect /home to root for cleaner URLs
export default function HomeRedirect() {
  redirect('/')
}
