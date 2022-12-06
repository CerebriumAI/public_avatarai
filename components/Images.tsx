import { useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState } from 'react'
import { Database } from '../utils/database.types'

type Props = {
  urls: string[]
  size?: number
}

const Images = ({ urls, size = 150 }: Props) => {
  const supabase = useSupabaseClient<Database>()
  const [imageUrls, setImageUrls] = useState<string[]>([])

  useEffect(() => {
    if (urls?.length) downloadImages(urls)
  }, [urls])

  async function downloadImages(paths: string[]) {
    try {
      const urls = await Promise.all(
        paths.map(async (path) => {
          const data = await supabase.storage.from('images').download(`${path}`)
          if (!data.data) throw new Error('Something went wrong')
          return URL.createObjectURL(data.data)
        })
      )

      setImageUrls(urls)
    } catch (error) {
      console.log('Error downloading image: ', error)
    }
  }

  return (
    <div>
      {imageUrls.map((image) => (
        <img
          key={image}
          src={image}
          alt="Images"
          className="avatar image"
          style={{ height: size, width: size, marginRight: 20 }}
        />
      ))}
    </div>
  )
}
export default Images
