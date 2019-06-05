const express = require('express');
const cors = require('cors')
const rp = require('request-promise');
const app = express();
const port = 8000;
app.use(cors());

const patientIDs = [
    1656328,
    1656327,
    1656300,
    1656311,
    1656316,
    // z obserwacjami
    1909448, // obserwacja 1909478
    295670, // obserwacja 295694

]

const observationIDs = [
    1909478, // pacjent 1909448
    434055, // bez pacjenta
    295694, // pacjent 295670
]

class Patient {
    constructor(id, versionId, lastUpdated, gender, birthDate, active, name, surname, address, city) {
        this.id = id;
        this.versionId = versionId;
        this.lastUpdated = lastUpdated;
        this.gender = gender;
        this.birthDate = birthDate;
        this.active = active;
        this.name = name;
        this.surname = surname;
        this.address = address;
        this.city = city;
    }
}

class Observation {
    constructor(id, text, subjectID, issuedDate, value, unit) {
        this.id = id;
        this.text = text;
        this.subjectID = subjectID;
        this.issuedDate = issuedDate;
        this.value = value;
        this.unit = unit;
    }
}

async function getPatientData(id) {
    // return rp('http://hapi.fhir.org/baseDstu3/Patient/' + id + '/_history/' + version);  // Pobieranie wybranej wersji (czy implementujemy?)
    return rp('http://hapi.fhir.org/baseDstu3/Patient/' + id);
}

async function getObservationData(id) {
    return rp('http://hapi.fhir.org/baseDstu3/Observation/' + id);
}

async function getPatient(id) {
    await getPatientData(id).then(res => {
        res = JSON.parse(res);
        patient = new Patient(id, res.meta.versionId, res.meta.lastUpdated, res.gender ? res.gender : '',
            res.birthDate ? res.birthDate : '', res.active ? res.active : '',
            res.name && res.name[0] ? res.name[0].given[0] : '', res.name && res.name[0] ? res.name[0].family : '',
            res.address && res.address[0] ? res.address[0].text : '', res.address && res.address[0] ? res.address[0].city : '');
    });
    console.log(`Patient ${id} retrieved from server successfully`);
    return patient;
}

async function getObservation(id) {
    await getObservationData(id).then(res => {
        res = JSON.parse(res);
        observation = new Observation(id, res.code && res.code.text ? res.code.text : '', 
        res.subject && res.subject.reference ? res.subject.reference.replace('Patient/', '') : '',
        res.issued, res.valueQuantity && res.valueQuantity.value ? res.valueQuantity.value : '',
        res.valueQuantity && res.valueQuantity.unit ? res.valueQuantity.unit : '');
    });
    console.log(`Observation ${id} retrieved from server successfully`);
    return observation;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/getPatient', (req, res) => {
    getPatient(req.query.id).then(patient => {
        res.json(patient);
    });
});

app.get('/getPatientIDs', (req, res) => res.json(patientIDs));

app.get('/getObservation', (req, res) => {
    getObservation(req.query.id).then(observation => {
        res.json(observation);
    });
});

app.get('/getObservationIDs', (req, res) => res.json(observationIDs));

app.listen(port, () => console.log(`Node server listening on port ${port}`));
