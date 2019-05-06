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

  constructor(props) {
    super(props)

    const channel = this.props.channel ? this.props.channel : '/';
    this.state = {
      channel: channel
    }
  }

  render() {
    if (!this.props.session.user) 
      return this.loggedInAccessOnly()

    return (
      <Layout {...this.props} navmenu={false} container={true} fluid={true}>
        <h1>{this.state.channel} Room</h1>
        <VideoChatContainer channel={this.state.channel} session={this.props.session}/>
        <style jsx>{`
        h1 {
          text-align: center;
        }
        `}</style>
      </Layout>
    )
  }
}
