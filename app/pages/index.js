import Link from 'next/link'
import Router from 'next/router'
import React from 'react'
import Head from 'next/head'
import {
  Container, Row, Col, Jumbotron, ListGroup, ListGroupItem,
  Form, FormGroup, Input
} from 'reactstrap'
import Page from '../components/page'
import Layout from '../components/layout'

export default class extends Page {

  constructor(props) {
    super(props)
    this.state = {
      channelName: '',
    }

    this.inputChannelName = this.inputChannelName.bind(this)
    this.moveToChannel = this.moveToChannel.bind(this)
  }

  inputChannelName(e) {
    this.setState({
      channelName: e.target.value.trim()
    })
  }

  moveToChannel(e) {
    e.preventDefault()
    Router.push(`/video-chat/${this.state.channelName}`)
  }

  render() {
    const user = this.props.session.user

    if (user) {
      // When logged in
      return (
        <Layout {...this.props} navmenu={false} container={false}>
          <Row className="channel-form-container">
            <Col className="" sm="12" md="8" lg="6" xl="5">
              <Form className="channel-form" onSubmit={(e) => this.moveToChannel(e)}>
                <h1>Select Channel Name</h1>
                <FormGroup>
                  <div className="channel-name-group">
                    <Input onInput={(e) => this.inputChannelName(e)} ></Input>
                    <button size="sm" className="btn btn-outline-primary icon ion-md-pulse ph-auto pw-auto"></button>
                  </div>
                </FormGroup>
              </Form>
            </Col>
          </Row>
        </Layout>
      )
    } else {
      return (
        <React.Fragment>
          <Head>
            <link href='https://fonts.googleapis.com/css?family=Sofia' rel='stylesheet' />
          </Head>
          <Layout {...this.props} navmenu={false} container={false}>
            <Jumbotron className="text-light rounded-0" style={{
              backgroundColor: 'rgba(73,155,234,1)',
              background: 'radial-gradient(ellipse at center, rgba(73,155,234,1) 0%, rgba(32,124,229,1) 100%)',
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)'
            }}>
              <Container className="mt-2 mb-2">
                <div className="id-top-container container">
                  <div className="id-img-container">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/Willebrord_Snellius.jpg" />
                  </div>
                  <div className="id-description">
                    <div className="explanation">
                      <h1>Snellius</h1>
                      <p>
                        Video chat application
                      </p>
                      <p>
                        Using Next.js and Node.js
                      </p>
                      <p>
                        Please login and Enter channel!
                      </p>
                    </div>
                  </div>
                </div>
              </Container>
            </Jumbotron>
          </Layout>
        </React.Fragment>
      )
    }
  }
}
