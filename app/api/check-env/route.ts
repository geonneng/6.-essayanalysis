import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL_exists: Boolean(url),
    NEXT_PUBLIC_SUPABASE_ANON_KEY_exists: Boolean(anon),
    NEXT_PUBLIC_SUPABASE_URL_sample: url ? `${url.slice(0, 24)}...` : null,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_len: anon ? anon.length : 0,
  })
}



