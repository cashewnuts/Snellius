import React, { Component } from 'react'
import Page from './page'
import MediaHandler from '../helper/MediaHandler'
import fetch from 'isomorphic-fetch'
import Pusher from 'pusher-js'
import Peer from 'simple-peer';
import zlib from 'zlib'

export default class VideoChatContainer extends Page {

  constructor(props) {
    super(props)

    this.state = {
      hasMedia: false,
      otherUserId: null,
      users: [],
    }

    this.user = this.props.session.user
    this.user.stream = null

    this.mediaHandler = new MediaHandler()

    this.setupPusher = this.setupPusher.bind(this)
    this.startPeer = this.startPeer.bind(this)
  }

  propagateUser(initiator = true) {
    let myId = this.getUser().id
    const chatRoom = `client-chatroom-${this.getChannelName()}`

    setTimeout(() => {
      this.channel.trigger(chatRoom, {
        initiator: initiator,
        userId: myId,
      })
    }, 1000)
  }

  async componentDidMount() {
    try {
      let stream = await this.mediaHandler.getPermissions()
  
      this.setState({hasMedia: true})
      this.user.stream = stream
  
      try {
        this.myVideo.srcObject = stream
      } catch (e) {
        this.myVideo.src = URL.createObjectURL(stream)
      }
      this.myVideo.play()
    } catch (e) {
      console.error('Cannot get media: ', e)
    }

    this.setupPusher()
  }

  componentWillUnmount() {
    this.setState({
      users: [],
    })
  }

  async setupPusher() {
    let appKey
    let csrfToken
    try {
      appKey = (await fetch('/pusher/key').then(d => d.json()))['API_KEY']
      csrfToken = (await fetch('/auth/csrf').then(d => d.json()))['csrfToken']
    } catch(e) {
      console.error('Cannot access REST API: ', e)
      return
    }
    try {
      this.pusher = new Pusher(appKey, {
        authEndpoint: '/pusher/auth',
        cluster: 'ap3',
        auth: {
          headers: {
            'X-CSRF-Token': csrfToken,
          }
        }
      })
    } catch (err) {
      console.error('Cannot connect pusher js: ', err)
      return
    }

    this.channel = this.pusher.subscribe('presence-video-channel');

    let myId = this.getUser().id
    this.channel.bind(`client-signal-${myId}`, (signal) => {

      let users = this.state.users
      let user = users.find(u => u.id === signal.userId)

      // if peer is not already exists, we got an incoming call
      if (!user) {
        user = {
          id: signal.userId,
          peer: this.startPeer(signal.userId+'', false),
        }
        users.push(user)
        this.setState({users: users});
      }

      zlib.inflate(new Buffer(signal.data, 'base64'), (err, buf) => {
        if (err) console.error(err)
        let inflated = JSON.parse(buf)
        let peer = user.peer
        if (!peer.destroyed) {
          peer.signal(inflated);
        }
      })
    });

    this.channel.bind(`client-chatroom-${this.getChannelName()}`, (data, metadata) => {
      let { users } = this.state
      let { initiator, userId } = data
      let myId = this.getUser().id
      if (userId === myId) {
        return
      }
      let user = users.find(u => u.id === userId)
      if (!user) {
        if (initiator) {
          user = {
            id: userId,
            peer: this.startPeer(userId),
          }
          users.push(user)
          this.setState({users: users})
        } else {
          this.propagateUser(myId > userId)
        }
      }
    })

    this.propagateUser(false)
  }

  getUser() {
    return this.props.session.user
  }

  getChannelName() {
    const channelName = this.props.channel ? this.props.channel + '' : 'undefined';
    return channelName
  }

  startPeer(userId, initiator = true) {
    const peer = new Peer({
      initiator,
      stream: this.user.stream,
      trickle: false
    });

    peer.on('signal', (data) => {

      zlib.deflate(JSON.stringify(data), (err, buf) => {
        if (err) console.error(err)
        let deflated = buf.toString('base64')
        this.channel.trigger(`client-signal-${userId}`, {
          type: 'signal',
          userId: this.getUser().id,
          email: this.getUser().email,
          data: deflated
        });
      })
    });

    return peer;
  }

  render() {
    return (
      <div className="container">
        <div className="video-container">
          <video className="my-video" ref={(ref) => {this.myVideo = ref;}}></video>
          {
            this.state.users.map(user => <VideoChatter key={user.id} {...user} />)
          }
        </div>
      </div>
    )
  }
}

class VideoChatter extends Component{

  constructor(props) {
    super(props)

    this.setOnPeer()
  }

  componentWillUnmount() {
    this.props.peer.destroy()
  }

  setOnPeer() {
    const peer = this.props.peer

    peer.on('stream', (stream) => {
      if ('srcObject' in this.videoRef) {
        this.videoRef.srcObject = stream
      } else {
        this.videoRef.src = URL.createObjectURL(stream) // for older browsers
      }

      this.videoRef.play();
    });

    peer.on('close', () => {
      let peer = this.props.peer
      if(peer !== undefined) {
        peer.destroy();
      }
    });
  }

  render() {
    return (
      <video ref={(ref) => {this.videoRef = ref}} ></video>
    )
  }
}