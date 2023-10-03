import { METRICS_URL } from '@workflow/constants'
import fetch from 'node-fetch'
import { getEventType } from '@workflow/features/registration/utils'
import { Bundle } from '@opencrvs/commons/types'

export async function createNewAuditEvent(bundle: Bundle, authToken: string) {
  const eventType = getEventType(bundle).toLowerCase()

  const res = await fetch(
    new URL(`/events/${eventType}/request-correction`, METRICS_URL).href,
    {
      method: 'POST',
      body: JSON.stringify(bundle),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    }
  )
  if (!res.ok) {
    throw new Error(
      `Writing an audit event to metrics failed with [${
        res.status
      }] body: ${await res.text()}`
    )
  }

  return res
}
