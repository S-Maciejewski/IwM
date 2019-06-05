import React from 'react';
import './Patient/Patient.css';


class Patient extends React.Component {
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

  fetchPatientDetail() {
    fetch('http://localhost:8000/getPatient/?id=1656300')
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
              {/* {allPatients.map(item =>(
                  <div key={item.id}>
                  Name: {item.name} | Surname:{item.surname}
                    </div>
              ))} */}
              {allPatients[0]}
            </ul>
        </div>
      );
    }
  }
}



export default Patient;
