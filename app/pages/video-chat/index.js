import dynamic from 'next/dynamic'
import Layout from '../../components/layout.js'
import Page from '../../components/page'
const VideoChatContainer = dynamic(() => import('../../components/VideoChatContainer'))

export default class extends Page {

  static async getInitialProps({query, req}) {
    let props = await super.getInitialProps({req})
    props = {...props, ...query}
    return props
  }

  render() {
    if (!this.props.session.user) 
      return this.loggedInAccessOnly()

    return (
      <Layout {...this.props} navmenu={false} container={false}>
        <VideoChatContainer channel={this.props.channel} session={this.props.session}/>
      </Layout>
    )
  }
}
