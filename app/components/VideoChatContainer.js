import React, { Component } from 'react'
import Page from './page'
import MediaHandler from '../helper/MediaHandler'
import fetch from 'isomorphic-fetch'
import Pusher from 'pusher-js'
import Peer from 'simple-peer';

export default class VideoChatContainer extends Page {

  constructor(props) {
    super(props)

    this.state = {
      hasMedia: false,
      otherUserId: null,
    }

    this.user = this.props.session.user
    this.user.stream = null
    this.peers = {}

    this.mediaHandler = new MediaHandler()

    this.setupPusher = this.setupPusher.bind(this)
    this.startPeer = this.startPeer.bind(this)
    this.callTo = this.callTo.bind(this)
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

    this.channel.bind(`client-signal-${this.getChannelName()}`, (signal) => {

      let peer = this.peers[signal.chName];

      // if peer is not already exists, we got an incoming call
      if (!peer) {
        this.setState({otherUserId: signal.chName});
        peer = this.startPeer(signal.chName+'', false);
      }
      peer.signal(signal.data);
    });
  }

  getChannelName() {
    const channelName = this.props.channel ? this.props.channel + '' : 'undefined';
    return channelName
  }

  startPeer(chName, initiator = true) {
    const peer = new Peer({
      initiator,
      stream: this.user.stream,
      trickle: false
    });

    peer.on('signal', (data) => {
      this.channel.trigger(`client-signal-${chName}`, {
        type: 'signal',
        chName: this.getChannelName(),
        email: this.props.session.user.email,
        data: data
      });
    });

    peer.on('stream', (stream) => {
      if ('srcObject' in this.userVideo) {
        this.userVideo.srcObject = stream
      } else {
        this.userVideo.src = URL.createObjectURL(stream) // for older browsers
      }

      this.userVideo.play();
    });

    peer.on('close', () => {
      let peer = this.peers[chName];
      if(peer !== undefined) {
        peer.destroy();
      }

      this.peers[chName] = undefined;
    });

    return peer;
  }

  callTo(chName) {
    this.peers[chName] = this.startPeer(chName+'');
  }

  render() {
    return (
      <div className="container">
        <button onClick={(e) => this.callTo("1")}>Call To 1</button>
        <button onClick={(e) => this.callTo("2")}>Call To 2</button>
        <div className="video-container">
          <video className="user-video" ref={(ref) => {this.userVideo = ref;}}></video>
          <video className="my-video" ref={(ref) => {this.myVideo = ref;}}></video>
        </div>
      </div>
    )
  }
}
