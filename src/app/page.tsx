"use client"
import { useState, useRef, useEffect } from "react"
import RetroTextEditor from "./_components/RetroTextEditor"
import { getPosts, type NewPost } from "@/lib"
import { date } from "drizzle-orm/mysql-core"

export default function Home() {
  const [status, setStatus] = useState("")
  const [textContent, setTextContent] = useState("")
  const [hTMLContent, setHTMLcontent] = useState("")
  const MAX_WIDTH = 288
  const [posts, setPosts] = useState<NewPost[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts") // You'll need to create this API route
        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error("Failed to fetch posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-6 font-mono text-black bg-[#d4d0c8]">
      {/* Main Editor Window */}
      <RetroTextEditor
        setTextContent={setTextContent}
        textContent={textContent}
        status={status}
        setStatus={setStatus}
        setHTMLContent={setHTMLcontent}
        hTMLContent={hTMLContent}
      />
      {/* Posts Display */}
      <div className="">
        {loading ? (
          <div>Loading posts...</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] p-4 text-sm"
              >
                <p>{post.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Print Button */}

      {/* Sample Text Box */}
      {/* <div className="w-[600px] bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] p-4 text-sm">
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry's standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting, remaining essentially
          unchanged.
        </p>
      </div> */}
    </div>
  )
}
