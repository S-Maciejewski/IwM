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
    295670, // obserwacja 295694
    // z medication statementami
    1952851, // statement 1952915
    // WZORCOWY PACJENT:
    1909448,
]

const observationIDs = [
    434055, // bez pacjenta
    295694, // pacjent 295670
    // OBSERWACJE WZORCOWEGO PACJENTA 1909448
    1909478,
    1955961,
    1955962,
    1955963,
]

const medicationStatementIDs = [
    1952915, // pacjent 1952851
    1952838,
    1952182,
    // STATEMENTY WZOROWEGO PACJENTA 1909448
    1955964,
    1955965,
    1955966,
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
    constructor(id, versionId, text, subjectID, issuedDate, value, unit) {
        this.id = id;
        this.versionId = versionId;
        this.text = text;
        this.subjectID = subjectID;
        this.issuedDate = issuedDate;
        this.value = value;
        this.unit = unit;
    }
}

class MedicationStatement {
    constructor(id, versionId, text, subjectID, dosageText, dosage, unit, status) {
        this.id = id;
        this.versionId = versionId;
        this.text = text;
        this.subjectID = subjectID;
        this.dosageText = dosageText;
        this.dosage = dosage;
        this.unit = unit;
        this.status = status;
    }
}

class Medication {
    constructor(id, versionId, code, display, status) {
        this.id = id;
        this.versionId = versionId;
        this.code = code;
        this.display = display;
        this.status = status;
    }
}

function getPatientData(id, version = 0) {
    return rp('http://hapi.fhir.org/baseDstu3/Patient/' + id + (version > 0 ? '/_history/' + version : ''));
}

function getObservationData(id, version = 0) {
    return rp('http://hapi.fhir.org/baseDstu3/Observation/' + id + (version > 0 ? '/_history/' + version : ''));
}

function getStatementData(id, version = 0) {
    return rp('http://hapi.fhir.org/baseDstu3/MedicationStatement/' + id + (version > 0 ? '/_history/' + version : ''));
}

function getMedicationData(id, version = 0) {
    return rp('http://hapi.fhir.org/baseDstu3/Medication/' + id + (version > 0 ? '/_history/' + version : ''));
}

function validatePatient(id, res) {
    res = JSON.parse(res);
    return new Patient(id, res.meta && res.meta.versionId ? res.meta.versionId : '', res.meta ? res.meta.lastUpdated : '',
        res.gender ? res.gender : '', res.birthDate ? res.birthDate : '', res.active ? res.active : '',
        res.name && res.name[0] ? res.name[0].given[0] : '', res.name && res.name[0] ? res.name[0].family : '',
        res.address && res.address[0] ? res.address[0].text : '', res.address && res.address[0] ? res.address[0].city : '');
}

function validateObservation(id, res) {
    res = JSON.parse(res);
    return new Observation(id, res.meta && res.meta.versionId ? res.meta.versionId : '', res.code && res.code.text ? res.code.text : '',
        res.subject && res.subject.reference ? res.subject.reference.replace('Patient/', '') : '',
        res.issued, res.valueQuantity && res.valueQuantity.value ? res.valueQuantity.value : '',
        res.valueQuantity && res.valueQuantity.unit ? res.valueQuantity.unit : '');
}

function validateStatement(id, res) {
    res = JSON.parse(res);
    return new MedicationStatement(id, res.meta && res.meta.versionId ? res.meta.versionId : '', res.medicationCodeableConcept ? res.medicationCodeableConcept.text : '',
        res.subject && res.subject.reference ? res.subject.reference.replace('Patient/', '') : '',
        res.dosage[0] ? res.dosage[0].text : '', res.dosage[0] && res.dosage[0].doseQuantity ? res.dosage[0].doseQuantity.value : '',
        res.dosage[0] && res.dosage[0].doseQuantity ? res.dosage[0].doseQuantity.unit : '', res.status);
}

function validateMedication(id, res) {
    res = JSON.parse(res);
    return new Medication(id, res.meta && res.meta.versionId ? res.meta.versionId : '', res.code && res.code.coding[0] ? res.code.coding[0].code : '',
        res.code && res.code.coding[0] ? res.code.coding[0].display : '', res.status);
}

async function getPatient(id, version) {
    await getPatientData(id, version).then(res => patient = validatePatient(id, res)).catch((err) => {
        console.log(`No version ${version} found for patient ${id}`);
        patient = { error: "No version found" }
    });
    return [patient];
}

async function getObservation(id, version) {
    await getObservationData(id, version).then(res => observation = validateObservation(id, res)).catch((err) => {
        console.log(`No version ${version} found for observation ${id}`);
        observation = { error: "No version found" }
    });
    return [observation];
}

async function getStatement(id, version) {
    await getStatementData(id, version).then(res => stmt = validateStatement(id, res)).catch((err) => {
        console.log(`No version ${version} found for statement ${id}`);
        stmt = { error: "No version found" }
    });
    return [stmt];
}

async function getMedication(id, version) {
    await getMedicationData(id, version).then(res => medication = validateMedication(id, res)).catch((err) => {
        console.log(`No version ${version} found for medication ${id}`);
        medication = { error: "No version found" }
    });
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

app.get('/getPatient', (req, res) => getPatient(req.query.id, req.query.version ? req.query.version : 0).then(patient => res.json(patient)));

app.get('/getPatientIDs', (req, res) => res.json(patientIDs));

app.get('/getPatients', (req, res) => getPatientPromises().then(() => res.json(patients)));

app.get('/getObservation', (req, res) => getObservation(req.query.id, req.query.version ? req.query.version : 0).then(observation => res.json(observation)));

app.get('/getObservationIDs', (req, res) => res.json(observationIDs));

app.get('/getObservations', (req, res) => getObservationPromises().then(() => res.json(observations)));

app.get('/getStatement', (req, res) => getStatement(req.query.id, req.query.version ? req.query.version : 0).then(stmt => res.json(stmt)));

app.get('/getStatementIDs', (req, res) => res.json(medicationStatementIDs));

app.get('/getStatements', (req, res) => getStatementPromises().then(() => res.json(statements)));

app.get('/getMedication', (req, res) => getMedication(req.query.id, req.query.version ? req.query.version : 0).then(medication => res.json(medication)));

app.get('/getMedicationIDs', (req, res) => res.json(medicationIDs));

app.get('/getMedications', (req, res) => getMedicatioPromises().then(() => res.json(medications)));

app.listen(port, () => console.log(`Node server listening on port ${port}`));
