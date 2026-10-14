import { ButtonLink, EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      action={<ButtonLink to="/">Back to events</ButtonLink>}
    />
  )
}
