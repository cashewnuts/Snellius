import dynamic from 'next/dynamic'
import Layout from '../components/MyLayout.js'
const VideoChatContainer = dynamic(() => import('../components/VideoChatContainer'))

export default function VideoChatRoom () {
  return (
    <Layout>
      <h1>My Blog</h1>
      <VideoChatContainer />
    </Layout>
  )
}
