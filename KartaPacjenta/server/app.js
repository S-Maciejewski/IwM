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
    // z medication statementami
    1952851, // statement 1952915
]

const observationIDs = [
    1909478, // pacjent 1909448
    434055, // bez pacjenta
    295694, // pacjent 295670
]

const medicationStatementIDs = [
    1952915, // pacjent 1952851
    1952838,
    1952182,
]

const medicationIDs = [
    1946955,
]

var patients = [];
var observations = [];
var statements = [];
var medications = [];

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

class MedicationStatement {
    constructor(id, text, subjectID, dosageText, dosage, unit, status) {
        this.id = id;
        this.text = text;
        this.subjectID = subjectID;
        this.dosageText = dosageText;
        this.dosage = dosage;
        this.unit = unit;
        this.status = status;
    }
}

class Medication {
    constructor(id, code, display, status) {
        this.id = id;
        this.code = code;
        this.display = display;
        this.status = status;
    }
}

async function getPatientData(id) {
    // return rp('http://hapi.fhir.org/baseDstu3/Patient/' + id + '/_history/' + version);  // Pobieranie wybranej wersji (czy implementujemy?)
    return rp('http://hapi.fhir.org/baseDstu3/Patient/' + id);
}

async function getObservationData(id) {
    return rp('http://hapi.fhir.org/baseDstu3/Observation/' + id);
}

async function getStatementData(id) {
    return rp('http://hapi.fhir.org/baseDstu3/MedicationStatement/' + id);
}

async function getMedicationData(id) {
    return rp('http://hapi.fhir.org/baseDstu3/Medication/' + id);
}

function validatePatient(id, res) {
    res = JSON.parse(res);
    return new Patient(id, res.meta.versionId, res.meta.lastUpdated, res.gender ? res.gender : '',
        res.birthDate ? res.birthDate : '', res.active ? res.active : '',
        res.name && res.name[0] ? res.name[0].given[0] : '', res.name && res.name[0] ? res.name[0].family : '',
        res.address && res.address[0] ? res.address[0].text : '', res.address && res.address[0] ? res.address[0].city : '');
}

function validateObservation(id, res) {
    res = JSON.parse(res);
    return new Observation(id, res.code && res.code.text ? res.code.text : '',
        res.subject && res.subject.reference ? res.subject.reference.replace('Patient/', '') : '',
        res.issued, res.valueQuantity && res.valueQuantity.value ? res.valueQuantity.value : '',
        res.valueQuantity && res.valueQuantity.unit ? res.valueQuantity.unit : '');
}

function validateStatement(id, res) {
    res = JSON.parse(res);
    return new MedicationStatement(id, res.medicationCodeableConcept ? res.medicationCodeableConcept.text : '',
        res.subject && res.subject.reference ? res.subject.reference.replace('Patient/', '') : '',
        res.dosage[0] ? res.dosage[0].text : '', res.dosage[0] && res.dosage[0].doseQuantity ? res.dosage[0].doseQuantity.value : '',
        res.dosage[0] && res.dosage[0].doseQuantity ? res.dosage[0].doseQuantity.unit : '', res.status);
}

function validateMedication(id, res) {
    res = JSON.parse(res);
    return new Medication(id, res.code && res.code.coding[0] ? res.code.coding[0].code : '',
        res.code && res.code.coding[0] ? res.code.coding[0].display : '', res.status);
}

async function getPatient(id) {
    await getPatientData(id).then(res => patient = validatePatient(id, res));
    console.log(`Patient ${id} retrieved from server successfully`);
    return [patient];
}

async function getObservation(id) {
    await getObservationData(id).then(res => observation = validateObservation(id, res));
    console.log(`Observation ${id} retrieved from server successfully`);
    return [observation];
}

async function getStatement(id) {
    await getStatementData(id).then(res => stmt = validateStatement(id, res));
    console.log(`Medication statement ${id} retrieved from server successfully`);
    return [stmt];
}

async function getMedication(id) {
    await getMedicationData(id).then(res => medication = validateMedication(id, res));
    console.log(`Medication ${id} retrieved from server successfully`);
    return [medication];
}

function getPatientPromise(id) {
    return rp('http://hapi.fhir.org/baseDstu3/Patient/' + id).then(res => {
        patient = validatePatient(id, res);
        patients.push(patient);
    })
}

function getObservationPromise(id) {
    return rp('http://hapi.fhir.org/baseDstu3/Observation/' + id).then(res => {
        observation = validateObservation(id, res);
        observations.push(observation);
    })
}

function getStatementPromise(id) {
    return rp('http://hapi.fhir.org/baseDstu3/MedicationStatement/' + id).then(res => {
        stmt = validateStatement(id, res);
        statements.push(stmt);
    })
}

function getMedicatioPromise(id) {
    return rp('http://hapi.fhir.org/baseDstu3/Medication/' + id).then(res => {
        medication = validateMedication(id, res);
        medications.push(medication);
    })
}

function getPatientPromises() {
    patients = [];
    promises = [];
    patientIDs.forEach(id => promises.push(getPatientPromise(id)));
    return Promise.all(promises);
}

function getObservationPromises() {
    observations = [];
    promises = [];
    observationIDs.forEach(id => promises.push(getObservationPromise(id)));
    return Promise.all(promises);
}

function getStatementPromises() {
    statements = [];
    promises = [];
    medicationStatementIDs.forEach(id => promises.push(getStatementPromise(id)));
    return Promise.all(promises);
}

function getMedicatioPromises() {
    medications = [];
    promises = [];
    medicationIDs.forEach(id => promises.push(getMedicatioPromise(id)));
    return Promise.all(promises);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/getPatient', (req, res) => getPatient(req.query.id).then(patient => res.json(patient)));

app.get('/getPatientIDs', (req, res) => res.json(patientIDs));

app.get('/getPatients', (req, res) => getPatientPromises().then(() => res.json(patients)));

app.get('/getObservation', (req, res) => getObservation(req.query.id).then(observation => res.json(observation)));

app.get('/getObservationIDs', (req, res) => res.json(observationIDs));

app.get('/getObservations', (req, res) => getObservationPromises().then(() => res.json(observations)));

app.get('/getStatement', (req, res) => getStatement(req.query.id).then(stmt => res.json(stmt)));

app.get('/getStatementIDs', (req, res) => res.json(medicationStatementIDs));

app.get('/getStatements', (req, res) => getStatementPromises().then(() => res.json(statements)));

app.get('/getMedication', (req, res) => getMedication(req.query.id).then(medication => res.json(medication)));

app.get('/getMedicationIDs', (req, res) => res.json(medicationIDs));

app.get('/getMedications', (req, res) => getMedicatioPromises().then(() => res.json(medications)));

app.listen(port, () => console.log(`Node server listening on port ${port}`));
