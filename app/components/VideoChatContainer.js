import React, { Component } from 'react'
import MediaHandler from '../helper/MediaHandler'

export default class VideoChatContainer extends Component {

  constructor() {
    super()

    this.state = {
      hasMedia: false,
      otherUserId: null,
    }

    this.mediaHandler = new MediaHandler()
  }

  async componentWillMount() {
    let stream = await this.mediaHandler.getPermissions()
    try {
      this.setState({hasMedia: true})
      this.myVideo.srcObject = stream
    } catch (e) {
      this.myVideo.src = URL.createObjectURL(stream)
    }
    this.myVideo.play()
  }

  setupPusher() {
    this.pusher = new Pusher(APP_KEY, {
      authEndpoint: '/pusher/auth',
      cluster: 'ap2',
      auth: {
        params: this.user.id,
        headers: {
          'X-CSRF-Token': window.csrfToken,
        }
      }
    })
  }

  render() {
    return (
      <div className="container">
        <div className="video-container">
          <video className="my-video" ref={(ref) => {this.myVideo = ref;}}></video>
          <video className="user-video" ref={(ref) => {this.userVideo = ref;}}></video>
        </div>
      </div>
    )
  }
}
