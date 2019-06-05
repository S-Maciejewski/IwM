import React from 'react';
import logo from '../logo.svg';
import './App.css';


class App extends React.Component {
  constructor(props) {
    super(props);

    this.allPatient = [];

    this.state = {
      isFetched: false,
      allPatientIDs: [],
    };

    this.fetchPatientIDs = this.fetchPatientIDs.bind(this);
    this.fetchPatient = this.fetchPatient.bind(this);
  }

  componentDidMount() {
    this.fetchPatientIDs();
  }

  fetchPatientIDs() {
    // fetch('http://localhost:8000/getPatient/?id=1656300')
    fetch('http://localhost:8000/getPatientIDs')
      .then(response => response.json())
      .then(json => {

        this.setState({
          isFetched: true,
          allPatientIDs: json,
        });
      })
      .catch(err => console.error(err));
  }

  fetchPatient(){
    for (var i =0;i<this.state.allPatientIDs.length;i++){
      fetch(`http://localhost:8000/getPatient/?id=${this.allPatientIDs[i]}`)
        .then(response => response.json())
        .then(data =>{
          
        })
    }
  }

  render() {

    var { isFetched, allPatientIDs } = this.state;

    if (!isFetched) {
      return (
      <div className="App"> <p>Loading...</p>
      <img src={logo} className="App-logo" alt="logo"/>
      </div>
      
      );
    }
    else {

      return (
        <div className="App">
            <ul>
              {allPatientIDs.map(item =>(
                  <div key={item}>
                  {item} 
                    </div>
              ))}
            </ul>
        </div>
      );
    }
  }
}



export default App;
