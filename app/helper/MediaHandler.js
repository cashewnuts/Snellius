
export default class MediaHandler {
  async getPermissions() {
    try {
      let stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
      return stream
    } catch (e) {
      throw new Error(`Unable to fetch stream ${e}`)
    }
  }
}
