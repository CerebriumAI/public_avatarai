import { Session, useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Auth, ThemeSupa } from '@supabase/auth-ui-react'
import { SupabaseClient } from '@supabase/supabase-js'
import type { NextPage } from 'next'
import { useState } from 'react'
import Account from '../components/Account'
import Footer from '../components/Footer'
import StableDiffusion from './StableDiffusion'

const Home: NextPage = () => {
  const session = useSession()
  const supabase = useSupabaseClient()

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? <LoggedOut supabase={supabase} /> : <LoggedIn session={session} />}
      <Footer />
    </div>
  )
}

const LoggedIn = ({ session }: { session: Session }) => {
  const [page, setPage] = useState('stableDiffusion')

  const Button = () => (
    <button onClick={() => setPage(page === 'stableDiffusion' ? 'account' : 'stableDiffusion')}>
      {page === 'stableDiffusion' ? 'Manage Account' : 'Manage Stable Diffusion'}
    </button>
  )

  if (page === 'stableDiffusion') {
    return (
      <>
        {/* <Button /> */}
        <StableDiffusion session={session} />
      </>
    )
  }

  return (
    <>
      <Button />
      <Account session={session} />
    </>
  )
}

const LoggedOut = ({ supabase }: { supabase: SupabaseClient }) => {
  return (
    <div className="row">
      <div className="col-6">
        <h1 className="header">Supabase Auth + Storage</h1>
        <p className="">
          Experience our Auth and Storage through a simple profile management example. Create a user
          profile and upload an avatar image. Fast, simple, secure.
        </p>
      </div>
      <div className="col-6 auth-widget">
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" />
      </div>
    </div>
  )
}

export default Home
