import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { clear } from 'console'
import { generateKey } from 'crypto'
import React, { useState } from 'react'
import { Database } from '../utils/database.types'

type Props = {
  onUpload?: (urls: string[]) => void
}

const UploadImages = ({ onUpload }: Props) => {
  const user = useUser()
  const supabase = useSupabaseClient<Database>()
  const [uploading, setUploading] = useState(false)

  const uploadImages: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const files = event.target.files
      const supabasePaths = []

      for (const file of files) {
        const uuid = Math.floor(Math.random() * 1000000)
        const fileExt = file.name.split('.').pop()
        const fileName = `${uuid}.${fileExt}`
        const filePath = `unprocessed/${user?.id}/${fileName}`
        supabasePaths.push(filePath)

        let { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file, { upsert: true })

        if (uploadError) {
          throw uploadError
        }
      }
      if (onUpload) {
        onUpload(supabasePaths)
      }
    } catch (error) {
      alert('Error uploading images!')
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ width: 150 }}>
      <label className='primary white'>Image prompt</label>
      <textarea style={{
          borderRadius: 3,
          border: "1px solid light-gray",
          color: 'white',
          height: 60,
          width: "500px",
          background: "transparent",
          padding: '5px 5px',
          fontSize: '17px',
          resize: 'none',
        
      }}></textarea>
      <label className="button primary block" htmlFor="images">
        {uploading ? 'Uploading ...' : 'Generate'}
      </label>
    </div>
  )
}
export default UploadImages
