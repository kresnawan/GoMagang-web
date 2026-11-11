import type { LoaderFunctionArgs } from 'react-router'
import { getTemplatSpDpa } from '../../services/templatSpDpa'

export async function loader({ request }: LoaderFunctionArgs) {
  return getTemplatSpDpa(request.signal)
}
