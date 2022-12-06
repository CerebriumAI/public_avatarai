import { Session, useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import Images from '../components/Images'
import UploadImages from '../components/UploadImages'
import { Database } from '../utils/database.types'

type Profiles = Database['public']['Tables']['profiles']['Row']

const StableDiffusion = ({ session }: { session: Session }) => {
  const supabase = useSupabaseClient<Database>()
  const user = useUser()
  const [processed, setProcessed] = useState<Profiles['processed']>([])
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false)

  supabase
  .channel('filePaths')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'filePaths' }, (payload:any) => {
    setProcessed([...processed, payload.new.filePath])
    setLoading(false);
  }).subscribe()

  const handlePromptChange = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const generateImages = async (prompt: string) => {
    setProcessed([])
    setLoading(true)
    const result = await fetch("<CEREBRIUM_EDGE_FUNCTION_URL>", {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer <AUTH_TOKEN>',
      },
      body: JSON.stringify({ 
        prompt: prompt
      })
    })

  }

  async function updateProfile({ unprocessed }: { unprocessed?: Profiles['unprocessed'] }) {
    try {
      setLoading(true)
      if (!user) throw new Error('No user')

      const updates = {
        id: user.id,
        unprocessed,
        updated_at: new Date().toISOString(),
      }

      let { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
    } catch (error) {
      alert('Error updating the data!')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-widget">
      <a href="https://www.cerebrium.ai">
        <img style={{
        width: "400px",
        margin: "auto",
        display: "flex"
        }}
        src="<CEREBRIUM_LOGO_URL>"/>
      </a>
      <h1 style={{'marginBottom': '0px' }}>Create your own <br/><span style={{ color: '#EB3A6F', }}>AI-generated</span> avatars</h1>
      <h4>See how we created this <a href="">here</a></h4>
      <textarea className="block" placeholder="A dog wearing a Christmas hat" style={{
          borderRadius: 3,
          border: "none",
          color: 'black',
          height: 80,
          background: "lightgray",
          padding: '5px 5px',
          fontSize: '22px',
          resize: 'none',
          'textAlign': 'center'
      }}
        value={prompt}
        onChange={handlePromptChange}>
      </textarea>
      <label className="button primary block" style={{ color: 'white', 'height': '40px' }} onClick={() => generateImages(prompt)}>
        {loading ? 'Generating' : 'Generate'}
      </label>
      <h3>Generated Images</h3>
      {loading ? 'Loading...' :  <Images urls={processed} />}
    </div>
  )
}
export default StableDiffusion
