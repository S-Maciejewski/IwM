import React from 'react';
import './List.css';
import './Detail.css';
import './Medication.css';
import './Observation.css';
import './Statement.css';
import Button from 'react-bootstrap/Button';

class List extends React.Component {
  constructor(props) {
    super(props)

    this.observations = [];
    this.medications = [];
    this.statements = [];

    this.state = {
      filtered: [],
      isDetails: false,
      isList: true,
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
    this.fetchMedications();
    this.fetchStatements();

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
          issuedDate: element.issuedDate,
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

  getMedication(id) {
    return this.medications.find((element) => {
      return element.subjectID === String(id);
    })
  }


  showDetails(id) {
    this.setState({
      id: id,
      isDetails: true,
      isList: false
    });
  }

  showList() {
    this.setState({
      id: 0,
      isDetails: false,
      isList: true,
      isMedication: false,
      isObservation: false,
      isStatement: false,
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
    console.log(this.state.isMedication);
    var observation = this.getObservation(this.state.id)
    if (observation) {
      return (
        <div className="obsData">
          <div className="obsLine">
            <div className="title">
              {'Observation: '} </div>
            <div className="value">{observation.text}
            </div>
          </div>

          <div className="obsLine">
            <div className="title">
              {'Date : '}</div>
            <div className="value"> {observation.issuedDate}
            </div>
          </div>

          <div className="obsLine">
            <div className="title">
              {'Value: '} </div>
            <div className="value">{observation.value}{' '}{observation.unit}
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="emptyDetails">
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
        <div className="stateData">
          <div className="stateLine">
            <div className="title">
              {'Id: '} </div>
            <div className="value">{statement.id}
            </div>
          </div>

          <div className="stateLine">
            <div className="title">
              {'Medication Statement: '}</div>
            <div className="value"> {statement.text}
            </div>
          </div>

          <div className="stateLine">
            <div className="title">
              {'Dosage Description: '} </div>
            <div className="value">{statement.dosageText}
            </div>
          </div>

          <div className="stateLine">
            <div className="title">
              {'Dosage: '}
            </div >
            <div className="value">{statement.dosage}{' '}{statement.unit}
            </div>
          </div>

          <div className="stateLine">
            <div className="title">
              {'Status: '}
            </div >
            <div className="value">{statement.status}
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="emptyDetails">
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
        <div className="medicationData">
          <div className="medicationLine">
            <div className="title">
              {'Medication id: '} </div>
            <div className="value">{medication.id}
            </div>
          </div>

          <div className="medicationLine">
            <div className="title">
              {'Medication Code: '}</div>
            <div className="value"> {medication.code}
            </div>
          </div>

          <div className="medicationLine">
            <div className="title">
              {'Medication: '} </div>
            <div className="value">{medication.display}
            </div>
          </div>

          <div className="medicationLine">
            <div className="title">
              {'Medication status: '}
            </div >
            <div className="value">{medication.active}
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="emptyDetails">
          No medication
        </div>
      )
    }

  }

  detailsPage() {
    var patient = this.getPatient(this.state.id);
    return (
      <div className="details_page">
        <div className="personalData">
          <div className="personalHeader">
            Patient details:
          </div>
          <div className="patientLine">
            <div className="title">
              {'Patient: '} </div>
            <div className="value">{patient.name} {' '}{patient.surname}
            </div>
          </div>

          <div className="patientLine">
            <div className="title">
              {'Gender: '}</div>
            <div className="value"> {patient.gender}
            </div>
          </div>

          <div className="patientLine">
            <div className="title">
              {'Birth Date: '} </div>
            <div className="value">{patient.birthDate}
            </div>
          </div>

          <div className="patientLine">
            <div className="title">
              {'Status: '}
            </div >
            <div className="value">{patient.active ? 'Active' : 'Not active'}
            </div>
          </div>

          <div className="patientLine">
            <div className="title">
              {'Address: '}</div>
            <div className="value">  {patient.address} {(patient.address === "") ? '' : ', '} {patient.city}
            </div>
          </div>
          <div className="resourcesDetails">
            <Button className="detailBtn" variant="secondary" id="obsBtn" onClick={this.showObservation}>Observation</Button>
            {this.state.isObservation ? this.observationPage(this.id) : null}
          </div>
          <div className="resourcesDetails">
            <Button className="detailBtn" variant="secondary" id="medBtn" onClick={this.showStatement}>Medication Statement</Button>
            {this.state.isStatement ? this.statementPage(this.id) : null}
          </div>
          <div className="resourcesDetails">
            <Button className="detailBtn" variant="secondary" id="stateBtn" onClick={this.showMedication}>Medication</Button>
            {this.state.isMedication ? this.medicationPage(this.id) : null}
          </div>
        </div>
        <div>

          <Button size="sm" className="backBtn" onClick={this.showList} variant="secondary">Back to menu</Button>
        </div>
      </div>
    )
  }

  render() {
    var menuList = (<div className="List">

      <div className="patientList">Lista pacjentów:
      <ul>
          {this.state.filtered.map(item => (
            <li className="patient" key={item.id}>
              {item.name}{" "}{item.surname}{" "}{item.id}{" "}
              <Button size="sm" onClick={() => this.showDetails(item.id)} className='listBtn' variant="info">Details</Button>
            </li>
          ))}
        </ul>
      </div>
      <input type="text" className="input" onChange={this.handleChange} placeholder="Search..." />
    </div>);

    return (
      <div>
        {this.state.isList ? menuList : null}
        {this.state.isDetails ? this.detailsPage(this.id) : null}
      </div>
    )
  }
}



export default List;
