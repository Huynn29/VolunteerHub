import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function EventWall({ eventId }) {
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')

  async function load() {
    const { data } = await api.get('/posts')
    const list = data.posts?.filter(p => !eventId || p.eventId === eventId) || []
    setPosts(list)
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 5000) // simple polling
    return () => clearInterval(t)
  }, [eventId])

  async function createPost(e) {
    e.preventDefault()
    if (!content.trim()) return
    await api.post('/posts', { content, eventId })
    setContent('')
    load()
  }

  async function likePost(id) {
    await api.post(`/posts/${id}/like`)
    load()
  }

  async function commentPost(id, text) {
    if (!text.trim()) return
    await api.post(`/posts/${id}/comment`, { content: text })
    load()
  }

  return (
    <div className="mt-6">
      <form onSubmit={createPost} className="flex space-x-2">
        <input className="flex-1 border p-2 rounded" placeholder="Chia sẻ điều gì đó..." value={content} onChange={(e)=>setContent(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 rounded">Đăng</button>
      </form>
      <div className="space-y-3 mt-4">
        {posts.map(p => (
          <div key={p._id} className="bg-white p-4 rounded shadow">
            <p>{p.content}</p>
            <div className="text-sm text-gray-600 mt-1">{new Date(p.createdAt).toLocaleString()}</div>
            <div className="flex items-center space-x-4 mt-2">
              <button className="text-blue-600" onClick={()=>likePost(p._id)}>Thích ({p.likes?.length || 0})</button>
              <details>
                <summary className="cursor-pointer text-gray-700">Bình luận ({p.comments?.length || 0})</summary>
                <ul className="mt-2 space-y-1">
                  {(p.comments||[]).map((c, i) => (
                    <li key={i} className="text-sm"><span className="text-gray-600">{new Date(c.createdAt).toLocaleString()}:</span> {c.content}</li>
                  ))}
                </ul>
                <CommentInput onSubmit={(text)=>commentPost(p._id, text)} />
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CommentInput({ onSubmit }) {
  const [text, setText] = useState('')
  return (
    <form onSubmit={(e)=>{e.preventDefault(); onSubmit(text); setText('')}} className="mt-2 flex space-x-2">
      <input className="flex-1 border p-2 rounded" placeholder="Viết bình luận..." value={text} onChange={(e)=>setText(e.target.value)} />
      <button className="bg-gray-800 text-white px-3 rounded">Gửi</button>
    </form>
  )
}


