import React from 'react';
import './List.css';
import './Detail.css';
import './Medication.css';
import './Observation.css';
import './Statement.css';
import Button from 'react-bootstrap/Button';
import Moment from 'react-moment';
import Chart from 'react-google-charts';

class List extends React.Component {
  constructor(props) {
    super(props)

    this.observations = [];
    this.medications = [];
    this.statements = [];
    this.patObservations = [];
    this.year1="";
    this.year2="";

    this.state = {
      filtered: [],
      obsFiltered: [],
      time1:"2010-01-01",
      time2:"2020-01-01",
      isDetails: false,
      isList: true,
      isObservation: false,
      isStatement: false,
      isMedication: false,
      id: 0,
      patObserFetched: false,

    }
    this.id = 0;
    
    this.reDrawChart =this.reDrawChart.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getPatient = this.getPatient.bind(this);
    this.getAllObservation = this.getAllObservation.bind(this);
    this.showDetails = this.showDetails.bind(this);
    this.detailsPage = this.detailsPage.bind(this);
    this.showList = this.showList.bind(this);
    this.showObservation = this.showObservation.bind(this);
    this.showMedication = this.showMedication.bind(this);
    this.showStatement = this.showStatement.bind(this);
    this.fetchMedications = this.fetchMedications.bind(this);
    this.fetchObservations = this.fetchObservations.bind(this);
    this.fetchStatements = this.fetchStatements.bind(this);
    this.prepareData = this.prepareData.bind(this);
    this.showChart = this.showChart.bind(this);
    this.handleYear1 = this.handleYear1.bind(this);
    this.handleYear2 = this.handleYear2.bind(this);
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
          versionId: element.versionId,
          text: element.text,
          subjectID: element.subjectID,
          issuedDate: String(element.issuedDate).slice(0, 19),
          value: element.value,
          unit: element.unit,
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

  getAllObservation = async (id) => {
    if (!this.state.patObserFetched) {
      var temp = this.getObservation(id);
      if (temp) {
        var n = temp.versionId;
        var obId = temp.id;
      

        for (var i = 1; i <= n; i++) {
          
          const response = await fetch(`http://localhost:8000/getObservation/?id=${obId}&version=${i}`);
          const json = await response.json();
          this.patObservations.push({
            'versionId': json[0].versionId,
            'issuedDate': String(json[0].issuedDate).slice(0, 19),
            'value': json[0].value,
            'unit': json[0].unit
          });
        }
        this.setState({
          patObserFetched: true,
          obsFiltered: this.patObservations,
        })
      }
    }


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
    this.patObservations = [];
    this.setState({
      id: 0,
      isDetails: false,
      isList: true,
      isMedication: false,
      isObservation: false,
      isStatement: false,
      patObserFetched: false,
      time1:"2010-01-01",
      time2:"2020-01-01",
    });
  }


  showObservation() {
    this.setState({
      isObservation: !this.state.isObservation,
      time1:"2010-01-01",
      time2:"2020-01-01",
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

  prepareData() {
    var temp = [['Year', 'Patient weight in Kg']];
    var time1D= new Date(this.state.time1);
    var time2D= new Date(this.state.time2);
    console.log(time1D);
    console.log(time2D);
    for (var i = 0; i < this.state.obsFiltered.length; i++) {
      var tempDate = new Date(this.state.obsFiltered[i].issuedDate);
      if(tempDate.getTime()>=time1D.getTime()&&tempDate.getTime()<=time2D.getTime()){
        temp.push([new Date(this.state.obsFiltered[i].issuedDate), parseFloat(this.state.obsFiltered[i].value.toFixed(2))]);
      }
    }
    console.log(temp);
    return temp;
  }

  showChart(charData){
    return(<Chart
      width={'800px'}
      height={'400px'}

      loader={<div>Loading Chart</div>}
      chartType="Scatter"
      data={charData}

      options={{

        hAxis: { title: 'Year', minValue: 2010, maxValue: 2020 },
        vAxis: { title: 'Weight', minValue: 0, maxValue: 150 },
        enableInteractivity: false,

      }}
    />
    )
    
  }

  reDrawChart(){
    this.setState({
      time1:this.year1,
      time2:this.year2,
    })
  }

  observationPage() {
    this.getAllObservation(this.state.id);
    var observation = this.getObservation(this.state.id);

    var charData = this.prepareData();
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
            <Moment className="value" date={observation.issuedDate} />
          </div>

          <div className="obsLine">
            <div className="title">
              {'Value: '} </div>
            <div className="value">{observation.value}{' '}{observation.unit}
            </div>
          </div>
          <div className ="chart">
            {this.showChart(charData)}
          </div>
          <div>
          <input type="text" className="inputY1" onChange={this.handleYear1} placeholder="" />
          <input type="text" className="inputY2" onChange={this.handleYear2} placeholder="" />
          <button onClick={this.reDrawChart}>Apply</button>
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

  handleYear1(e){
    if (e.target.value !== "") {
      this.year1 = e.target.value;
       
    } 
  }

  handleYear2(e){
    if (e.target.value !== "") {
      this.year2 = e.target.value;
      
  } 
}

  statementPage() {
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
            <div className="value">  {patient.address} {(patient.address === "" || !patient.address) ? '' : ', '} {patient.city}
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
