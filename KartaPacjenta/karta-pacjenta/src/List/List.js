import React from 'react';
import './List.css';
import Button from 'react-bootstrap/Button';

class List extends React.Component {
  constructor(props) {
    super(props)

    this.observations = [];
    this.medications = [];
    this.statements = [];

    this.state = {
      filtered: [],
      showDetails: false,
      showList: true,
      isObservation: false,
      isStatement: false,
      isMedication: false,
      id: 0,
    }
    this.id = 0;

    this.handleChange = this.handleChange.bind(this);
    this.getPatient = this.getPatient.bind(this);
    this.showDetails = this.showDetails.bind(this);
    this.detailsPage = this.detailsPage.bind(this);
    this.showList = this.showList.bind(this);
    this.showObservation = this.showObservation.bind(this);
    this.showMedication = this.showMedication.bind(this);
    this.showStatement = this.showStatement.bind(this);
    this.fetchMedications = this.fetchMedications.bind(this);
    this.fetchObservations = this.fetchObservations.bind(this);
    this.fetchStatements = this.fetchStatements.bind(this);

  }

  componentDidMount() {
    this.setState({
      filtered: this.props.items
    });
    this.fetchObservations();
    
  }

  fetchMedications() {
    fetch(`http://localhost:8000/getMedications`)
      .then(response => response.json())
      .then(data => {
        this.medications = data.map(element => ({
          id: element.id,
          code: element.code,
          display: element.display,
          status: element.status
        }));

      })
      .catch(err => console.error(err));
  }

  fetchObservations() {
    fetch(`http://localhost:8000/getObservations`)
      .then(response => response.json())
      .then(data => {
        this.observations = data.map(element => ({
          id: element.id,
          text: element.text,
          subjectID: element.subjectID,
          value: element.value,
          unit: element.unit

        }));

      })
      .catch(err => console.error(err));
  }

  fetchStatements() {
    fetch(`http://localhost:8000/getStatements`)
      .then(response => response.json())
      .then(data => {
        this.statements = data.map(element => ({
          id: element.id,
          text: element.text,
          subjectID: element.subjectID,
          dosageText: element.dosageText,
          dosage: element.dosage,
          unit: element.unit,
          status: element.status
        }));

      })
      .catch(err => console.error(err));
  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      filtered: nextProps.items
    });
  }

  handleChange(e) {

    let currentList = [];
    let newList = [];


    if (e.target.value !== "") {

      currentList = this.props.items;

      newList = currentList.filter(item => {

        const lc = item.surname.toLowerCase();

        const filter = e.target.value.toLowerCase();

        return lc.includes(filter);
      });
    } else {

      newList = this.props.items;
    }

    this.setState({
      filtered: newList
    });
  }

  getPatient(id) {
    return this.state.filtered.find((element) => {
      return element.id === id;
    })
  }

  getObservation(id) {
    return this.observations.find((element) => {
      return element.subjectID === String(id);
    })
  }

  getStatement(id) {
    return this.statements.find((element) => {
      return element.subjectID === String(id);
    })
  }

  getMedication(id){
    return this.medications.find((element) => {
      return element.subjectID === String(id);
    })
  }


  showDetails(id) {
    this.setState({
      id: id,
      showDetails: true,
      showList: false
    });
  }

  showList() {
    this.setState({
      id: 0,
      showDetails: false,
      showList: true
    });
  }


  showObservation() {
    this.setState({
      isObservation: !this.state.isObservation,
    })
  }

  showStatement() {
    this.setState({
      isStatement: !this.state.isStatement,
    })

  }

  showMedication() {
    this.setState({
      isMedication: !this.state.isMedication,
    })
  }



  observationPage() {
    console.log(this.state.id);
    console.log(this.observations);
    var observation = this.getObservation(this.state.id)
    if (observation) {
      return (
        <div>
          {observation.text}{' '}{observation.value}{' '}{observation.unit}
        </div>
      )
    } else {
      return(
        <div>
          No observation
        </div>
      )
    }

  }

  statementPage() {
    console.log(this.state.id);
    console.log(this.statements);
    var statement = this.getStatement(this.state.id)
    if (statement) {
      return (
        <div>
          {statement.id}{' '}{statement.text}{' '}{statement.unit}
        </div>
      )
    } else {
      return(
        <div>
          No medication statement
        </div>
      )
    }
  }

  medicationPage() {
    console.log(this.state.id);
    console.log(this.medications);
    var medication = this.getMedication(this.state.id)
    if (medication) {
      return (
        <div>
          {medication.id}{' '}{medication.code}{' '}{medication.display}
        </div>
      )
    } else {
      return(
        <div>
          No medication
        </div>
      )
    }

  }

  detailsPage() {
    var patient = this.getPatient(this.state.id);
    return (
      <div className="details_page">
        <div className="Personal data">
          <div>
            {'Patient: '} {patient.name} {' '}{patient.surname}
          </div>
          <div>
            {'Gender: '} {patient.gender}
          </div>
          <div>
            {'Birth Date: '} {patient.birthDate}
          </div>
          <div>
            {patient.active ? 'Active' : 'Not active'}
          </div>
          <div>
            {'Address: '} {patient.address} {patient.address==='' ? '':', '} {patient.city}
          </div>
          <Button className="secondary" id="obsBtn" onClick={this.showObservation}>Show observation</Button>
         
          <Button className="secondary" id="medBtn" onClick={this.showStatement}>Show statement</Button>
          
          <Button className="secondary" id="stateBtn" onClick={this.showMedication}>Show medication</Button>
          
        </div>
        <div>
        {this.state.isObservation ? this.observationPage(this.id) : null}
        {this.state.isStatement ? this.statementPage(this.id) : null}
        {this.state.isMedication ? this.medicationPage(this.id) : null}
          <Button onClick={this.showList} className="secondary">Back to menu</Button>
        </div>
      </div>
    )
  }

  render() {
    var menuList = (<div className="List">
      <div className="container">
      <input type="text" className="input" onChange={this.handleChange} placeholder="Search..." />
      <div>Lista pacjentów:</div>
      <ul>
        {this.state.filtered.map(item => (
          <li key={item.id}>
            {item.name}{" "}{item.surname}{" "}
            <Button size = "sm" onClick={() => this.showDetails(item.id)} className='listBtn'variant="info">Details</Button>
          </li>
        ))}
      </ul>
    </div>
    </div>);

    return (
      <div>
        {this.state.showList ? menuList : null}
        {this.state.showDetails ? this.detailsPage(this.id) : null}
      </div>
    )
  }
}



export default List;
