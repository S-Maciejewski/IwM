import React from 'react';
import logo from './logo.svg';
import './App.css';


class App extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      isFetched: false,
      allPatients: {},
    };

    this.fetchPatientIDs = this.fetchPatientIDs.bind(this);

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
          allPatients: json,
        });
      })
      .catch(err => console.error(err));
  }

  render() {

    var { isFetched, allPatients } = this.state;

    if (!isFetched) {
      return <div> Loading...</div>;
    }
    else {

      return (
        <div className="App">
            <ul>
              {allPatients.map(item =>(
                  <li key={item.id}>
                  Name: {item.name} | Surname:{item.surname}
                    </li>
              ))}
            </ul>
        </div>
      );
    }
  }
}



export default App;
