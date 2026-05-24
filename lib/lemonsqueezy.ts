const LS_API = 'https://api.lemonsqueezy.com/v1'

function lsHeaders() {
  return {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
  }
}

export async function createCheckoutUrl(userEmail: string, userId: string): Promise<string> {
  console.log('[LS Debug] Store ID:', process.env.LEMONSQUEEZY_STORE_ID)
  console.log('[LS Debug] Variant ID:', process.env.LEMONSQUEEZY_VARIANT_ID)
  console.log('[LS Debug] API Key starts with:', process.env.LEMONSQUEEZY_API_KEY?.slice(0, 10))
  const res = await fetch(`${LS_API}/checkouts`, {
    method: 'POST',
    headers: lsHeaders(),
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: { user_id: userId },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
            receipt_link_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: process.env.LEMONSQUEEZY_STORE_ID } },
          variant: { data: { type: 'variants', id: process.env.LEMONSQUEEZY_VARIANT_ID } },
        },
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`LemonSqueezy error ${res.status}: ${body}`)
  }

  const json = await res.json()
  return json.data.attributes.url as string
}
