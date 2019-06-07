import React from 'react';
import logo from '../logo.svg';
import './App.css';
import List from '../List/List';



class App extends React.Component {
  constructor(props) {
    super(props);

    this.allPatients = [];

    this.state = {
      isFetched: false,
      allPatients: [],
    };

    this.fetchPatient = this.fetchPatient.bind(this);
  }

  componentDidMount() {
    this.fetchPatient();
  }


  fetchPatient() {
    fetch(`http://localhost:8000/getPatients`)
      .then(response => response.json())
      .then(data => {
        this.allPatients = data.map(element => ({
          id: element.id,
          versionId: element.versionId,
          lastUpdated: element.lastUpdated,
          gender: element.gender,
          birthDate: element.birthDate,
          active: element.active,
          name: element.name,
          surname: element.surname,
          address: element.address,
          city: element.city

        }));
        this.setState({
          isFetched: true,
          allPatients: this.allPatients,
        });
      })
      .catch(err => console.error(err));
  }

  render() {

    var { isFetched } = this.state;

    if (!isFetched) {
      return (
        <div className="App"> <p>Loading...</p>
          <img src={logo} className="App-logo" alt="logo" />
        </div>

      );
    }
    else {

      return (
        <div className="App">
          <div className="App-header">
            Karta Pacjenta
          </div>
          <div className="App-main">
            <List items={this.state.allPatients} />
          </div>
        </div>
      );
    }
  }
}



export default App;
