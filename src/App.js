import React, {Component} from 'react'
import io from 'socket.io-client';
import './app.css';

class App extends Component {

  state = {
    isConnected: false,
    id: null,
    peeps: [],
    msgs_old: [],
    new_msgs: [],
    text: "",
    conn_people: []
  };

  socket = null;

  UNSAFE_componentWillMount(){

    this.socket = io('https://codi-server.herokuapp.com');

    this.socket.on('connect', () => {
      this.setState({isConnected:true});
      this.setState({id: this.socket.id});
    })

    this.socket.on('pong!', (additionalStuff) => {
      console.log('The server answered!', additionalStuff);
    });

    this.socket.on('disconnect', () => {
      this.setState({isConnected: false});
    });

    this.socket.on('youare', (answer) => {
      this.setState({id: answer.id});
      console.log(answer.id);
    });

    this.socket.on('peeps', (data) => {
      this.setState({peeps: data});
      console.log(this.state.peeps);
    });

    this.socket.on('new-connection', (con) => {
      this.state.peeps.push(con);
    });

    this.socket.on('new-disconnection', (con) => {
      for(let i = 0; i < this.state.peeps.length; i++) {
        if (this.state.peeps[i] === con) {
          this.state.peeps.slice(i);
          // console.log(this.state.peeps);
        }
      }
    });

    this.socket.on('next', (message_from_server) => {
      console.log(message_from_server);
    });

    this.socket.on('room', old_messages =>{
      this.setState({msgs_old: old_messages});
      for (let i = 0; i < this.state.msgs_old.length; i++) { 
      if (this.state.msgs_old[i].id === this.state.peeps[i]) {
        this.state.conn_people.push(this.state.msgs_old[i].name);
      }
    }
      console.log(this.state.msgs_old);
      console.log(this.state.conn_people);
    });

    this.socket.on('message', new_messages => {
      this.setState({new_msgs: new_messages});
      console.log(this.state.new_msgs);
    })
  }
  componentWillUnmount() {
    this.socket.close()
    this.socket = null
  };

  render() {
    return (
      <div className="container">
        <div className="chat-header"><header className="chat-header-title">Chat Room App</header></div>
        <div className="header-status">
          status: {this.state.isConnected ? 'connected' : 'disconnected'}
        </div>
        {/* <button onClick={()=>this.socket.emit('ping!')}>ping</button>
        <button onClick={() =>this.socket.emit('whoami')}>Who Am I?</button> */}
        
        <div className="connections">
            {this.state.conn_people.map((people, id) => {
              return(
                <p key={id}>{people}</p>
              )
            }
          )}
        </div>

        {/* Old Messages Area */}
          <div className="mesg-container">
            {
              this.state.msgs_old.slice(0).reverse().map((old_msgs, index) => {
                return(
                <div className="msg left-msgs">
                  <div className="msg-img"></div>
                  <div className="msg-bubble">
                    <div className="msg-info">
                      <p className="msg-info-name">{old_msgs.name}</p>
                      <p className="msg-info-time">{old_msgs.date}</p>
                    </div>
                    <p className="msg-info-text">{old_msgs.text}</p>
                  </div>
                </div>
                );
              })
            }
          </div>

          {/* Send Messages Area */}
          <div className="msg-input-area">
            <div className="msg-img-sender"></div>
            <input className="msger-input" type="text" id={this.socket.id} onChange={(e) => this.setState({text: e.target.value})}/>
            <button className="msger-send-btn" type="submit" onClick={() => this.socket.emit('message',
          {
            text: this.state.text,
            id: this.socket.id,
            name:'Ali Traboulsi'
          }
          )}>Send</button>
          </div>
      </div>
    );
  };
}


export default App;
