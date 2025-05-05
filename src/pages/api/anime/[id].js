import { got } from 'got'

export async function get({ params }) {
  const { id } = params

  try {
    const response = await got(`https://api.bgm.tv/v0/subjects/${id}`, {
      headers: {
        accept: 'application/json',
      },
    }).json()

    return new Response(JSON.stringify({
      title: response.name,
      chineseTitle: response.name_cn,
      image: response.images?.small || '',
      rating: response.rating?.score || 'N/A',
      summary: response.summary || '',
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
  catch (error) {
    console.error(`Failed to fetch anime data for ID ${id}:`, error)
    return new Response(JSON.stringify({ error: 'Failed to fetch anime data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
